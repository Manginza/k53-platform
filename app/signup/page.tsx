import { redirect } from 'next/navigation'

// Public signup is disabled — access is arranged via WhatsApp and an
// admin-issued access code. Redirect any old links to the home page.
export default function SignupPage() {
  redirect('/')
}
