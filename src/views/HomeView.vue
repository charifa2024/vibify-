<script setup>
import { ref, onMounted } from 'vue'
import { audius, GENRES } from '../audius.js'
import { usePlayerStore } from '../stores/player.js'
import MediaCard from '../components/MediaCard.vue'

const player = usePlayerStore()
const tracks = ref([])
const playlists = ref([])
const genre = ref('')       // '' = all genres
const loading = ref(true)

const hour = new Date().getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

async function loadTrending() {
  loading.value = true
  try {
    tracks.value = await audius.trending(genre.value || undefined)
  } finally {
    loading.value = false
  }
}

function setGenre(g) {
  genre.value = genre.value === g ? '' : g
  loadTrending()
}

onMounted(async () => {
  await loadTrending()
  audius.trendingPlaylists().then((p) => (playlists.value = p.slice(0, 12))).catch(() => {})
})
</script>

<template>
  <div class="page">
    <h1>{{ greeting }}</h1>

    <div class="chips">
      <button
        v-for="g in GENRES"
        :key="g"
        class="chip"
        :class="{ on: genre === g }"
        @click="setGenre(g)"
      >{{ g }}</button>
    </div>

    <h2>{{ genre ? genre + ' — trending' : 'Trending now' }}</h2>
    <p v-if="loading" class="muted">Loading…</p>
    <div v-else class="grid">
      <MediaCard
        v-for="(t, i) in tracks"
        :key="t.id"
        :item="t"
        @play="player.playList(tracks, i)"
      />
    </div>

    <template v-if="playlists.length">
      <h2>Trending playlists</h2>
      <div class="grid">
        <MediaCard v-for="p in playlists" :key="p.id" :item="p" />
      </div>
    </template>
  </div>
</template>

<style scoped>
.chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
.chip { background: #232323; border: none; color: var(--text); padding: 8px 16px; border-radius: 999px; cursor: pointer; font-weight: 600; }
.chip:hover { background: #2e2e2e; }
.chip.on { background: var(--accent); color: #000; }
</style>
