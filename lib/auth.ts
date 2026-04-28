export type Profile = {
  name: string;
  avatar: string;
  grade: 4 | 8;
  createdAt: string;
  lastSeen: string;
};

const PROFILE_KEY = "desert-quest-profile";

export function saveProfile(name: string, avatar: string, grade: 4 | 8): void {
  if (typeof window === "undefined") return;

  const now = new Date().toISOString();
  const existing = getProfile();
  const profile: Profile = {
    name: name.trim(),
    avatar,
    grade,
    createdAt: existing?.createdAt ?? now,
    lastSeen: now,
  };

  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function getProfile(): Profile | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Profile;
    if (
      !parsed ||
      typeof parsed.name !== "string" ||
      typeof parsed.avatar !== "string" ||
      (parsed.grade !== 4 && parsed.grade !== 8) ||
      typeof parsed.createdAt !== "string" ||
      typeof parsed.lastSeen !== "string"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearProfile(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PROFILE_KEY);
}

export function isLoggedIn(): boolean {
  return getProfile() !== null;
}
