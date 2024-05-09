import { render } from '@testing-library/react'
import React from 'react'
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
