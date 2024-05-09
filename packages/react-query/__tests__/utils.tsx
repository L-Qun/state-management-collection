import { render } from '@testing-library/react'
import React, { useEffect, useState } from 'react'
import { QueryClientProvider, QueryClient } from '../src'

export function renderWithClient(
  client: QueryClient,
  ui: React.ReactElement,
): ReturnType<typeof render> {
  const result = render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  )
  return result
}

export function Blink({
  duration,
  children,
}: {
  duration: number
  children: React.ReactNode
}) {
  const [shouldShow, setShouldShow] = useState(true)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setShouldShow(false)
    }, duration)
    return () => {
      clearTimeout(timeout)
    }
  }, [duration])

  return shouldShow ? <>{children}</> : <>off</>
}
