
MegaPlay API
Documentation
Documentation
Anikoto video API

HiAnime has shut down, but you can still use our API: we host the full HiAnime library for playback. To discover anime and episode IDs the way you used to scrape HiAnime, use the Anikoto API — Anikoto and HiAnime share the same library and server IDs, so legacy HiAnime episode IDs stay valid while Anikoto keeps recent series and episodes updated.
API Documentation

It's a complete solution for webmasters to start their own anime ready website using our easy API.
Note: Direct Access to Embed Links are Disabled. Links only work as Embed on your Websites, use this option to test your embed
Anikoto API (works like HiAnime)

HiAnime is no longer available, but you can still use the same anime library through Anikoto API.

You can:

    Get latest anime (with pagination)
    Load a full series using its ID
    Get episode embed URLs for streaming

Anikoto uses the same library and embed id system as HiAnime, so old HiAnime episode IDs will still work. Everything stays updated automatically.
Base URL
https://anikotoapi.site

    Recent anime
    GET /recent-anime?page=1&per_page=20
    Series + episodes
    GET /series/{id}
    Docs & demo
    https://anikotoapi.site/

Full docs, examples, and limits are available at https://anikotoapi.site/.
How It Works

Our service provides a reliable and efficient way to embed anime videos on your website without worrying about content availability or playback issues.
Reliability & Future-Proofing

By using our service, you're ensuring that your anime website has consistent content availability regardless of what happens with the original sources:
Long-term Solution: Our hosted content remains accessible even if the original source becomes unavailable or changes their access methods.

This makes our API the perfect long-term solution for anyone building a serious anime streaming platform that needs consistent content availability.
Usage

    Embedded Domain: https://megaplay.buzz/
    Endpoint (catalog episode id — Anikoto / legacy HiAnime): https://megaplay.buzz/stream/s-2/{aniwatch-ep-id}/{language}
    Endpoint (MAL id + episode): https://megaplay.buzz/stream/mal/{mal-id}/{ep-num}/{language}
    Endpoint (AniList id + episode): https://megaplay.buzz/stream/ani/{anilist-id}/{ep-num}/{language}

Your website isn't based on Aniwatch or HiAnime? No problem — you can still access our server videos by MAL or AniList using the endpoints above. To resolve catalog IDs and episode lists from the HiAnime-era library, use the Anikoto API first, then plug Embed IDs into /stream/s-2/… here.
Valid parameters (
/stream/s-2/…
URL)
Parameter 	Description 	Required
{aniwatch-ep-id} 	Stream id (episode_embed_id from Anikoto, or legacy HiAnime ?ep=) 	Yes
{language} 	Language version (sub/dub) 	Yes

For MAL/AniList URLs, use numeric {mal-id} or {anilist-id} and {ep-num} (episode number), then {language} as sub or dub.

Player events & tracking — monitor playback from your parent page (progress, complete, errors).
Where to find the episode ID?

Use the Anikoto API: call GET https://anikotoapi.site/series/{id} and read each episode’s episode_embed_id (same server id as the old HiAnime catalog). That id is what you pass as {aniwatch-ep-id} in https://megaplay.buzz/stream/s-2/{aniwatch-ep-id}/{language}

If you still have a numeric episode ID from when HiAnime was online, it continues to work here
Pro tip: Start from GET https://anikotoapi.site/recent-anime to browse IDs, then open /series/{id} for the full episode list and embed hints before building your MegaPlay iframe URLs.
Embed Example

URL: https://megaplay.buzz/stream/s-2/136197/dub
<iframe src="https://megaplay.buzz/stream/s-2/136197/dub" width="100%" height="100%" frameborder="0" scrolling="no" allowfullscreen></iframe>
Player Events (auto-next & watch time)

The player sends events to the parent page using postMessage. You can listen from the page where the iframe is embedded (auto-next, track user play time, etc.).
Basic listener
window.addEventListener("message", function (event) {
  let data = event.data;

  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (e) {
      return;
    }
  }

  if (data.channel === "megacloud") {
    console.log(data);
  }

  if (data.type === "watching-log") {
    console.log(data);
  }
});
Events
Event 	Description
time 	Sent during playback with current position and progress.
complete 	Sent when playback reaches the end of the episode.
error 	Sent when playback fails.
watching-log 	Sent during playback — current time and duration (check data.type === "watching-log").
Event data
{
  event: "time",
  time: number,
  duration: number,
  percent: number
}
{
  type: "watching-log",
  currentTime: number,
  duration: number
}
Example usage
if (data.event === "complete") {
  // handle episode completion
}

if (data.event === "time") {
  // handle progress updates
}

if (data.type === "watching-log") {
  // handle watch time / logging
}

In production, check event.origin matches your MegaPlay embed URL before trusting messages.
MAL / AniList coverage
Warning: We have the full library on our servers, but not every show is synced or mapped to MAL and AniList IDs yet. If an embed using MAL or AniList doesn’t work, contact us with the form below — we’ll add or fix the mapping.
Request a missing title

If a MAL or AniList ID doesn’t resolve even though the anime exists on our side, send the details below.
ID type
ID
Episode number (optional)
Message
Test Your Embed

Generate iframe code and preview. Episode id (from Anikoto / same as legacy HiAnime), or MAL/AniList + episode.
Source
Episode ID (Anikoto / legacy HiAnime):
Language:
