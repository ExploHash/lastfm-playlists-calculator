import fs from 'fs';
import { Reader, ReaderEvent } from "./Reader";
import csvParser from 'csv-parser';
import { EventEmitter } from 'stream';
import { Scrobble } from '../types';

export class CSVReader extends EventEmitter implements Reader {
  private stream: fs.ReadStream;

  constructor() {
    super();
  }

  start(filePath: string) {
    this.stream = fs.createReadStream(filePath);
    this.stream.pipe(csvParser())
      .on('data', (row) => {
        this.emit('scrobble', this.parseRow(row));
      })
      .on('end', () => {
        this.emit('end');
      })
      .on('error', (err) => {
        this.emit('error', err);
      });
  }

  on(event: ReaderEvent, callback: (scrobble: Scrobble) => void): this {
    super.on(event, callback);
    return this;
  }

  parseRow(row: any): Scrobble {
    return {
      timestamp: parseInt(row.uts),
      dateTimeText: row.utc_time,
      artistName: row.artist,
      artistId: row.artist_mbid,
      trackName: row.track,
      trackId: row.track_mbid,
      albumName: row.album,
      albumId: row.album_mbid,
    };
  }
}