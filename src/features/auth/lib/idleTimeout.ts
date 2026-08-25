/** Idle timeout: AFK quá lâu → bắt đăng nhập lại. */
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000

const LAST_ACTIVITY_KEY = 'aros_last_activity_at'
const IDLE_EXPIRED_FLAG_KEY = 'aros_idle_expired'

function canUseSessionStorage() {
  try {
    return typeof sessionStorage !== 'undefined'
  } catch {
    return false
  }
}

/** Ghi nhận thao tác gần nhất (click, gõ phím, đổi trang…). */
export function touchActivity(now = Date.now()) {
  if (!canUseSessionStorage()) return
  try {
    sessionStorage.setItem(LAST_ACTIVITY_KEY, String(now))
  } catch {
    // ignore
  }
}

export function getLastActivityAt(): number | null {
  if (!canUseSessionStorage()) return null
  try {
    const raw = sessionStorage.getItem(LAST_ACTIVITY_KEY)
    if (!raw) return null
    const value = Number(raw)
    return Number.isFinite(value) ? value : null
  } catch {
    return null
  }
}

/** true nếu đã có mốc activity và đã quá IDLE_TIMEOUT_MS. */
export function isIdleTimedOut(now = Date.now()): boolean {
  const last = getLastActivityAt()
  if (last === null) return false
  return now - last >= IDLE_TIMEOUT_MS
}

export function clearActivityTracking() {
  if (!canUseSessionStorage()) return
  try {
    sessionStorage.removeItem(LAST_ACTIVITY_KEY)
  } catch {
    // ignore
  }
}

export function markIdleExpiredFlag() {
  if (!canUseSessionStorage()) return
  try {
    sessionStorage.setItem(IDLE_EXPIRED_FLAG_KEY, '1')
  } catch {
    // ignore
  }
}

export function consumeIdleExpiredFlag(): boolean {
  if (!canUseSessionStorage()) return false
  try {
    const hit = sessionStorage.getItem(IDLE_EXPIRED_FLAG_KEY) === '1'
    sessionStorage.removeItem(IDLE_EXPIRED_FLAG_KEY)
    return hit
  } catch {
    return false
  }
}

/** Số ms còn lại trước khi idle timeout; 0 nếu đã quá hạn. */
export function getIdleRemainingMs(now = Date.now()): number | null {
  const last = getLastActivityAt()
  if (last === null) return null
  return Math.max(IDLE_TIMEOUT_MS - (now - last), 0)
}
