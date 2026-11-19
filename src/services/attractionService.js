import { restApi } from "./apiClient";
import { ApiError } from "./apiError";
import { deleteFile, uploadImage } from "./storageService";
import { normalizeText } from "../utils/validation";

const PHOTO_BUCKET = "trip-photos";
const RETURN_ROW = { Prefer: "return=representation" };
const SELECT_WITH_PHOTOS = "*,attraction_photos(id,image_url,image_path,created_at)";
const PHOTO_ORDER = { "attraction_photos.order": "created_at.asc" };

// photos: [{ id, uri, path }] in the order they were added. `path` is null for
// photos that are links (migrated from the old single-photo column).
function toAttraction(row) {
  return {
    id: row.id,
    tripId: row.trip_id,
    name: row.name,
    description: row.description ?? "",
    photos: (row.attraction_photos ?? []).map((photo) => ({
      id: photo.id,
      uri: photo.image_url,
      path: photo.image_path,
    })),
    createdAt: row.created_at,
  };
}

function notFoundError() {
  return new ApiError("This attraction no longer exists.", {
    status: 404,
    code: "not_found",
  });
}

function toRow(values) {
  const description = values.description.trim();
  return { name: normalizeText(values.name), description: description || null };
}

function deletePhotoFiles(paths) {
  return Promise.all(paths.filter(Boolean).map((path) => deleteFile(PHOTO_BUCKET, path)));
}

// Uploads the new local photos ({ uri, mimeType }). If one fails, the files
// that were already uploaded are removed again.
async function uploadPhotos(photos, userId) {
  const uploaded = [];
  try {
    for (const photo of photos) {
      uploaded.push(await uploadImage(PHOTO_BUCKET, userId, photo));
    }
  } catch (error) {
    await deletePhotoFiles(uploaded.map((file) => file.path));
    throw error;
  }
  return uploaded;
}

async function insertPhotoRows(attractionId, uploaded) {
  if (uploaded.length === 0) return;
  await restApi.post(
    "/attraction_photos",
    uploaded.map((file) => ({
      attraction_id: attractionId,
      image_url: file.url,
      image_path: file.path,
    })),
  );
}

export async function listAttractions(tripId) {
  const { data } = await restApi.get("/attractions", {
    params: {
      select: SELECT_WITH_PHOTOS,
      trip_id: `eq.${tripId}`,
      order: "created_at.asc",
      ...PHOTO_ORDER,
    },
  });
  return data.map(toAttraction);
}

export async function getAttraction(attractionId) {
  const { data } = await restApi.get("/attractions", {
    params: { select: SELECT_WITH_PHOTOS, id: `eq.${attractionId}`, ...PHOTO_ORDER },
  });
  if (data.length === 0) throw notFoundError();
  return toAttraction(data[0]);
}

// values.photos contains only new local photos when creating.
export async function createAttraction(tripId, values, userId) {
  const uploaded = await uploadPhotos(values.photos, userId);

  let row;
  try {
    ({ data: [row] } = await restApi.post(
      "/attractions",
      { trip_id: tripId, ...toRow(values) },
      { headers: RETURN_ROW },
    ));
  } catch (error) {
    await deletePhotoFiles(uploaded.map((file) => file.path));
    throw error;
  }

  try {
    await insertPhotoRows(row.id, uploaded);
  } catch (error) {
    // Undo the attraction, so saving again does not create a duplicate.
    await restApi.delete("/attractions", { params: { id: `eq.${row.id}` } }).catch(() => {});
    await deletePhotoFiles(uploaded.map((file) => file.path));
    throw error;
  }
  return { id: row.id };
}

// values.photos mixes kept photos (with `id`) and new local photos (without).
export async function updateAttraction(attraction, values, userId) {
  const keptIds = new Set(values.photos.filter((photo) => photo.id).map((photo) => photo.id));
  const removed = attraction.photos.filter((photo) => !keptIds.has(photo.id));
  const uploaded = await uploadPhotos(
    values.photos.filter((photo) => !photo.id),
    userId,
  );

  try {
    const { data } = await restApi.patch("/attractions", toRow(values), {
      params: { id: `eq.${attraction.id}` },
      headers: RETURN_ROW,
    });
    if (data.length === 0) throw notFoundError();

    // Remove first, so the new photos fit within the limit of the database.
    if (removed.length > 0) {
      await restApi.delete("/attraction_photos", {
        params: { id: `in.(${removed.map((photo) => photo.id).join(",")})` },
      });
    }
    await insertPhotoRows(attraction.id, uploaded);
  } catch (error) {
    await deletePhotoFiles(uploaded.map((file) => file.path));
    throw error;
  }

  await deletePhotoFiles(removed.map((photo) => photo.path));
}

// The photo rows are removed by the database (on delete cascade).
export async function deleteAttraction(attraction) {
  await restApi.delete("/attractions", { params: { id: `eq.${attraction.id}` } });
  await deletePhotoFiles(attraction.photos.map((photo) => photo.path));
}
