import { v4 as uuidv4 } from 'uuid'
import { SessionInfo } from '@/types'

// Generate a new session ID
export function generateSessionId(): string {
  return uuidv4()
}

// Validate session ID format
export function isValidSessionId(sessionId: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(sessionId)
}

// Extract session ID from request headers
export function getSessionFromRequest(request: Request): SessionInfo {
  const sessionId = request.headers.get('x-session-id')

  if (!sessionId) {
    // Generate new session ID if none provided
    return {
      sessionId: generateSessionId(),
      isNew: true,
    }
  }

  if (!isValidSessionId(sessionId)) {
    // Generate new session ID if invalid format
    return {
      sessionId: generateSessionId(),
      isNew: true,
    }
  }

  return {
    sessionId,
    isNew: false,
  }
}

// Create response headers with session ID
export function createSessionHeaders(
  sessionId: string
): Record<string, string> {
  return {
    'X-Session-Id': sessionId,
    'Access-Control-Expose-Headers': 'X-Session-Id',
  }
}

// Add session headers to a NextResponse
export function addSessionHeaders(response: Response, sessionId: string): void {
  response.headers.set('X-Session-Id', sessionId)
  response.headers.set('Access-Control-Expose-Headers', 'X-Session-Id')
}

// Client-side session management for cart
export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') {
    // Server-side: generate temporary session ID
    return generateSessionId()
  }

  // Client-side: check localStorage first, then cookies
  let sessionId = localStorage.getItem('sessionId')

  if (!sessionId) {
    // Try to get from cookie as fallback
    sessionId = getCookie('sessionId')
  }

  if (!sessionId) {
    sessionId = generateSessionId()
    setSessionId(sessionId)
  }

  return sessionId
}

export function setSessionId(sessionId: string): void {
  if (typeof window === 'undefined') return

  // Store in both localStorage and cookie
  localStorage.setItem('sessionId', sessionId)
  setCookie('sessionId', sessionId, {
    expires: 30, // 30 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  })
}

export function clearSessionId(): void {
  if (typeof window === 'undefined') return

  localStorage.removeItem('sessionId')
  deleteCookie('sessionId')
}

// Cookie helper functions
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null
  }
  return null
}

interface CookieOptions {
  expires?: number // days
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  path?: string
}

function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  if (typeof document === 'undefined') return

  let cookieString = `${name}=${value}`

  if (options.expires) {
    const date = new Date()
    date.setTime(date.getTime() + options.expires * 24 * 60 * 60 * 1000)
    cookieString += `; expires=${date.toUTCString()}`
  }

  if (options.path) {
    cookieString += `; path=${options.path}`
  } else {
    cookieString += '; path=/'
  }

  if (options.secure) {
    cookieString += '; secure'
  }

  if (options.sameSite) {
    cookieString += `; samesite=${options.sameSite}`
  }

  document.cookie = cookieString
}

function deleteCookie(name: string): void {
  setCookie(name, '', { expires: -1 })
}
