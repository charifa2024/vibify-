// Your personal library lives in json-server (db.json), reached through "/api".
// (The music catalog itself comes from Audius — see audius.js.)
// We store lightweight *snapshots* of tracks so the library renders instantly
// without re-fetching every track from Audius.

async function request(path, options = {}) {
  const res = await fetch('/api' + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) throw new Error('API error ' + res.status)
  return res.json()
}

// Keep only the fields we need to display and replay a track later.
export function snapshot(track) {
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    artistId: track.artistId,
    cover: track.cover,
    duration: track.duration
  }
}

export const api = {
  // Liked songs (the track's Audius id is used as the record id)
  getLikes: () => request('/likes'),
  like: (track) => request('/likes', { method: 'POST', body: JSON.stringify(snapshot(track)) }),
  unlike: (id) => request(`/likes/${id}`, { method: 'DELETE' }),

  // Your playlists
  getPlaylists: () => request('/playlists'),
  createPlaylist: (name) =>
    request('/playlists', { method: 'POST', body: JSON.stringify({ name, tracks: [] }) }),
  updatePlaylist: (id, data) =>
    request(`/playlists/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deletePlaylist: (id) => request(`/playlists/${id}`, { method: 'DELETE' })
}
