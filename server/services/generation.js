// Boundary for the future trusted worker. Client requests only create pending records.
export async function requestSongGeneration(song) { return { songId: song.id, status: "pending" }; }
export async function saveGenerationResult(song, result) { song.status = result.status; song.audioUrl = result.audioUrl; song.coverImageUrl = result.coverImageUrl; song.lyrics = result.lyrics; await song.save(); return song; }
