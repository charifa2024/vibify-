<script setup>
import { usePlayerStore } from '../stores/player.js'
import { useLibraryStore } from '../stores/library.js'
import { formatTime } from '../utils.js'

const player = usePlayerStore()
const library = useLibraryStore()
</script>

<template>
  <footer>
    <!-- Left: current track -->
    <div class="now">
      <template v-if="player.current">
        <img :src="player.current.cover" alt="" />
        <div class="meta">
          <div class="title">{{ player.current.title }}</div>
          <router-link
            v-if="player.current.artistId"
            :to="`/artist/${player.current.artistId}`"
            class="muted small artist"
          >{{ player.current.artist }}</router-link>
          <div v-else class="muted small">{{ player.current.artist }}</div>
        </div>
        <button
          class="icon-btn like"
          :class="{ liked: library.isLiked(player.current.id) }"
          title="Save to Liked Songs"
          @click="library.toggleLike(player.current)"
        >
          <svg viewBox="0 0 24 24" width="16"><path d="M12 21s-7.5-4.6-10-9.3C.6 8.6 2.2 5.5 5.3 5.5c1.9 0 3.1 1 3.7 2 .6-1 1.8-2 3.7-2 3.1 0 4.7 3.1 3.3 6.2C19.5 16.4 12 21 12 21z" :fill="library.isLiked(player.current.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8"/></svg>
        </button>
      </template>
      <span v-else class="muted small">Pick a song to start listening</span>
    </div>

    <!-- Center: controls + progress -->
    <div class="center">
      <div class="controls">
        <button class="icon-btn" :class="{ on: player.shuffle }" title="Shuffle" @click="player.toggleShuffle">
          <svg viewBox="0 0 24 24" width="18"><path d="M3 7h3l3 4m9-4h-3l-7 10H3m18 0h-3l-2.5-3.5M18 4l3 3-3 3M18 14l3 3-3 3" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button class="icon-btn" title="Previous" @click="player.prev">
          <svg viewBox="0 0 24 24" width="18"><path d="M6 5h2v14H6zM20 5v14L9 12z" fill="currentColor"/></svg>
        </button>
        <button class="play" :title="player.isPlaying ? 'Pause' : 'Play'" @click="player.toggle">
          <svg v-if="player.isPlaying" viewBox="0 0 24 24" width="18"><path d="M6 5h4v14H6zM14 5h4v14h-4z" fill="currentColor"/></svg>
          <svg v-else viewBox="0 0 24 24" width="18"><path d="M7 4v16l13-8z" fill="currentColor"/></svg>
        </button>
        <button class="icon-btn" title="Next" @click="player.next()">
          <svg viewBox="0 0 24 24" width="18"><path d="M16 5h2v14h-2zM4 5v14l11-7z" fill="currentColor"/></svg>
        </button>
        <button class="icon-btn" :class="{ on: player.repeat !== 'off' }" :title="`Repeat: ${player.repeat}`" @click="player.cycleRepeat">
          <svg viewBox="0 0 24 24" width="18"><path d="M17 3l3 3-3 3M7 21l-3-3 3-3M20 6H9a5 5 0 0 0-5 5M4 18h11a5 5 0 0 0 5-5" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
          <span v-if="player.repeat === 'one'" class="one">1</span>
        </button>
      </div>
      <div class="progress">
        <span class="small muted">{{ formatTime(player.currentTime) }}</span>
        <input
          type="range" min="0" step="0.1"
          :max="player.duration || 0"
          :value="player.currentTime"
          @input="player.seek(+$event.target.value)"
        />
        <span class="small muted">{{ formatTime(player.duration) }}</span>
      </div>
    </div>

    <!-- Right: Now Playing panel toggle + volume -->
    <div class="right">
      <button class="icon-btn" :class="{ on: player.showPanel }" title="Queue & lyrics" @click="player.togglePanel">
        <svg viewBox="0 0 24 24" width="18"><path d="M4 6h10M4 12h10M4 18h7M17 10v8m0-8l3 1.5M17 18a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <svg class="vol-icon" viewBox="0 0 24 24" width="18"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7" stroke="currentColor" stroke-width="2" fill="none"/></svg>
      <input
        type="range" min="0" max="1" step="0.01"
        :value="player.volume"
        @input="player.setVolume(+$event.target.value)"
      />
    </div>
  </footer>
</template>

<style scoped>
footer { display: grid; grid-template-columns: 1fr 2fr 1fr; align-items: center; padding: 0 16px; gap: 16px; }
.now { display: flex; align-items: center; gap: 12px; min-width: 0; }
.now img { width: 56px; height: 56px; border-radius: 4px; background: #2a2a2a; }
.meta { min-width: 0; }
.title { font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.artist:hover { color: var(--text); text-decoration: underline; }
.like.liked { color: var(--accent); }
.center { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.controls { display: flex; align-items: center; gap: 16px; }
.icon-btn.on { color: var(--accent); }
.icon-btn { position: relative; }
.one { position: absolute; top: -2px; right: 0; font-size: 9px; font-weight: 700; }
.play { width: 36px; height: 36px; border-radius: 50%; border: none; background: var(--text); color: #000; display: grid; place-items: center; cursor: pointer; }
.play:hover { transform: scale(1.06); }
.progress { display: flex; align-items: center; gap: 8px; width: 100%; max-width: 560px; }
.progress input { flex: 1; }
.right { display: flex; align-items: center; justify-content: flex-end; gap: 10px; color: var(--muted); }
.right input { width: 100px; }

@media (max-width: 760px) {
  footer { grid-template-columns: 1fr auto; }
  .center { grid-column: 1 / -1; order: 3; }
  .right { display: none; }
}
</style>
