// Player store: ONE audio object for the whole app.
// Because it lives in Pinia (not in a page), the music keeps playing
// when you navigate between pages.
//
// Playback order is kept as a separate `order` array (indices into `queue`),
// which lets shuffle reorder playback without losing the original queue.
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { streamUrl } from '../audius.js'

export const usePlayerStore = defineStore('player', () => {
  const audio = new Audio()

  const queue = ref([])        // tracks, in the order they were added
  const order = ref([])        // indices into `queue` = the playback order
  const pos = ref(-1)          // position within `order`
  const isPlaying = ref(false)
  const currentTime = ref(0)
  const duration = ref(0)
  const volume = ref(0.8)
  const shuffle = ref(false)
  const repeat = ref('off')    // 'off' | 'all' | 'one'
  const showPanel = ref(false) // the "Now Playing" side panel

  const current = computed(() => queue.value[order.value[pos.value]] ?? null)
  const upNext = computed(() => order.value.slice(pos.value + 1).map((i) => queue.value[i]))

  audio.volume = volume.value

  // Keep the state in sync with the <audio> element
  audio.addEventListener('timeupdate', () => (currentTime.value = audio.currentTime))
  audio.addEventListener('loadedmetadata', () => (duration.value = audio.duration))
  audio.addEventListener('play', () => (isPlaying.value = true))
  audio.addEventListener('pause', () => (isPlaying.value = false))
  audio.addEventListener('ended', () => next(true)) // auto-advance

  function load() {
    const track = current.value
    if (!track) return
    // Library snapshots don't carry a stream URL; rebuild it from the id.
    audio.src = track.file || streamUrl(track.id)
    audio.play().catch(() => {})
  }

  // Build the playback order; with shuffle on, randomise but keep `startAt` first.
  function buildOrder(startAt = 0) {
    const idxs = queue.value.map((_, i) => i)
    if (shuffle.value) {
      for (let i = idxs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[idxs[i], idxs[j]] = [idxs[j], idxs[i]]
      }
      const k = idxs.indexOf(startAt)
      if (k > 0) [idxs[0], idxs[k]] = [idxs[k], idxs[0]]
      pos.value = 0
    } else {
      pos.value = startAt
    }
    order.value = idxs
  }

  // Play a list of tracks starting at position i
  function playList(songs, i = 0) {
    queue.value = songs.slice()
    buildOrder(i)
    load()
  }

  function toggle() {
    if (!current.value) return
    audio.paused ? audio.play() : audio.pause()
  }

  function next(auto = false) {
    if (!queue.value.length) return
    if (auto && repeat.value === 'one') { audio.currentTime = 0; audio.play(); return }
    if (pos.value >= order.value.length - 1) {
      if (repeat.value === 'all') pos.value = 0
      else return // end of queue: stop
    } else {
      pos.value++
    }
    load()
  }

  function prev() {
    if (!queue.value.length) return
    // like Spotify: if more than 3s played, restart the song instead
    if (audio.currentTime > 3) { audio.currentTime = 0; return }
    if (pos.value > 0) pos.value--
    else if (repeat.value === 'all') pos.value = order.value.length - 1
    load()
  }

  // Jump to a specific position in the current playback order (Up Next list)
  function jumpTo(orderIndex) {
    if (orderIndex < 0 || orderIndex >= order.value.length) return
    pos.value = orderIndex
    load()
  }

  function addToQueue(track) {
    queue.value.push(track)
    order.value.push(queue.value.length - 1)
    if (pos.value === -1) { pos.value = 0; load() }
  }

  function removeFromOrder(orderIndex) {
    if (orderIndex <= pos.value) return // only upcoming items are removable here
    order.value.splice(orderIndex, 1)
  }

  function seek(time) { audio.currentTime = time }

  function setVolume(v) { volume.value = v; audio.volume = v }

  function toggleShuffle() {
    shuffle.value = !shuffle.value
    if (queue.value.length) buildOrder(order.value[pos.value] ?? 0)
  }

  function cycleRepeat() {
    repeat.value = repeat.value === 'off' ? 'all' : repeat.value === 'all' ? 'one' : 'off'
  }

  function togglePanel() { showPanel.value = !showPanel.value }

  return {
    queue, order, pos, current, upNext, isPlaying, currentTime, duration, volume,
    shuffle, repeat, showPanel,
    playList, toggle, next, prev, jumpTo, addToQueue, removeFromOrder,
    seek, setVolume, toggleShuffle, cycleRepeat, togglePanel
  }
})
