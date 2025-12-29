import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LoginForm } from '@/components/auth/LoginForm'
import { SignupForm } from '@/components/auth/SignupForm'
import { AuthProvider } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

// Mock the hooks and modules
jest.mock('@/hooks/use-toast')
jest.mock('@/utils/api')
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

const mockToast = jest.fn()
;(useToast as jest.Mock).mockReturnValue({ toast: mockToast })

const renderWithAuth = (component: React.ReactElement) => {
  return render(
    <AuthProvider>
      {component}
    </AuthProvider>
  )
}

describe('Authentication Components', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('LoginForm', () => {
    it('renders login form correctly', () => {
      renderWithAuth(<LoginForm />)
      
      expect(screen.getByText('Welcome Back')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    })

    it('validates required fields', async () => {
      renderWithAuth(<LoginForm />)
      
      const submitButton = screen.getByRole('button', { name: /sign in/i })
      fireEvent.click(submitButton)

      // Form should not submit without required fields
      expect(screen.getByPlaceholderText('your@email.com')).toBeRequired()
      expect(screen.getByPlaceholderText('Enter your password')).toBeRequired()
    })

    it('toggles password visibility', () => {
      renderWithAuth(<LoginForm />)
      
      const passwordInput = screen.getByPlaceholderText('Enter your password')
      const toggleButton = screen.getByRole('button', { name: '' }) // Eye icon button
      
      expect(passwordInput).toHaveAttribute('type', 'password')
      
      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'text')
      
      fireEvent.click(toggleButton)
      expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  describe('SignupForm', () => {
    it('renders signup form correctly', () => {
      renderWithAuth(<SignupForm />)
      
      expect(screen.getByText('Join Dada Devs')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('John')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Doe')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('your@email.com')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Create a strong password')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('validates password length', () => {
      renderWithAuth(<SignupForm />)
      
      const passwordInput = screen.getByPlaceholderText('Create a strong password')
      expect(passwordInput).toHaveAttribute('minLength', '6')
      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument()
    })

    it('shows password strength indicator', () => {
      renderWithAuth(<SignupForm />)
      
      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument()
    })
  })
})