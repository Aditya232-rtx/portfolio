import type { MetadataRoute } from 'next'
import { NAV_LINKS, PROJECTS } from '@/content/site'
import { SITE_ORIGIN } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    ...NAV_LINKS.map(({ href }) => href),
    ...PROJECTS.map(({ id }) => `/work/${id}`),
  ]

  return routes.map((href) => ({ url: new URL(href, SITE_ORIGIN).href }))
}
