import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from '../App'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

const renderApp = (initialPath = '/') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </MemoryRouter>
  )

describe('App routing', () => {
  it('renders landing page for unauthenticated users', () => {
    renderApp('/')
    expect(screen.getByText('Roadmapper AI')).toBeInTheDocument()
    expect(screen.getByText('Sign in')).toBeInTheDocument()
  })

  it('renders login page at /login', () => {
    renderApp('/login')
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
  })

  it('renders register page at /register', () => {
    renderApp('/register')
    expect(screen.getByRole('heading', { name: /get started/i })).toBeInTheDocument()
  })

  it('renders 404 page for unknown route', () => {
    renderApp('/this-route-does-not-exist')
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('redirects unauthenticated user from /student/dashboard to /login', () => {
    renderApp('/student/dashboard')
    // Should render login page content
    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument()
  })
})
