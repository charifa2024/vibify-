import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import SearchView from './views/SearchView.vue'
import ArtistView from './views/ArtistView.vue'
import CollectionView from './views/CollectionView.vue'
import PlaylistView from './views/PlaylistView.vue'
import LikedView from './views/LikedView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/search', component: SearchView },
    { path: '/liked', component: LikedView },
    { path: '/artist/:id', component: ArtistView },      // Audius artist
    { path: '/collection/:id', component: CollectionView }, // Audius album/playlist
    { path: '/playlist/:id', component: PlaylistView }     // your own playlist
  ]
})
