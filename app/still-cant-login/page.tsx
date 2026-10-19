/**
 * /still-cant-login — the second option after "Forgot your password?" for a
 * client who has paid but still cannot get in. See StillCantLoginForm.
 */
import type { Metadata } from 'next'
import StillCantLoginForm from '@/components/StillCantLoginForm'

export const metadata: Metadata = {
  title: "Still can't log in?",
  description: 'Paid but cannot get into your SK Driving account? Send us your proof of payment.',
  robots: { index: false, follow: false },
}

export default function StillCantLoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <StillCantLoginForm />
    </main>
  )
}
