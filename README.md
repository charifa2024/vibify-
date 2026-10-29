# Vibify — a small Spotify clone (Vue 3 + json-server)

## Run it

You need Node.js (version 18 or newer).

```
npm install        # only once (needs internet), skip if node_modules is already there
npm run api        # terminal 1: backend on http://localhost:3000
npm run dev        # terminal 2: frontend on http://localhost:5173
```

Open http://localhost:5173

## How it works

Frontend: Vue 3 + Vite, Vue Router (pages), Pinia (shared state).
Backend: json-server. It reads `db.json` and creates a REST API automatically.

```
Vue app (5173) --/api/...--> json-server (3000) --> db.json
```

The proxy in `vite.config.js` sends `/api/songs` to `http://localhost:3000/songs`.

### API used

| Method | URL | What it does |
|---|---|---|
| GET | /songs | all songs |
| GET | /songs?q=rain | search |
| GET | /albums | all albums |
| GET | /albums/1?_embed=songs | one album with its songs |
| GET | /playlists | all playlists |
| POST | /playlists | create a playlist |
| PATCH | /playlists/1 | add/remove songs (songIds) |
| DELETE | /playlists/1 | delete a playlist |

## Files

```
db.json                    the database (albums, songs, playlists)
public/audio/              mp3 files
public/covers/             album covers
src/api.js                 all calls to the backend
src/router.js              the pages (routes)
src/stores/player.js       the music player (one Audio object for the whole app)
src/stores/library.js      the playlists
src/components/Sidebar.vue     left menu + playlists
src/components/PlayerBar.vue   bottom player (play/pause, next, progress, volume)
src/components/SongList.vue    list of songs (click to play, + to add to playlist)
src/components/AlbumCard.vue   album card
src/views/HomeView.vue     home page
src/views/SearchView.vue   search page
src/views/AlbumView.vue    album page
src/views/PlaylistView.vue playlist page
```

## Add your own songs

1. Put the mp3 in `public/audio/` (e.g. `9.mp3`) and a cover in `public/covers/`.
2. Add it to `songs` in `db.json`:
   `{ "id": 9, "title": "...", "artist": "...", "albumId": 1, "cover": "/covers/1.svg", "file": "/audio/9.mp3" }`

Free music: Pixabay Music, Free Music Archive, Jamendo.
The 8 demo songs are generated tones (no copyright).
