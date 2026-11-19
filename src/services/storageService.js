import { storageApi } from "./apiClient";

const MIME_EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
};

// Uploads a local image ({ uri, mimeType }) to "<bucket>/<userId>/<file>" and
// returns its public URL and Storage path. Both buckets are public for reading.
export async function uploadImage(bucket, userId, { uri, mimeType }) {
  const type = MIME_EXTENSIONS[mimeType] ? mimeType : "image/jpeg";
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${MIME_EXTENSIONS[type]}`;
  const path = `${userId}/${fileName}`;

  // React Native streams the local file from `uri`; axios lets RN set the multipart boundary.
  const body = new FormData();
  body.append("file", { uri, name: fileName, type });
  await storageApi.post(`/object/${bucket}/${path}`, body);

  return {
    url: `${storageApi.defaults.baseURL}/object/public/${bucket}/${path}`,
    path,
  };
}

// Best-effort: an orphaned file is harmless, so errors are ignored.
export async function deleteFile(bucket, path) {
  if (!path) return;
  try {
    await storageApi.delete(`/object/${bucket}/${path}`);
  } catch {
    // Nothing else to do.
  }
}

// Resolves the image of a form that offers "upload a photo" or "paste a link".
// values: { imageMode: "photo" | "url", imageUrl, photo }; current: the saved
// { imageUrl, imagePath } or null. Uploads a newly picked photo first.
export async function resolveImageFields(values, bucket, userId, current) {
  if (values.imageMode === "url") {
    const url = values.imageUrl.trim();
    return { image_url: url || null, image_path: null };
  }
  if (!values.photo) return { image_url: null, image_path: null };
  if (values.photo.path && values.photo.path === current?.imagePath) {
    return { image_url: current.imageUrl, image_path: current.imagePath };
  }
  const { url, path } = await uploadImage(bucket, userId, values.photo);
  return { image_url: url, image_path: path };
}
