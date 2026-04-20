import { type FormEvent } from 'react'
import { PageLayout, Card } from '../../components/layout'
import { Input, Button } from '../../components/ui'
import { useForm } from '../../hooks/useForm'
import { useLogin } from '../../hooks/useLogin'
import './styles.css'

export default function LoginPage() {
  const { state, actions } = useForm()
  const { login } = useLogin()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    actions.clearErrors()
    
    // Validate form
    if (!actions.validateForm()) {
      return
    }
    
    // Set loading state
    actions.setLoading(true)
    
    // Attempt login
    await login(
      state.email,
      state.password,
      (error) => {
        // Handle error
        if (error.field) {
          actions.setFieldError(error.field, error.message)
        } else {
          actions.setGeneralError(error.message)
        }
        actions.setLoading(false)
      },
      () => {
        // Handle success
        actions.setLoading(false)
        actions.reset()
      }
    )
  }

  return (
    <PageLayout className="login-layout">
      <Card variant="login">
        <div className="login-header">
          <h1 className="login-title">HealthPlus</h1>
          <p className="login-subtitle">Patient Login</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field-stack">
            <Input
              type="text"
              placeholder="Email address"
              value={state.email}
              onChange={actions.setEmail}
              error={state.errors.email}
              disabled={state.loading}
              autoComplete="email"
            />
            <Input
              type="password"
              placeholder="Password"
              value={state.password}
              onChange={actions.setPassword}
              error={state.errors.password}
              disabled={state.loading}
              autoComplete="current-password"
            />
            {state.generalError && (
              <div className="general-error" role="alert">
                {state.generalError}
              </div>
            )}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={state.loading}
              disabled={state.loading}
            >
              {state.loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </div>
        </form>
      </Card>
    </PageLayout>
  )
}


