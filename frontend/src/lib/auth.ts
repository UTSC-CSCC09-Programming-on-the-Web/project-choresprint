import { api } from "../api"

export async function isAuthenticated(): Promise<boolean> {
  try {
    const res = await api.get("/auth/me")
    return !!res.data?.id
  } catch {
    return false
  }
}
