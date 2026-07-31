
A ANIKOTO API

Documentation
Overview

Pull a list of recent anime, or one show with every episode and links you can drop into a player. Genres and similar tags are included when we have them. Every reply tells you if it worked (ok); long lists also tell you which page you are on (pagination).

Base URL
https://anikotoapi.site

Intended for server-side use: call the API from your backend, cache or store results in your own database, and serve your users from there. Avoid calling this API directly from production front-end JavaScript — it wastes your users' rate limits and is easier to abuse.

Calling this from every visitor's browser can hit 429 (too many requests) quickly; ongoing abuse may lead to an IP 403 ban. Use your own server in between.
Endpoints
GET https://anikotoapi.site/recent-anime
Optional query: page, per_page. Returns a page of anime. Rows may include terms_by_type (e.g. genre → list of names).
GET https://anikotoapi.site/series/{id}
Replace {id} with the anime id from the list. Returns anime plus episodes; each episode has embed_url.sub / embed_url.dub when available.
Rate limits

Up to 60 requests per IP every 120 seconds.

If a limit trips you get 429; very heavy or abusive traffic may get 403. Headers like X-RateLimit-* are sent when limits are on.
Try it

curl -s "https://anikotoapi.site/recent-anime?page=1&per_page=5"
curl -s "https://anikotoapi.site/series/1"

Free Anikoto Anime API - Daily updates & embeds, maintained for developers.
