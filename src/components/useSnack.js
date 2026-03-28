import { useState } from 'react'

export function useSnack() {
  const [snack, setSnack] = useState(null)

  function showSnack(msg, type = 'success') {
    setSnack({ msg, type })
    window.setTimeout(() => setSnack(null), 2800)
  }

  return { snack, showSnack }
}
