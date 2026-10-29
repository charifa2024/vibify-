<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { audius } from '../audius.js'
import { usePlayerStore } from '../stores/player.js'
import { formatCount } from '../utils.js'
import SongList from '../components/SongList.vue'

const route = useRoute()
const player = usePlayerStore()
const artist = ref(null)
const tracks = ref([])

onMounted(async () => {
  const id = route.params.id
  artist.value = await audius.getArtist(id)
  tracks.value = await audius.getArtistTracks(id)
})
</script>

<template>
  <div v-if="artist">
    <header class="hero" :style="artist.banner ? `background-image: linear-gradient(transparent, var(--surface)), url(${artist.banner})` : ''">
      <img v-if="artist.cover" :src="artist.cover" alt="" class="avatar" />
      <div v-else class="avatar placeholder">{{ artist.name.charAt(0) }}</div>
      <div>
        <div class="small">Artist {{ artist.isVerified ? '· ✔ Verified' : '' }}</div>
        <h1 class="big">{{ artist.name }}</h1>
        <div class="small">
          {{ formatCount(artist.followerCount) }} followers · {{ formatCount(artist.trackCount) }} tracks
        </div>
      </div>
    </header>

    <div class="page">
      <div class="toolbar">
        <button class="big-play" title="Play" :disabled="!tracks.length" @click="player.playList(tracks, 0)">
          <svg viewBox="0 0 24 24" width="22"><path d="M7 4v16l13-8z" fill="currentColor"/></svg>
        </button>
      </div>

      <p v-if="artist.bio" class="bio muted">{{ artist.bio }}</p>

      <h2>Popular</h2>
      <SongList :songs="tracks" />
    </div>
  </div>
  <div v-else class="page muted">Loading…</div>
</template>

<style scoped>
.hero { background-size: cover; background-position: center; }
.avatar { width: 200px; height: 200px; border-radius: 50%; object-fit: cover; box-shadow: 0 8px 40px rgba(0,0,0,.5); flex-shrink: 0; }
.avatar.placeholder { display: grid; place-items: center; font-size: 80px; font-weight: 800; background: linear-gradient(135deg, #450af5, #8e8ee5); }
.bio { max-width: 640px; margin-bottom: 8px; white-space: pre-wrap; }
.toolbar { margin-bottom: 16px; }
</style>
