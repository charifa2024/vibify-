<script setup>
import { onMounted } from 'vue'
import Sidebar from './components/Sidebar.vue'
import PlayerBar from './components/PlayerBar.vue'
import NowPlaying from './components/NowPlaying.vue'
import { useLibraryStore } from './stores/library.js'
import { usePlayerStore } from './stores/player.js'

const library = useLibraryStore()
const player = usePlayerStore()
onMounted(() => library.fetchLibrary())
</script>

<template>
  <div class="layout" :class="{ 'panel-open': player.showPanel }">
    <Sidebar class="sidebar" />
    <main class="main">
      <router-view :key="$route.fullPath" />
    </main>
    <NowPlaying v-if="player.showPanel" class="nowplaying" />
    <PlayerBar class="player" />
  </div>
</template>
