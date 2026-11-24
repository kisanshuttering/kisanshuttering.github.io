# Kisan Shuttering source-code rectification report
Date: 24 November 2026
Source archive: kisanshuttering.github.io-main.zip

## User-confirmed business facts
- Primary domain: https://kisanshuttering.com/
- Prop Jack size: 2.5 m to 4.5 m
- Delivery is coordinated from the main yard or yards; do not claim a separate warehouse, branch or stockyard in every service city.
- Current approved service areas represented in the main sitemap: Gurgaon, Noida, Farukhnagar, Sohna, Jaipur and Kota.

## Changes made in this working copy
1. Replaced www canonical-domain references with the non-www HTTPS domain across source text files.
2. Updated Prop Jack sizing to 2.5 m to 4.5 m across the main product and service pages.
3. Replaced service-area hub / regional-direct labels with service-area wording.
4. Removed LocalBusiness schema and city-specific postal addresses from the six active city landing pages; replaced those records with Service schema and an Organization provider.
5. Corrected the U-head wording in the materials catalogue to U Jack.
6. Corrected the homepage spelling error MASS CIVIL CONSTRACTS to MASS CIVIL CONTRACTS.
7. Reworded multiple yard, regional coordinator, stockyard, direct local-rate and dispatch claims on the six active city pages to describe availability confirmation and coordinated dispatch.
8. Marked ten non-current/future-expansion location pages noindex,follow and added a visible notice that current service availability is not confirmed.
9. Removed unconfirmed future-expansion cities from the XML sitemap.
10. Updated sitemap and robots.txt to use https://kisanshuttering.com/.
11. Added styling for the future service-area notice.

## Validation performed on the edited source
- HTML files parsed with BeautifulSoup for the key homepage, catalogue and six active service pages.
- Titles and canonical tags were present on those key pages.
- No old Prop Jack ranges remained in those eight key pages.
- All 12 sitemap URLs mapped to files in the archive.
- Sitemap contains 12 approved URLs.

## Important limitations / manual review still required
- These are edits to a local working copy only. Nothing has been pushed to GitHub or deployed.
- A full browser test of forms, WhatsApp, phone actions, images, mobile breakpoints and runtime JavaScript has not been performed.
- The actual build (`npm run build`) has not yet been executed.
- The site contains a number of old city pages which are now noindex and excluded from the sitemap, but their long-form content still needs editorial cleanup before they are ever reactivated.
- Confirm the exact main-yard address before publishing any physical address or LocalBusiness schema.
- Review the generated pages and approve the content before deployment.
