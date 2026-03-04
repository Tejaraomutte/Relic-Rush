const ROUND_START_KEY_PREFIX = 'roundStartConfig:'

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

export const getRoundPath = (roundNumber) => {
  if (Number(roundNumber) === 1) return '/round1'
  if (Number(roundNumber) === 2) return '/round2'
  return '/round3'
}

export const getRoundStartKey = (roundNumber) => `${ROUND_START_KEY_PREFIX}${Number(roundNumber)}`

export const setRoundStartConfig = (roundState) => {
  const roundNumber = Number(roundState?.roundNumber)
  if (![1, 2, 3].includes(roundNumber)) return

  const startedAtMs = roundState?.startedAt ? new Date(roundState.startedAt).getTime() : Date.now()
  const endsAtMs = roundState?.endsAt
    ? new Date(roundState.endsAt).getTime()
    : startedAtMs + (toNumber(roundState?.durationSeconds, 600) * 1000)

  const payload = {
    roundNumber,
    durationSeconds: toNumber(roundState?.durationSeconds, 600),
    startedAtMs,
    endsAtMs
  }

  localStorage.setItem(getRoundStartKey(roundNumber), JSON.stringify(payload))
}

export const getRoundStartConfig = (roundNumber) => {
  try {
    const raw = localStorage.getItem(getRoundStartKey(roundNumber))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const clearRoundStartConfig = (roundNumber) => {
  localStorage.removeItem(getRoundStartKey(roundNumber))
}

export const getRoundRemainingSeconds = (roundNumber, fallbackDuration = 600) => {
  const state = getRoundStartConfig(roundNumber)
  if (!state) {
    return toNumber(fallbackDuration, 600)
  }

  const endsAtMs = toNumber(state.endsAtMs, 0)
  if (!endsAtMs) {
    return toNumber(state.durationSeconds, fallbackDuration)
  }

  return Math.max(Math.ceil((endsAtMs - Date.now()) / 1000), 0)
}

export const isRoundStartActive = (roundNumber) => {
  const state = getRoundStartConfig(roundNumber)
  if (!state) return false

  const endsAtMs = toNumber(state.endsAtMs, 0)
  return endsAtMs > Date.now()
}
