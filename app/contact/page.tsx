import type { Metadata } from 'next'
import { ContactClient } from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact — Aditya Jadhav',
  description:
    'Say hi. Send a project, an idea, or a hard problem worth chasing — I read every message.',
}

export default function ContactPage() {
  return <ContactClient />
}
