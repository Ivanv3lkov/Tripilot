import { restApi } from "./apiClient";
import { ApiError } from "./apiError";
import { deleteFile, uploadImage } from "./storageService";

const AVATAR_BUCKET = "avatars";
const RETURN_ROW = { Prefer: "return=representation" };

function toProfile(row) {
  return {
    id: row.id,
    avatarUrl: row.avatar_url,
    avatarPath: row.avatar_path,
    createdAt: row.created_at,
  };
}

// The profile row is created by a database trigger on sign-up. If it is
// missing (for example, an account created before the trigger), create it.
export async function getProfile(userId) {
  const { data } = await restApi.get("/profiles", {
    params: { select: "*", id: `eq.${userId}` },
  });
  if (data.length > 0) return toProfile(data[0]);

  const { data: created } = await restApi.post(
    "/profiles",
    { id: userId },
    { headers: RETURN_ROW },
  );
  return toProfile(created[0]);
}

async function saveAvatar(profile, avatar) {
  const { data } = await restApi.patch(
    "/profiles",
    { avatar_url: avatar.url, avatar_path: avatar.path },
    { params: { id: `eq.${profile.id}` }, headers: RETURN_ROW },
  );
  if (data.length === 0) {
    throw new ApiError("Your profile could not be found.", {
      status: 404,
      code: "not_found",
    });
  }
  return toProfile(data[0]);
}

export async function updateAvatar(profile, photo) {
  const uploaded = await uploadImage(AVATAR_BUCKET, profile.id, photo);
  let updated;
  try {
    updated = await saveAvatar(profile, uploaded);
  } catch (error) {
    await deleteFile(AVATAR_BUCKET, uploaded.path);
    throw error;
  }
  await deleteFile(AVATAR_BUCKET, profile.avatarPath);
  return updated;
}

export async function removeAvatar(profile) {
  const updated = await saveAvatar(profile, { url: null, path: null });
  await deleteFile(AVATAR_BUCKET, profile.avatarPath);
  return updated;
}
