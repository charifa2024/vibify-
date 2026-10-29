<script setup>
import { ref, watch } from 'vue'
import { audius } from '../audius.js'
import SongList from '../components/SongList.vue'
import MediaCard from '../components/MediaCard.vue'

const query = ref('')
const tracks = ref([])
const artists = ref([])
const collections = ref([])
const loading = ref(false)
let timer = null
let token = 0

// Wait 350ms after the user stops typing, then search tracks + artists + playlists.
watch(query, (q) => {
  clearTimeout(timer)
  const term = q.trim()
  if (!term) { tracks.value = []; artists.value = []; collections.value = []; return }
  timer = setTimeout(async () => {
    const mine = ++token
    loading.value = true
    try {
      const [t, a, c] = await Promise.all([
        audius.searchTracks(term).catch(() => []),
        audius.searchArtists(term).catch(() => []),
        audius.searchCollections(term).catch(() => [])
      ])
      if (mine !== token) return
      tracks.value = t
      artists.value = a.slice(0, 6)
      collections.value = c.slice(0, 6)
    } finally {
      if (mine === token) loading.value = false
    }
  }, 350)
})
</script>

<template>
  <div class="page">
    <input v-model="query" class="search" placeholder="What do you want to listen to?" autofocus />

    <template v-if="query.trim()">
      <p v-if="loading" class="muted">Searching…</p>

      <template v-else>
        <template v-if="artists.length">
          <h2>Artists</h2>
          <div class="grid">
            <MediaCard v-for="a in artists" :key="a.id" :item="a" />
          </div>
        </template>

        <template v-if="tracks.length">
          <h2>Songs</h2>
          <SongList :songs="tracks" />
        </template>

        <template v-if="collections.length">
          <h2>Albums & Playlists</h2>
          <div class="grid">
            <MediaCard v-for="c in collections" :key="c.id" :item="c" />
          </div>
        </template>

        <p v-if="!tracks.length && !artists.length && !collections.length" class="muted">
          No results for "{{ query }}".
        </p>
      </template>
    </template>

    <template v-else>
      <h2>Search Audius</h2>
      <p class="muted">Find songs, artists, albums and playlists from the Audius network.</p>
    </template>
  </div>
</template>

<style scoped>
.search { width: 100%; max-width: 420px; padding: 12px 20px; border-radius: 999px; border: none; background: #242424; color: var(--text); font-size: 15px; outline: none; }
.search:focus { box-shadow: 0 0 0 2px var(--text); }
</style>
