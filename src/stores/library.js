// Library store: the user's liked songs + playlists (shared by the sidebar,
// the player and the pages). Tracks are stored as snapshots (see api.snapshot).
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api, snapshot } from '../api.js'
import { streamUrl } from '../audius.js'

// Snapshots have no stream URL; rebuild it so they're playable.
const playable = (t) => ({ ...t, file: streamUrl(t.id) })

export const useLibraryStore = defineStore('library', () => {
  const likes = ref([])        // array of track snapshots
  const playlists = ref([])    // [{ id, name, tracks: [snapshot] }]

  const likedIds = computed(() => new Set(likes.value.map((t) => t.id)))
  const likedTracks = computed(() => likes.value.map(playable))

  const isLiked = (id) => likedIds.value.has(id)

  async function fetchLibrary() {
    ;[likes.value, playlists.value] = await Promise.all([api.getLikes(), api.getPlaylists()])
  }

  async function toggleLike(track) {
    if (isLiked(track.id)) {
      await api.unlike(track.id)
      likes.value = likes.value.filter((t) => t.id !== track.id)
    } else {
      likes.value.unshift(snapshot(track))
      await api.like(track)
    }
  }

  async function createPlaylist(name) {
    const p = await api.createPlaylist(name)
    playlists.value.push(p)
    return p
  }

  async function deletePlaylist(id) {
    await api.deletePlaylist(id)
    playlists.value = playlists.value.filter((p) => p.id !== id)
  }

  async function renamePlaylist(id, name) {
    const p = playlists.value.find((p) => p.id === id)
    if (!p) return
    Object.assign(p, await api.updatePlaylist(id, { name }))
  }

  async function addToPlaylist(playlistId, track) {
    const p = playlists.value.find((p) => p.id === playlistId)
    if (!p || p.tracks.some((t) => t.id === track.id)) return
    Object.assign(p, await api.updatePlaylist(p.id, { tracks: [...p.tracks, snapshot(track)] }))
  }

  async function removeFromPlaylist(playlistId, trackId) {
    const p = playlists.value.find((p) => p.id === playlistId)
    if (!p) return
    Object.assign(p, await api.updatePlaylist(p.id, { tracks: p.tracks.filter((t) => t.id !== trackId) }))
  }

  return {
    likes, playlists, likedTracks, isLiked,
    fetchLibrary, toggleLike,
    createPlaylist, deletePlaylist, renamePlaylist, addToPlaylist, removeFromPlaylist
  }
})
