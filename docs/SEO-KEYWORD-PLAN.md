# SEO keyword plan

Research snapshot: 15 November 2026. Recheck Search Console and Bing Webmaster Tools after the new pages are crawled and performance reports have accumulated.

## Evidence and limits

- Google Search Console has the domain property and sitemap. At the time of this review, its Performance report showed no clicks or impressions yet, so it cannot support search-volume or position estimates.
- Bing Webmaster Tools Keyword Research returned no related-keyword rows and no trend estimates for the tested name and role phrases. Its URL ranking lists showed `jadhavaditya.com` near the top for `Aditya Jadhav software developer India`, `Aditya Jadhav backend developer`, and `Aditya Jadhav AI developer`; for the broad `Aditya Jadhav` query, the site did not appear in the first ten results shown.
- Public results show several unrelated people with the same name, including other developer portfolios. That makes unqualified name searches competitive and increases the value of consistent, corroborated identity signals.
- Search Console and Bing Webmaster Tools are the first-party sources for this site's eventual query, click, impression, and position data. No search volume is claimed here where the tools returned none.

## Target map

| Priority | Query cluster | Target page | Intent |
| --- | --- | --- | --- |
| 1 | Aditya Jadhav; Aditya Jadhav software developer; Aditya Jadhav India | `/` | Find and verify the person and official portfolio |
| 2 | Aditya Jadhav backend developer; backend software developer India; production backend systems | `/` and `/work` | Evaluate engineering experience |
| 2 | Aditya Jadhav AI developer; AI agents developer; data pipelines developer | `/` and `/work` | Find applied AI and data project work |
| 3 | ThirdDoor AI discovery / RAG; SpillTheReel searchable video; CrowdShield crowd safety computer vision; Credexa document verification; Ouroboros autonomous security agents; Drishtikosh accessible AI learning | Matching `/work/{project}` page | Research a named project or its technical subject |
| 3 | Aditya Jadhav GitHub; Aditya Jadhav LinkedIn; Aditya Jadhav Instagram | `/` plus the corresponding official profile | Find the correct social account |

## Work completed for these targets

- Homepage title, description, canonical, and visible bio identify Aditya Jadhav as a software developer in India working on backend systems, AI agents, and data pipelines.
- Added crawlable project detail routes generated from the portfolio's project source data. Each route has a unique title, description, canonical URL, visible project overview, role, technologies, and `CreativeWork` JSON-LD.
- Linked each work item to its own detail route and added those URLs to the generated sitemap.
- The homepage `Person` structured data links the portfolio to the official GitHub, LinkedIn, X, and Instagram profiles.

## Measurement

After deployment, resubmit the sitemap in both webmaster tools and monitor weekly. In Search Console, review queries and positions for the exact-name cluster and each project page; in Bing, review Search Performance and rerun Keyword Research. Compare a 28-day period only after data is available. Record impressions, clicks, CTR, average position, and indexed URL status before changing titles or copy again.

## Off-site consistency

Use the same name, role, India location, and portfolio URL on profiles you control. Keep a direct link to `https://jadhavaditya.com` prominent on GitHub and LinkedIn, and connect project pages from the relevant public repositories. These are recommendations for profile owners; this repository does not change external profiles.
