import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Error de Autenticación | ContentFlow',
  description: 'Error en el proceso de autenticación',
}

export default function AuthCodeErrorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 