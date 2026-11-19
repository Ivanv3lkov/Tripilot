import { restApi } from "./apiClient";
import { ApiError } from "./apiError";
import { deleteFile, resolveImageFields } from "./storageService";
import { toDateOnly } from "../utils/date";
import { normalizeText } from "../utils/validation";

const PHOTO_BUCKET = "trip-photos";
const RETURN_ROW = { Prefer: "return=representation" };

function toTrip(row) {
  return {
    id: row.id,
    title: row.title,
    location: row.location,
    visitDate: row.visit_date,
    description: row.description ?? "",
    category: row.category,
    rating: row.rating ?? 0,
    isFavorite: row.is_favorite,
    imageUrl: row.image_url,
    imagePath: row.image_path,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function notFoundError() {
  return new ApiError("This trip no longer exists.", {
    status: 404,
    code: "not_found",
  });
}

function toRow(values) {
  const description = values.description.trim();
  return {
    title: normalizeText(values.title),
    location: normalizeText(values.location),
    visit_date: toDateOnly(values.visitDate),
    description: description || null,
    category: values.category,
    rating: values.rating > 0 ? values.rating : null,
    is_favorite: values.isFavorite,
  };
}

function deletePhoto(path) {
  return deleteFile(PHOTO_BUCKET, path);
}

function resolveImage(values, userId, current) {
  return resolveImageFields(values, PHOTO_BUCKET, userId, current);
}

export async function listTrips() {
  const { data } = await restApi.get("/trips", {
    params: { select: "*", order: "visit_date.desc,created_at.desc" },
  });
  return data.map(toTrip);
}

export async function getTrip(tripId) {
  const { data } = await restApi.get("/trips", {
    params: { select: "*", id: `eq.${tripId}` },
  });
  if (data.length === 0) throw notFoundError();
  return toTrip(data[0]);
}

export async function createTrip(values, userId) {
  const image = await resolveImage(values, userId, null);
  try {
    const { data } = await restApi.post(
      "/trips",
      { ...toRow(values), ...image },
      { headers: RETURN_ROW },
    );
    return toTrip(data[0]);
  } catch (error) {
    await deletePhoto(image.image_path);
    throw error;
  }
}

export async function updateTrip(trip, values, userId) {
  const image = await resolveImage(values, userId, trip);
  const isNewPhoto = image.image_path !== trip.imagePath;
  let data;
  try {
    ({ data } = await restApi.patch(
      "/trips",
      { ...toRow(values), ...image },
      { params: { id: `eq.${trip.id}` }, headers: RETURN_ROW },
    ));
  } catch (error) {
    if (isNewPhoto) await deletePhoto(image.image_path);
    throw error;
  }
  if (data.length === 0) {
    if (isNewPhoto) await deletePhoto(image.image_path);
    throw notFoundError();
  }
  if (isNewPhoto) await deletePhoto(trip.imagePath);
  return toTrip(data[0]);
}

export async function setFavorite(tripId, isFavorite) {
  const { data } = await restApi.patch(
    "/trips",
    { is_favorite: isFavorite },
    { params: { id: `eq.${tripId}` }, headers: RETURN_ROW },
  );
  if (data.length === 0) throw notFoundError();
  return toTrip(data[0]);
}

// Attractions are removed by the database (on delete cascade); their photo
// files are collected first so they can be deleted from Storage too.
export async function deleteTrip(trip) {
  let attractionPhotos = [];
  try {
    const { data } = await restApi.get("/attractions", {
      params: { select: "attraction_photos(image_path)", trip_id: `eq.${trip.id}` },
    });
    attractionPhotos = data
      .flatMap((row) => row.attraction_photos ?? [])
      .map((photo) => photo.image_path)
      .filter(Boolean);
  } catch {
    // Orphaned files are harmless; deleting the trip matters more.
  }
  await restApi.delete("/trips", { params: { id: `eq.${trip.id}` } });
  await Promise.all([trip.imagePath, ...attractionPhotos].map(deletePhoto));
}
