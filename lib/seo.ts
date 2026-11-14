import type { Metadata } from 'next'
import { IDENTITY } from '../content/site'

export const SITE_ORIGIN = 'https://jadhavaditya.com'
export const FULL_NAME = `${IDENTITY.firstName} ${IDENTITY.lastName}`
export const HOME_TITLE = `${FULL_NAME} — Software Developer`
export const HOME_DESCRIPTION =
  'Aditya Jadhav is a software developer based in India who builds backend services, AI agents, and data pipelines. Explore his projects and official profiles.'

export function pageMetadata(
  path: `/${string}`,
  title: string,
  description: string,
): Metadata {
  const url = new URL(path, SITE_ORIGIN).href
  const socialTitle = path === '/' ? title : `${title} | ${FULL_NAME}`
  const image = {
    url: '/portfolio-card',
    width: 1200,
    height: 630,
    alt: `${FULL_NAME} — Software Developer Portfolio`,
  }

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: socialTitle,
      description,
      url,
      siteName: FULL_NAME,
      type: 'website',
      locale: 'en_IN',
      images: [image],
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
      images: [image],
      creator: '@jadhavadityaa',
    },
  }
}
