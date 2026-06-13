const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000"
const STORAGE_KEY = "userId"

export async function apiFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const userId = localStorage.getItem(STORAGE_KEY)
  return fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
      ...(userId ? { "X-User-Id": userId } : {}),
    },
  })
}
