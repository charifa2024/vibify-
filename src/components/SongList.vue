<script setup>
// Reusable list of tracks (used on Home, Search, Artist, Collection,
// Liked and Playlist pages).
import { ref } from 'vue'
import { usePlayerStore } from '../stores/player.js'
import { useLibraryStore } from '../stores/library.js'
import { formatTime, formatCount } from '../utils.js'

const props = defineProps({
  songs: { type: Array, required: true },
  removable: { type: Boolean, default: false } // show a "remove" button (playlist page)
})
const emit = defineEmits(['remove'])

const player = usePlayerStore()
const library = useLibraryStore()
const menuFor = ref(null) // id of the track whose "add to playlist" menu is open

function play(i) {
  player.playList(props.songs, i)
}

async function addTo(playlistId, track) {
  await library.addToPlaylist(playlistId, track)
  menuFor.value = null
}
</script>

<template>
  <div class="list">
    <div
      v-for="(song, i) in songs"
      :key="song.id"
      class="row"
      :class="{ active: player.current?.id === song.id }"
      @dblclick="play(i)"
    >
      <button class="num" title="Play" @click="play(i)">
        <span class="n">{{ i + 1 }}</span>
        <svg class="p" viewBox="0 0 24 24" width="14"><path d="M7 4v16l13-8z" fill="currentColor"/></svg>
      </button>

      <img :src="song.cover" alt="" loading="lazy" />

      <div class="info">
        <div class="title">{{ song.title }}</div>
        <router-link v-if="song.artistId" :to="`/artist/${song.artistId}`" class="muted small artist" @click.stop>
          {{ song.artist }}
        </router-link>
        <div v-else class="muted small">{{ song.artist }}</div>
      </div>

      <span v-if="song.playCount" class="muted small plays">{{ formatCount(song.playCount) }} plays</span>

      <button
        class="icon-btn like"
        :class="{ liked: library.isLiked(song.id) }"
        :title="library.isLiked(song.id) ? 'Remove from Liked Songs' : 'Save to Liked Songs'"
        @click="library.toggleLike(song)"
      >
        <svg viewBox="0 0 24 24" width="16"><path d="M12 21s-7.5-4.6-10-9.3C.6 8.6 2.2 5.5 5.3 5.5c1.9 0 3.1 1 3.7 2 .6-1 1.8-2 3.7-2 3.1 0 4.7 3.1 3.3 6.2C19.5 16.4 12 21 12 21z" :fill="library.isLiked(song.id) ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="1.8"/></svg>
      </button>

      <span class="muted small time">{{ formatTime(song.duration) }}</span>

      <div class="actions">
        <button v-if="removable" class="icon-btn" title="Remove from playlist" @click="emit('remove', song.id)">✕</button>
        <div v-else class="menu-wrap">
          <button class="icon-btn" title="Add to playlist / queue" @click="menuFor = menuFor === song.id ? null : song.id">⋯</button>
          <div v-if="menuFor === song.id" class="menu">
            <button @click="player.addToQueue(song); menuFor = null">Add to queue</button>
            <div class="muted small menu-title">Add to playlist</div>
            <button v-for="p in library.playlists" :key="p.id" @click="addTo(p.id, song)">
              {{ p.name }} <span v-if="p.tracks.some((t) => t.id === song.id)">✓</span>
            </button>
            <div v-if="!library.playlists.length" class="muted small pad">Create a playlist first</div>
          </div>
        </div>
      </div>
    </div>
    <p v-if="!songs.length" class="muted pad">No songs here.</p>
  </div>
</template>

<style scoped>
.row { display: grid; grid-template-columns: 28px 40px minmax(0, 1fr) auto 32px 48px 32px; align-items: center; gap: 12px; padding: 6px 12px; border-radius: 6px; }
.row:hover { background: var(--hover); }
.row img { width: 40px; height: 40px; border-radius: 4px; background: #2a2a2a; }
.num { background: none; border: none; color: var(--muted); cursor: pointer; display: grid; place-items: center; }
.num .p { display: none; color: var(--text); }
.row:hover .num .n { display: none; }
.row:hover .num .p { display: block; }
.info { min-width: 0; }
.title { font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.artist:hover { color: var(--text); text-decoration: underline; }
.active .title, .active .n { color: var(--accent); }
.plays { white-space: nowrap; }
.like { opacity: 0; }
.row:hover .like, .like.liked { opacity: 1; }
.like.liked { color: var(--accent); }
.time { text-align: right; }
.menu-wrap { position: relative; }
.menu { position: absolute; right: 0; top: 30px; z-index: 10; background: #282828; border-radius: 6px; padding: 6px; min-width: 200px; box-shadow: 0 8px 24px rgba(0,0,0,.5); max-height: 320px; overflow-y: auto; }
.menu-title { padding: 8px 8px 4px; border-top: 1px solid #3e3e3e; margin-top: 4px; }
.menu button { display: flex; justify-content: space-between; width: 100%; text-align: left; background: none; border: none; color: var(--text); padding: 8px; border-radius: 4px; cursor: pointer; }
.menu button:hover { background: #3e3e3e; }
.pad { padding: 8px 12px; }

@media (max-width: 760px) {
  .row { grid-template-columns: 28px 40px minmax(0, 1fr) 32px 44px; }
  .plays { display: none; }
}
</style>
