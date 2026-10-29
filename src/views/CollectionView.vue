<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { audius } from '../audius.js'
import { usePlayerStore } from '../stores/player.js'
import { formatCount } from '../utils.js'
import SongList from '../components/SongList.vue'

const route = useRoute()
const player = usePlayerStore()
const collection = ref(null)
const tracks = ref([])

onMounted(async () => {
  const id = route.params.id
  ;[collection.value, tracks.value] = await Promise.all([
    audius.getCollection(id),
    audius.getCollectionTracks(id)
  ])
})
</script>

<template>
  <div v-if="collection">
    <header class="hero">
      <img :src="collection.cover" alt="" />
      <div>
        <div class="small">{{ collection.isAlbum ? 'Album' : 'Playlist' }}</div>
        <h1 class="big">{{ collection.title }}</h1>
        <router-link v-if="collection.ownerId" :to="`/artist/${collection.ownerId}`" class="small owner">
          <b>{{ collection.owner }}</b>
        </router-link>
        <div class="small muted">
          {{ tracks.length }} songs
          <template v-if="collection.totalPlays"> · {{ formatCount(collection.totalPlays) }} plays</template>
        </div>
      </div>
    </header>

    <div class="page">
      <div class="toolbar">
        <button class="big-play" title="Play" :disabled="!tracks.length" @click="player.playList(tracks, 0)">
          <svg viewBox="0 0 24 24" width="22"><path d="M7 4v16l13-8z" fill="currentColor"/></svg>
        </button>
      </div>
      <p v-if="collection.description" class="muted desc">{{ collection.description }}</p>
      <SongList :songs="tracks" />
    </div>
  </div>
  <div v-else class="page muted">Loading…</div>
</template>

<style scoped>
.owner:hover { text-decoration: underline; }
.desc { max-width: 640px; margin-bottom: 12px; }
.toolbar { margin-bottom: 16px; }
</style>
