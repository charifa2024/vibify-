<script setup>
import { useRouter } from 'vue-router'
import { useLibraryStore } from '../stores/library.js'

const library = useLibraryStore()
const router = useRouter()

async function newPlaylist() {
  const name = prompt('Playlist name:')
  if (!name || !name.trim()) return
  const p = await library.createPlaylist(name.trim())
  router.push(`/playlist/${p.id}`)
}
</script>

<template>
  <aside>
    <div class="panel">
      <div class="logo">
        <svg viewBox="0 0 24 24" width="28" height="28"><circle cx="12" cy="12" r="11" fill="var(--accent)"/><path d="M7 9.5c3.5-1 7-.6 10 1M7.5 12.5c3-.8 5.8-.4 8.3.9M8 15.4c2.3-.6 4.5-.3 6.4.7" stroke="#000" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>
        Vibify
      </div>
      <router-link to="/" class="nav">
        <svg viewBox="0 0 24 24" width="22"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="currentColor"/></svg>
        Home
      </router-link>
      <router-link to="/search" class="nav">
        <svg viewBox="0 0 24 24" width="22"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="2.2" fill="none"/><path d="M15.5 15.5L21 21" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
        Search
      </router-link>
    </div>

    <div class="panel library">
      <div class="lib-head">
        <span>Your Library</span>
        <button class="icon-btn" title="Create playlist" @click="newPlaylist">+</button>
      </div>

      <router-link to="/liked" class="pl-item">
        <div class="pl-icon liked">
          <svg viewBox="0 0 24 24" width="22"><path d="M12 21s-7.5-4.6-10-9.3C.6 8.6 2.2 5.5 5.3 5.5c1.9 0 3.1 1 3.7 2 .6-1 1.8-2 3.7-2 3.1 0 4.7 3.1 3.3 6.2C19.5 16.4 12 21 12 21z" fill="#fff"/></svg>
        </div>
        <div>
          <div class="pl-name">Liked Songs</div>
          <div class="muted small">Playlist · {{ library.likes.length }} songs</div>
        </div>
      </router-link>

      <router-link
        v-for="p in library.playlists"
        :key="p.id"
        :to="`/playlist/${p.id}`"
        class="pl-item"
      >
        <div class="pl-icon">♪</div>
        <div>
          <div class="pl-name">{{ p.name }}</div>
          <div class="muted small">Playlist · {{ p.tracks.length }} songs</div>
        </div>
      </router-link>

      <p v-if="!library.playlists.length" class="muted small hint">Click + to create a playlist.</p>
    </div>
  </aside>
</template>

<style scoped>
aside { display: flex; flex-direction: column; gap: 8px; min-height: 0; }
.panel { background: var(--surface); border-radius: 8px; padding: 16px 12px; }
.library { flex: 1; overflow-y: auto; }
.logo { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 22px; padding: 0 8px 16px; }
.nav { display: flex; align-items: center; gap: 16px; padding: 10px 8px; color: var(--muted); font-weight: 700; }
.nav:hover, .nav.router-link-exact-active { color: var(--text); }
.lib-head { display: flex; justify-content: space-between; align-items: center; padding: 0 8px 12px; color: var(--muted); font-weight: 700; }
.pl-item { display: flex; gap: 12px; align-items: center; padding: 8px; border-radius: 6px; }
.pl-item:hover, .pl-item.router-link-active { background: var(--hover); }
.pl-icon { width: 44px; height: 44px; border-radius: 4px; display: grid; place-items: center; background: linear-gradient(135deg, #450af5, #8e8ee5); font-size: 20px; flex-shrink: 0; }
.pl-icon.liked { background: linear-gradient(135deg, #4a00c0, #c86dd7); }
.pl-name { font-weight: 600; }
.hint { padding: 8px; }
</style>
