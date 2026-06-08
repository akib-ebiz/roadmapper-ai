import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from '../App'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const renderApp = () =>
  render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  )

describe('App', () => {
  it('renders the home page with Roadmapper AI heading', () => {
    renderApp()
    expect(screen.getByText('Roadmapper AI')).toBeInTheDocument()
  })
})
