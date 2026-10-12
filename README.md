# MyVerse

MyVerse is a personal music-creation experience that turns a person’s memories, milestones, hopes, and difficult seasons into an original piece of music. A user starts with a story—not musical knowledge—and MyVerse shapes that story into lyrics and a generated track that feels personal to the chosen genre, mood, and language.

The product is built around one simple idea: every life has material worth hearing.

## What MyVerse does

MyVerse lets people describe an experience in their own words and choose the creative direction for it. They can select a genre, mood, and language, then create a MyVerse from that prompt.

Each finished MyVerse contains:

- A title
- Structured lyrics, arranged into sections such as verses, choruses, bridges, and outros
- Genre, mood, and language context
- Generated audio when music generation is available for the selected language
- Bookmarking, so a user can keep meaningful creations close

MyVerse is designed for reflective, emotional, and celebratory stories: a friendship, graduation, breakup, family memory, faith journey, hard season, dream, or ordinary moment that deserves to be remembered.

## How it operates

Song creation is asynchronous. The app creates a MyVerse immediately and takes the user to its detail page instead of making them wait on a long request. The detail page shows the current stage and refreshes automatically while work is in progress.

The generation lifecycle is:

```text
Create MyVerse
      ↓
pending
      ↓
generating_lyrics
      ↓
generating_audio
      ↓
ready
```

If a provider cannot complete a request, the MyVerse moves to `failed` with a clear, safe message. The user can retry failed creations without having to re-enter their story.

The backend owns all provider communication. The mobile app only sends the user’s creation choices and reads the status and finished result. Provider credentials and raw generation requests are never exposed in the client.

## AI and media services

MyVerse combines separate services so each part of the experience has a focused responsibility.

### Lyrics generation

Groq powers lyric writing through a language model. The service receives the user’s story, genre, mood, and language, then returns validated structured JSON containing a title, lyric sections, and a style prompt.

The lyric prompt is designed to:

- Ground the writing in details from the user’s story instead of generic phrases
- Follow a song structure that suits the selected genre
- Respect the requested language and mood
- Treat the story as source material, never as executable instructions
- Handle painful subjects gently and avoid glorifying harm, abuse, or violence

### Music generation with Yue

Yue is the music-generation service for MyVerse. Once lyrics are ready, the backend can pass the finished lyric structure and creative direction to Yue to produce the musical audio. Keeping Yue behind a provider boundary means MyVerse can evolve its music engine without changing the app experience or song API.

The app presents this output honestly according to the provider in use. If a creation only has spoken lyric audio available, it is labeled **Narrated lyrics**, not presented as singing or a finished music track.

### Narrated lyrics fallback

Groq Text-to-Speech provides spoken narration for supported languages. This gives users an accessible way to hear their lyric writing even when full music generation is unavailable. Unsupported TTS languages still complete successfully as lyrics-only MyVerses; the app does not fail or show a broken player.

## User flow

1. **Start on Home** — The user opens the creation form, sees recent MyVerses, and can use a prompt idea to get started.
2. **Tell a story** — They write at least a short, meaningful description of a memory, situation, or aspiration.
3. **Choose the sound** — They select a genre, mood, and language rather than typing unstructured values.
4. **Create MyVerse** — The app saves the request instantly and opens the Song Detail screen.
5. **Follow progress** — The detail screen communicates the current stage with friendly language such as “Writing your lyrics…” and “Finding your voice…”.
6. **Read and listen** — When ready, the user can read lyrics by section and play available narrated or generated audio with playback progress.
7. **Keep meaningful work** — A MyVerse can be bookmarked, revisited from My Songs, or found through Bookmarks.
8. **Retry safely** — If a generation fails, the user can retry from the detail screen.

## Experience principles

MyVerse is intentionally warm, personal, and music-first rather than dashboard-like. The visual language uses a warm palette, readable body text, expressive headings, clear active navigation, and gentle feedback during generation.

The product also makes a few important promises:

- It does not ask users to understand music production before creating.
- It does not expose API keys or generation-provider credentials in the mobile application.
- It does not log raw stories or lyrics in normal generation logs.
- It does not misrepresent spoken narration as singing or generated music.
- It keeps lyrics-only creations useful when an audio service or language capability is unavailable.

## Core technology

MyVerse uses a React Native and Expo mobile client, an Express API, MongoDB with Mongoose for persistent user and song data, and authenticated APIs for accounts, profiles, songs, and bookmarks.

Generation is performed server-side with Groq for structured lyric writing and TTS narration, with Yue serving as the music-generation layer. The mobile client uses Expo Audio for playback and Expo vector icons for clear, active bottom-tab navigation.
