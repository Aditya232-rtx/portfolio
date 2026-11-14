import { pageMetadata } from '@/lib/seo'
import { ContactClient } from './ContactClient'

export const metadata = pageMetadata(
  '/contact',
  'Contact',
  'Contact Aditya Jadhav about backend engineering, AI agents, or data projects. Find his email and official GitHub, LinkedIn, and Instagram profiles.',
)

export default function ContactPage() {
  return <ContactClient />
}
