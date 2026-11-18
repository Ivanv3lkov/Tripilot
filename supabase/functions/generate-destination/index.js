// Admin-only Edge Function: generates a destination (country or city) with five
// attractions using OpenAI, attaches Unsplash photos, and saves it to the shared
// catalogue. App users never call this function.
//
// Required secrets (supabase secrets set ...):
//   ADMIN_TOKEN, OPENAI_API_KEY, OPENAI_MODEL, UNSPLASH_ACCESS_KEY
// Provided automatically by Supabase: SUPABASE_URL, SUPABASE_SECRET_KEYS
// (falls back to the legacy SUPABASE_SERVICE_ROLE_KEY).
//
// Talks to the database through the PostgREST API with plain fetch (no SDK).

const ATTRACTION_COUNT = 5;
const NAME_PATTERN = /^[\p{L}\p{M}][\p{L}\p{M} .'’-]*$/u;
const UNSPLASH_UTM = "utm_source=tripilot&utm_medium=referral";

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function json(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function requireEnv(name) {
  const value = Deno.env.get(name);
  if (!value) throw new HttpError(500, "Server is not configured.");
  return value;
}

function timingSafeEqual(a, b) {
  const encoder = new TextEncoder();
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  let diff = left.length ^ right.length;
  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    diff |= (left[i] ?? 0) ^ (right[i] ?? 0);
  }
  return diff === 0;
}

function normalizeName(value, field, { required }) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new HttpError(400, `${field} is required.`);
    return null;
  }
  if (typeof value !== "string") throw new HttpError(400, `${field} must be text.`);
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length < 1 || normalized.length > 80 || !NAME_PATTERN.test(normalized)) {
    throw new HttpError(400, `${field} is invalid.`);
  }
  return normalized;
}

function getSecretKey() {
  const secretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");
  if (secretKeys) {
    try {
      const key = JSON.parse(secretKeys).default;
      if (key) return key;
    } catch {
      // Fall through to the legacy key.
    }
  }
  return requireEnv("SUPABASE_SERVICE_ROLE_KEY");
}

// Minimal PostgREST client. Bypasses RLS with the secret key (server only).
function createRestClient() {
  const baseUrl = `${requireEnv("SUPABASE_URL").replace(/\/+$/, "")}/rest/v1`;
  const secretKey = getSecretKey();
  const headers = { apikey: secretKey, "Content-Type": "application/json" };
  // Legacy service_role keys are JWTs and must also be sent as a Bearer token.
  if (secretKey.startsWith("eyJ")) headers.Authorization = `Bearer ${secretKey}`;

  return async function rest(method, path, { params, body, prefer } = {}) {
    const query = params ? `?${new URLSearchParams(params)}` : "";
    const response = await fetch(`${baseUrl}${path}${query}`, {
      method,
      headers: prefer ? { ...headers, Prefer: prefer } : headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    const text = await response.text();
    const data = text ? JSON.parse(text) : null;
    return { ok: response.ok, status: response.status, data };
  };
}

// NAME_PATTERN excludes LIKE wildcards (%, _, *), so ilike here is an exact,
// case-insensitive match.
async function findDestination(rest, country, city) {
  const { ok, data } = await rest("GET", "/destinations", {
    params: {
      select: "*,attractions(*)",
      country: `ilike.${country}`,
      city: city ? `ilike.${city}` : "is.null",
      limit: "1",
    },
  });
  if (!ok) throw new HttpError(500, "Database read failed.");
  return data[0] ?? null;
}

const generationSchema = {
  type: "object",
  additionalProperties: false,
  required: ["is_real_place", "description", "image_query", "attractions"],
  properties: {
    is_real_place: { type: "boolean" },
    description: { type: "string" },
    image_query: { type: "string" },
    attractions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "description", "image_query"],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          image_query: { type: "string" },
        },
      },
    },
  },
};

async function generateContent(country, city) {
  const place = city ? `${city}, ${country}` : country;
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${requireEnv("OPENAI_API_KEY")}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(45000),
    body: JSON.stringify({
      model: requireEnv("OPENAI_MODEL"),
      response_format: {
        type: "json_schema",
        json_schema: { name: "destination", strict: true, schema: generationSchema },
      },
      messages: [
        {
          role: "system",
          content:
            "You write short, factual travel content. Only describe real, well-known places. " +
            "Never invent places, facts, or URLs. If the destination is not a real country or " +
            "city in that country, set is_real_place to false.",
        },
        {
          role: "user",
          content:
            `Destination: ${place}.\n` +
            "Return: a 2-3 sentence description of the destination; " +
            `exactly ${ATTRACTION_COUNT} interesting, real attractions located in it, each with a ` +
            "1-2 sentence description; and for the destination and each attraction a short English " +
            "photo search query (for example 'Colosseum Rome').",
        },
      ],
    }),
  });

  if (!response.ok) throw new HttpError(502, "AI service is unavailable.");
  const body = await response.json();
  const content = body?.choices?.[0]?.message?.content;
  let result;
  try {
    result = JSON.parse(content);
  } catch {
    throw new HttpError(502, "AI service returned an invalid response.");
  }
  return result;
}

function validateContent(result) {
  if (!result.is_real_place) throw new HttpError(422, "Destination is not a real place.");

  const clean = (text, max) => (typeof text === "string" ? text.trim() : "").slice(0, max);
  const description = clean(result.description, 2000);
  const attractions = (result.attractions ?? []).map((item) => ({
    name: clean(item.name, 120),
    description: clean(item.description, 1000),
    imageQuery: clean(item.image_query, 100),
  }));

  const names = new Set(attractions.map((item) => item.name.toLowerCase()));
  const valid =
    description &&
    attractions.length === ATTRACTION_COUNT &&
    names.size === ATTRACTION_COUNT &&
    attractions.every((item) => item.name && item.description && item.imageQuery);
  if (!valid) throw new HttpError(422, "AI response did not pass validation.");

  return { description, imageQuery: clean(result.image_query, 100), attractions };
}

async function findUnsplashPhoto(queries) {
  const headers = {
    Authorization: `Client-ID ${requireEnv("UNSPLASH_ACCESS_KEY")}`,
    "Accept-Version": "v1",
  };

  for (const query of queries.filter(Boolean)) {
    const url =
      "https://api.unsplash.com/search/photos?per_page=1&orientation=landscape&content_filter=high&query=" +
      encodeURIComponent(query);
    const response = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new HttpError(502, "Image service is unavailable.");
    const photo = (await response.json())?.results?.[0];
    if (!photo) continue;

    // Unsplash API guideline: register the "download" when an app selects a photo.
    await fetch(photo.links.download_location, { headers }).catch(() => {});

    return {
      imageUrl: photo.urls.regular, // hotlinked, as required by Unsplash
      sourceUrl: `${photo.links.html}?${UNSPLASH_UTM}`,
    };
  }
  throw new HttpError(422, `No photo found for "${queries[0]}".`);
}

async function saveDestination(rest, country, city, content, photos) {
  const inserted = await rest("POST", "/destinations", {
    prefer: "return=representation",
    body: {
      country,
      city,
      description: content.description,
      image_url: photos.destination.imageUrl,
      source_url: photos.destination.sourceUrl,
      content_source: "ai",
    },
  });

  if (inserted.data?.code === "23505") return findDestination(rest, country, city);
  if (!inserted.ok) throw new HttpError(500, "Could not save destination.");
  const destination = inserted.data[0];

  const rows = content.attractions.map((item, index) => ({
    destination_id: destination.id,
    name: item.name,
    description: item.description,
    image_url: photos.attractions[index].imageUrl,
    source_url: photos.attractions[index].sourceUrl,
    content_source: "ai",
  }));
  const attractions = await rest("POST", "/attractions", {
    prefer: "return=minimal",
    body: rows,
  });
  if (!attractions.ok) {
    // Keep the catalogue consistent: no destination without its attractions.
    await rest("DELETE", "/destinations", { params: { id: `eq.${destination.id}` } });
    throw new HttpError(500, "Could not save attractions.");
  }

  return findDestination(rest, country, city);
}

Deno.serve(async (request) => {
  try {
    if (request.method !== "POST") throw new HttpError(405, "Method not allowed.");

    const token = request.headers.get("x-admin-token") ?? "";
    if (!timingSafeEqual(token, requireEnv("ADMIN_TOKEN"))) {
      throw new HttpError(401, "Unauthorized.");
    }

    let body;
    try {
      body = await request.json();
    } catch {
      throw new HttpError(400, "Body must be JSON.");
    }
    const country = normalizeName(body?.country, "country", { required: true });
    const city = normalizeName(body?.city, "city", { required: false });

    const rest = createRestClient();

    const existing = await findDestination(rest, country, city);
    if (existing) return json(200, { created: false, destination: existing });

    const content = validateContent(await generateContent(country, city));
    const place = city ? `${city} ${country}` : country;

    const photos = {
      destination: await findUnsplashPhoto([content.imageQuery, place]),
      attractions: [],
    };
    for (const item of content.attractions) {
      photos.attractions.push(await findUnsplashPhoto([item.imageQuery, `${item.name} ${place}`]));
    }

    const destination = await saveDestination(rest, country, city, content, photos);
    return json(201, { created: true, destination });
  } catch (error) {
    const status = error instanceof HttpError ? error.status : 500;
    if (status === 500 && !(error instanceof HttpError)) console.error("generate-destination failed");
    return json(status, { error: error instanceof HttpError ? error.message : "Unexpected error." });
  }
});
