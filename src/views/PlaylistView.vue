<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLibraryStore } from '../stores/library.js'
import { usePlayerStore } from '../stores/player.js'
import { streamUrl } from '../audius.js'
import SongList from '../components/SongList.vue'

const route = useRoute()
const router = useRouter()
const library = useLibraryStore()
const player = usePlayerStore()
const id = Number(route.params.id)

// The playlist comes from the store, so add/remove updates the page instantly.
const playlist = computed(() => library.playlists.find((p) => p.id === id))
// Snapshots carry no stream URL; rebuild it so the tracks are playable.
const songs = computed(() => (playlist.value?.tracks || []).map((t) => ({ ...t, file: streamUrl(t.id) })))

async function rename() {
  const name = prompt('Rename playlist:', playlist.value.name)
  if (name && name.trim()) await library.renamePlaylist(id, name.trim())
}

async function remove() {
  if (!confirm(`Delete "${playlist.value.name}"?`)) return
  await library.deletePlaylist(id)
  router.push('/')
}
</script>

<template>
  <div v-if="playlist">
    <header class="hero">
      <div class="cover">♪</div>
      <div>
        <div class="small">Playlist</div>
        <h1 class="big">{{ playlist.name }}</h1>
        <div class="small muted">{{ songs.length }} songs</div>
      </div>
    </header>
    <div class="page">
      <div class="toolbar">
        <button class="big-play" title="Play" :disabled="!songs.length" @click="player.playList(songs, 0)">
          <svg viewBox="0 0 24 24" width="22"><path d="M7 4v16l13-8z" fill="currentColor"/></svg>
        </button>
        <button class="outline-btn" @click="rename">Rename</button>
        <button class="outline-btn" @click="remove">Delete</button>
      </div>
      <SongList :songs="songs" removable @remove="(sid) => library.removeFromPlaylist(id, sid)" />
      <p v-if="!songs.length" class="muted small">Use the ⋯ menu next to any song to add it here.</p>
    </div>
  </div>
  <div v-else class="page muted">Loading…</div>
</template>

<style scoped>
.cover { width: 200px; height: 200px; border-radius: 6px; display: grid; place-items: center; font-size: 80px; background: linear-gradient(135deg, #450af5, #8e8ee5); box-shadow: 0 8px 40px rgba(0,0,0,.5); flex-shrink: 0; }
.toolbar { display: flex; align-items: center; gap: 16px; }
</style>
