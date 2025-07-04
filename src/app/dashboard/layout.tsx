import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | ContentFlow',
  description: 'Panel principal de ContentFlow',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 