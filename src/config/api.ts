const TOKEN_KEY = 'shop-jwt'

export function isApiEnabled(): boolean {
  return typeof import.meta !== 'undefined' && Boolean(String(import.meta.env.VITE_API_URL ?? '').trim())
}

export function getApiBaseUrl(): string {
  return String(import.meta.env.VITE_API_URL ?? '')
    .trim()
    .replace(/\/$/, '')
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setStoredToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* ignore */
  }
}

export function clearStoredToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export function getAdminApiKey(): string {
  return String(import.meta.env.VITE_ADMIN_API_KEY ?? '').trim()
}
