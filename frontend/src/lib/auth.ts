import { api } from "../api"

export interface AuthStatus {
  authed: boolean
  subscriptionRequired: boolean
  user?: any
}

export async function getAuthStatus(): Promise<AuthStatus> {
  try {
    const res = await api.get("/auth/me")
    return {
      authed: true,
      subscriptionRequired: res.data.subscriptionRequired,
      user: res.data,
    }
  } catch (_err: any) {
    return { authed: false, subscriptionRequired: false }
  }
}