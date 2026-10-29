<script setup>
// Right-side panel: the upcoming queue and lyrics for the current track.
import { ref, watch } from 'vue'
import { usePlayerStore } from '../stores/player.js'
import { fetchLyrics } from '../audius.js'
import { formatTime } from '../utils.js'

const player = usePlayerStore()
const tab = ref('queue') // 'queue' | 'lyrics'

const lyrics = ref('')
const lyricsState = ref('idle') // 'idle' | 'loading' | 'done' | 'none'
let token = 0

async function loadLyrics() {
  const track = player.current
  if (!track) { lyricsState.value = 'idle'; return }
  const mine = ++token
  lyricsState.value = 'loading'
  try {
    const text = await fetchLyrics(track.artist, track.title)
    if (mine !== token) return // a newer request superseded this one
    lyrics.value = text || ''
    lyricsState.value = text ? 'done' : 'none'
  } catch {
    if (mine === token) lyricsState.value = 'none'
  }
}

// Refetch lyrics whenever the track changes (if the lyrics tab is open) or
// the user switches to the lyrics tab.
watch(
  () => [player.current?.id, tab.value],
  () => { if (tab.value === 'lyrics') loadLyrics() }
)
</script>

<template>
  <aside class="panel">
    <div class="tabs">
      <button :class="{ on: tab === 'queue' }" @click="tab = 'queue'">Up Next</button>
      <button :class="{ on: tab === 'lyrics' }" @click="tab = 'lyrics'">Lyrics</button>
      <button class="icon-btn close" title="Close" @click="player.togglePanel">✕</button>
    </div>

    <!-- Queue -->
    <div v-if="tab === 'queue'" class="body">
      <template v-if="player.current">
        <div class="section muted small">Now playing</div>
        <div class="q-row active">
          <img :src="player.current.cover" alt="" />
          <div class="info">
            <div class="q-title">{{ player.current.title }}</div>
            <div class="muted small">{{ player.current.artist }}</div>
          </div>
          <span class="muted small">{{ formatTime(player.current.duration) }}</span>
        </div>
      </template>

      <div v-if="player.upNext.length" class="section muted small">Next up</div>
      <div
        v-for="(t, i) in player.upNext"
        :key="t.id + '-' + i"
        class="q-row"
        @dblclick="player.jumpTo(player.pos + 1 + i)"
      >
        <img :src="t.cover" alt="" />
        <div class="info">
          <div class="q-title">{{ t.title }}</div>
          <div class="muted small">{{ t.artist }}</div>
        </div>
        <button class="icon-btn" title="Remove from queue" @click="player.removeFromOrder(player.pos + 1 + i)">✕</button>
      </div>

      <p v-if="!player.current" class="muted small pad">The queue is empty.</p>
      <p v-else-if="!player.upNext.length" class="muted small pad">Nothing queued after this.</p>
    </div>

    <!-- Lyrics -->
    <div v-else class="body">
      <p v-if="lyricsState === 'loading'" class="muted pad">Loading lyrics…</p>
      <pre v-else-if="lyricsState === 'done'" class="lyrics">{{ lyrics }}</pre>
      <p v-else-if="lyricsState === 'none'" class="muted pad">
        No lyrics found for this track.<br /><span class="small">Coverage is partial — many independent tracks aren't in the lyrics database.</span>
      </p>
      <p v-else class="muted pad">Play a track to see its lyrics.</p>
    </div>
  </aside>
</template>

<style scoped>
.panel { background: var(--surface); border-radius: 8px; display: flex; flex-direction: column; min-height: 0; overflow: hidden; }
.tabs { display: flex; align-items: center; gap: 4px; padding: 12px; border-bottom: 1px solid #2a2a2a; }
.tabs button { background: none; border: none; color: var(--muted); font-weight: 700; padding: 6px 10px; border-radius: 999px; cursor: pointer; }
.tabs button.on { color: var(--text); background: var(--hover); }
.tabs .close { margin-left: auto; }
.body { overflow-y: auto; padding: 8px; flex: 1; }
.section { padding: 10px 8px 4px; }
.q-row { display: grid; grid-template-columns: 40px 1fr auto; gap: 10px; align-items: center; padding: 6px 8px; border-radius: 6px; }
.q-row:hover { background: var(--hover); }
.q-row img { width: 40px; height: 40px; border-radius: 4px; background: #2a2a2a; }
.info { min-width: 0; }
.q-title { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.q-row.active .q-title { color: var(--accent); }
.lyrics { white-space: pre-wrap; font-family: inherit; line-height: 1.7; padding: 12px; color: #ddd; }
.pad { padding: 16px; }
</style>
