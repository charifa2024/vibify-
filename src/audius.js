// Audius catalog client.
// Audius is a decentralized network: we first ask api.audius.co for a list of
// "discovery nodes", pick one, and make every catalog call against it.
// All of this is public, read-only data — no auth or API key is needed.
// Audius sends permissive CORS headers, so the browser can call it directly.

const APP = 'vibify'

// Host is resolved once and cached. `resolvedHost` is kept in sync so that
// streamUrl() can build audio URLs synchronously (any get() resolves it first).
let resolvedHost = 'https://discoveryprovider.audius.co'
let hostPromise = null

function pickHost() {
  if (!hostPromise) {
    hostPromise = fetch('https://api.audius.co')
      .then((r) => r.json())
      .then((d) => {
        const list = d.data || []
        if (list.length) resolvedHost = list[Math.floor(Math.random() * list.length)]
        return resolvedHost
      })
      .catch(() => resolvedHost) // fall back to the default node
  }
  return hostPromise
}

async function get(path, params = {}) {
  const host = await pickHost()
  const qs = new URLSearchParams({ app_name: APP, ...params })
  const res = await fetch(`${host}/v1${path}?${qs}`)
  if (!res.ok) throw new Error('Audius error ' + res.status)
  return (await res.json()).data
}

// The streamable audio URL for a track (redirects to the CDN mp3).
export function streamUrl(id) {
  return `${resolvedHost}/v1/tracks/${id}/stream?app_name=${APP}`
}

// Best available artwork / avatar from Audius' { "150x150", "480x480", ... } maps.
function pickImg(obj) {
  if (!obj) return ''
  return obj['480x480'] || obj['150x150'] || obj['1000x1000'] || ''
}

// --- Normalizers: turn Audius objects into the flat shape the UI expects ---

// A track. `file` is what the player feeds to <audio>.
function track(t) {
  if (!t) return null
  return {
    kind: 'track',
    id: t.id,
    title: t.title,
    artist: t.user?.name || 'Unknown artist',
    artistId: t.user?.id || null,
    artistHandle: t.user?.handle || '',
    cover: pickImg(t.artwork),
    file: streamUrl(t.id),
    duration: t.duration || 0,
    genre: t.genre || '',
    mood: t.mood || '',
    playCount: t.play_count || 0,
    favoriteCount: t.favorite_count || 0,
    repostCount: t.repost_count || 0,
    releaseDate: t.release_date || null
  }
}

// A collection = an Audius playlist or album.
function collection(c) {
  if (!c) return null
  return {
    kind: 'collection',
    id: c.id,
    title: c.playlist_name,
    isAlbum: !!c.is_album,
    owner: c.user?.name || 'Unknown',
    ownerId: c.user?.id || null,
    cover: pickImg(c.artwork),
    trackCount: c.track_count || 0,
    totalPlays: c.total_play_count || 0,
    favoriteCount: c.favorite_count || 0,
    description: c.description || ''
  }
}

// An artist (Audius "user").
function artist(u) {
  if (!u) return null
  return {
    kind: 'artist',
    id: u.id,
    name: u.name,
    handle: u.handle,
    bio: u.bio || '',
    cover: pickImg(u.profile_picture),
    banner: pickImg(u.cover_photo),
    followerCount: u.follower_count || 0,
    trackCount: u.track_count || 0,
    isVerified: !!u.is_verified
  }
}

// Some endpoints return a single object, others wrap it in a one-item array.
const unwrap = (d) => (Array.isArray(d) ? d[0] : d)

export const audius = {
  // Tracks
  trending: (genre) => get('/tracks/trending', genre ? { genre } : {}).then((a) => a.map(track)),
  searchTracks: (q) => get('/tracks/search', { query: q }).then((a) => a.map(track)),
  getTrack: (id) => get(`/tracks/${id}`).then((d) => track(unwrap(d))),
  getTracks: (ids) =>
    ids.length ? get('/tracks', { id: ids }).then((a) => a.map(track)) : Promise.resolve([]),

  // Collections (playlists + albums)
  trendingPlaylists: () => get('/playlists/trending').then((a) => a.map(collection)),
  searchCollections: (q) => get('/playlists/search', { query: q }).then((a) => a.map(collection)),
  getCollection: (id) => get(`/playlists/${id}`).then((d) => collection(unwrap(d))),
  getCollectionTracks: (id) => get(`/playlists/${id}/tracks`).then((a) => a.map(track)),

  // Artists
  searchArtists: (q) => get('/users/search', { query: q }).then((a) => a.map(artist)),
  getArtist: (id) => get(`/users/${id}`).then((d) => artist(unwrap(d))),
  getArtistTracks: (id) => get(`/users/${id}/tracks`, { sort: 'plays', limit: 40 }).then((a) => a.map(track))
}

// A short, popular-ish set of Audius genres for the Home page filter chips.
export const GENRES = [
  'Electronic', 'Hip-Hop/Rap', 'Lo-Fi', 'House', 'Techno',
  'Pop', 'Rock', 'R&B/Soul', 'Ambient', 'Trap', 'Dubstep'
]

// Lyrics via lyrics.ovh (proxied through Vite to dodge CORS; see vite.config.js).
// Coverage is partial — many indie tracks simply aren't in the database.
export async function fetchLyrics(artistName, title) {
  // Strip "(remix)", "feat. ...", bracketed tags etc. to improve the hit rate.
  const clean = (s) =>
    s.replace(/\([^)]*\)|\[[^\]]*\]/g, '').replace(/\b(feat|ft)\.?.*$/i, '').trim()
  const res = await fetch(`/lyrics/v1/${encodeURIComponent(clean(artistName))}/${encodeURIComponent(clean(title))}`)
  if (!res.ok) return null
  const data = await res.json().catch(() => null)
  return data?.lyrics?.trim() || null
}
