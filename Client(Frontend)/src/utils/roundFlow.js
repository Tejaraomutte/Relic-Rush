export function startTimer({
  duration,
  onTick,
  onTimeUp,
  isLocked = () => false,
  tickRate = 250
}) {
  const totalSeconds = Math.max(Number(duration) || 0, 0)
  const endTimestamp = Date.now() + totalSeconds * 1000
  let hasFiredTimeUp = false

  onTick(totalSeconds)

  const intervalId = window.setInterval(() => {
    if (isLocked()) {
      window.clearInterval(intervalId)
      return
    }

    const remainingSeconds = Math.max(Math.ceil((endTimestamp - Date.now()) / 1000), 0)
    onTick(remainingSeconds)

    if (remainingSeconds === 0 && !hasFiredTimeUp) {
      hasFiredTimeUp = true
      window.clearInterval(intervalId)
      onTimeUp?.()
    }
  }, tickRate)

  return () => window.clearInterval(intervalId)
}

export async function autoSubmitRound({
  submittedRef,
  lockRound,
  submitRound
}) {
  if (submittedRef.current) {
    return false
  }

  submittedRef.current = true
  lockRound?.()
  await submitRound()
  return true
}

export function showResults({ navigate, mode, resultData }) {
  navigate('/results', {
    state: {
      mode,
      resultData
    }
  })
}

function playSparkleTone() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return

    const audioContext = new AudioContextClass()
    const now = audioContext.currentTime
    const tones = [523.25, 659.25, 783.99]

    tones.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator()
      const gain = audioContext.createGain()

      oscillator.type = 'sine'
      oscillator.frequency.value = frequency

      gain.gain.setValueAtTime(0.0001, now + index * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.12, now + index * 0.08 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.25)

      oscillator.connect(gain)
      gain.connect(audioContext.destination)

      oscillator.start(now + index * 0.08)
      oscillator.stop(now + index * 0.08 + 0.26)
    })

    window.setTimeout(() => {
      audioContext.close().catch(() => {})
    }, 700)
  } catch (error) {
    console.warn('Sparkle sound unavailable:', error)
  }
}

export function triggerGenieReveal({
  setRevealActive,
  setInteractionLocked,
  setRevealPlayed
}) {
  setInteractionLocked?.(true)
  setRevealActive?.(true)
  playSparkleTone()

  window.setTimeout(() => {
    setRevealPlayed?.(true)
    setInteractionLocked?.(false)
  }, 4700)
}
