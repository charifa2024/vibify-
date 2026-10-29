<script setup>
import { useLibraryStore } from '../stores/library.js'
import { usePlayerStore } from '../stores/player.js'
import SongList from '../components/SongList.vue'

const library = useLibraryStore()
const player = usePlayerStore()
</script>

<template>
  <div>
    <header class="hero">
      <div class="cover">
        <svg viewBox="0 0 24 24" width="80"><path d="M12 21s-7.5-4.6-10-9.3C.6 8.6 2.2 5.5 5.3 5.5c1.9 0 3.1 1 3.7 2 .6-1 1.8-2 3.7-2 3.1 0 4.7 3.1 3.3 6.2C19.5 16.4 12 21 12 21z" fill="#fff"/></svg>
      </div>
      <div>
        <div class="small">Playlist</div>
        <h1 class="big">Liked Songs</h1>
        <div class="small muted">{{ library.likedTracks.length }} songs</div>
      </div>
    </header>
    <div class="page">
      <div class="toolbar">
        <button class="big-play" title="Play" :disabled="!library.likedTracks.length" @click="player.playList(library.likedTracks, 0)">
          <svg viewBox="0 0 24 24" width="22"><path d="M7 4v16l13-8z" fill="currentColor"/></svg>
        </button>
      </div>
      <SongList :songs="library.likedTracks" />
      <p v-if="!library.likedTracks.length" class="muted small">Tap the heart on any song to save it here.</p>
    </div>
  </div>
</template>

<style scoped>
.cover { width: 200px; height: 200px; border-radius: 6px; display: grid; place-items: center; background: linear-gradient(135deg, #4a00c0, #c86dd7); box-shadow: 0 8px 40px rgba(0,0,0,.5); flex-shrink: 0; }
.toolbar { margin-bottom: 16px; }
</style>
