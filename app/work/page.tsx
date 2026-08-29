import type { Metadata } from 'next'
import { WorkClient } from './WorkClient'

export const metadata: Metadata = {
  title: 'Work — Aditya Jadhav',
  description:
    'Selected projects: autonomous security agents, credential infrastructure, and vision systems built to run in production.',
}

export default function WorkPage() {
  return <WorkClient />
}
