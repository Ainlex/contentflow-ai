import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Onboarding | ContentFlow',
  description: 'Configura tu cuenta de ContentFlow',
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 