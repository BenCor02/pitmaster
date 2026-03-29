import { useEffect, useRef, useState } from 'react'

export function useSnack() {
  const [snack, setSnack] = useState(null)
  const timerRef = useRef(null)

  function showSnack(msg, type = 'success') {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setSnack({ msg, type })
    timerRef.current = window.setTimeout(() => {
      setSnack(null)
      timerRef.current = null
    }, 2800)
  }

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
  }, [])

  return { snack, showSnack }
}
