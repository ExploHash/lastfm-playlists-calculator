import { Session, Sessionnizer } from "./groupers/Sessionizer";
import { CSVReader } from "./readers/CSVReader";


function main() {
  const csvReader = new CSVReader();
  const sessionizer = new Sessionnizer(csvReader);

  sessionizer.on('end', () => {
    generateTop10closests('money', sessionizer.sessions);
  });

  sessionizer.on('error', (err) => {
    console.error(err);
  });

  sessionizer.start('data/scrobbles-jbtwaalf-1700169007.csv');
}

function generateTop10closests(songTitle: string, sessions: Session[]) {
  const songWithScore = {}; // { songTitle: score }
  // First find all sessions that contain the song
  const sessionsWithSong = sessions.filter((session) => {
    return session.some((scrobble) => {
      return scrobble.trackName === songTitle;
    });
  });

  // Loop over all sessions that contain the song
  sessionsWithSong.forEach((session) => {
    // Get the index of the song in the session
    const songIndex = session.findIndex((scrobble) => {
      return scrobble.trackName === songTitle;
    });

    // Loop over all scrobbles in the session
    session.forEach((scrobble, index) => {
      // If the scrobble is the song we are looking for, skip it
      if (scrobble.trackName === songTitle) {
        return;
      }
      // Calculate the distance between the scrobble and the song
      const distanceInIndex = Math.abs(songIndex - index);
      const score = distanceInIndex >= 10 ? 1: 10 - distanceInIndex;
      // If the song is not yet in the songWithScore object, add it
      if (!songWithScore[scrobble.trackName]) {
        songWithScore[scrobble.trackName] = score;
      }
      // Add the distance to the score
      songWithScore[scrobble.trackName] += score;
    });
  });

  // Get the top 10 songs
  const top10 = Object.keys(songWithScore).sort((a, b) => {
    return songWithScore[b] - songWithScore[a];
  }).slice(0, 10);

  // Print the top 10 songs
  top10.forEach((song, index) => {
    console.log(`${index + 1}. ${song} - ${songWithScore[song]}: ${songWithScore[song]} points`);
  });
}

main();