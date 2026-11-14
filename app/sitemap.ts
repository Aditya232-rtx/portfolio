import type { MetadataRoute } from 'next'
import { NAV_LINKS } from '@/content/site'
import { SITE_ORIGIN } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  return NAV_LINKS.map(({ href }) => ({ url: new URL(href, SITE_ORIGIN).href }))
}
