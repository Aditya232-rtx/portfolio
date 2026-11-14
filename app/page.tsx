import { SOCIALS } from '@/content/site'
import { FULL_NAME, HOME_DESCRIPTION, HOME_TITLE, pageMetadata, SITE_ORIGIN } from '@/lib/seo'
import { HomeClient } from './HomeClient'

export const metadata = pageMetadata('/', HOME_TITLE, HOME_DESCRIPTION)

const homeUrl = new URL('/', SITE_ORIGIN).href
const websiteId = `${homeUrl}#website`
const personId = `${homeUrl}#aditya-jadhav`

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': websiteId,
      url: homeUrl,
      name: FULL_NAME,
      inLanguage: 'en',
      publisher: { '@id': personId },
    },
    {
      '@type': 'ProfilePage',
      '@id': `${homeUrl}#profile`,
      url: homeUrl,
      name: HOME_TITLE,
      isPartOf: { '@id': websiteId },
      mainEntity: {
        '@type': 'Person',
        '@id': personId,
        name: FULL_NAME,
        url: homeUrl,
        jobTitle: 'Software Developer',
        description: 'Software developer based in India building backend services, AI agents, and data pipelines.',
        sameAs: SOCIALS.map(({ href }) => href),
      },
    },
  ],
}

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
        }}
      />
      <HomeClient />
    </>
  )
}
