import { LoginForm } from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Editor Login',
  robots: 'noindex',
}

export default function LoginPage() {
  return (
    <main className="bg-surface flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-text-primary text-2xl font-bold">Portfolio Editor</h1>
          <p className="text-text-muted mt-2 text-sm">Enter your email to receive a magic link</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
