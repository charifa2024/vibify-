<script setup>
// One card for the three things we show in grids: a track, a collection
// (Audius album/playlist) or an artist. Tracks play on click; the others link.
import { formatCount } from '../utils.js'

defineProps({ item: { type: Object, required: true } })
const emit = defineEmits(['play'])

const link = (item) =>
  item.kind === 'artist' ? `/artist/${item.id}` : `/collection/${item.id}`
</script>

<template>
  <!-- Track: clicking the card (or the green button) plays it -->
  <div v-if="item.kind === 'track'" class="card" @click="emit('play')">
    <div class="art">
      <img :src="item.cover" alt="" loading="lazy" />
      <button class="float-play" title="Play">
        <svg viewBox="0 0 24 24" width="22"><path d="M7 4v16l13-8z" fill="currentColor"/></svg>
      </button>
    </div>
    <div class="title">{{ item.title }}</div>
    <div class="muted small">{{ item.artist }}</div>
  </div>

  <!-- Collection or artist: navigate -->
  <router-link v-else :to="link(item)" class="card">
    <div class="art">
      <img :src="item.cover" alt="" loading="lazy" :class="{ round: item.kind === 'artist' }" />
    </div>
    <div class="title">{{ item.kind === 'artist' ? item.name : item.title }}</div>
    <div class="muted small">
      <template v-if="item.kind === 'artist'">{{ formatCount(item.followerCount) }} followers</template>
      <template v-else>{{ item.isAlbum ? 'Album' : 'Playlist' }} · {{ item.owner }}</template>
    </div>
  </router-link>
</template>

<style scoped>
.card { display: block; padding: 12px; border-radius: 8px; transition: background .2s; cursor: pointer; }
.card:hover { background: var(--hover); }
.art { position: relative; margin-bottom: 10px; }
.card img { width: 100%; aspect-ratio: 1; border-radius: 6px; background: #2a2a2a; box-shadow: 0 8px 24px rgba(0,0,0,.5); }
.card img.round { border-radius: 50%; }
.title { font-weight: 700; margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.float-play {
  position: absolute; right: 8px; bottom: 8px; width: 48px; height: 48px; border-radius: 50%;
  border: none; background: var(--accent); color: #000; display: grid; place-items: center;
  cursor: pointer; opacity: 0; transform: translateY(8px); transition: .2s; box-shadow: 0 8px 16px rgba(0,0,0,.4);
}
.card:hover .float-play { opacity: 1; transform: translateY(0); }
.float-play:hover { transform: scale(1.05); background: #3be477; }
</style>
