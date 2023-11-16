import { EventEmitter } from "stream";
import { Reader, ReaderEvent } from "../readers/Reader";
import { Scrobble } from "../types";

const maxDistanceInSec = 20 * 60; // 20 minutes
const minimalSessionLengthInSec = 10 * 60; // 10 minutes

export type Session = Scrobble[];

export enum SessionizerEvent {
  SESSION = "session",
  END = "end",
  ERROR = "error",
}


export class Sessionnizer extends EventEmitter {
  sessions: Session[] = [];
  private currentSession: Session = [];
  
  constructor(
    private reader: Reader,
  ) {
    super();
  }

  start(filePath: string) {
    this.reader.on(ReaderEvent.SCROBBLE, (scrobble) => {
      this.newScrubble(scrobble);
    });
    this.reader.on(ReaderEvent.END, () => {
      this.emit('end');
    });
    this.reader.on(ReaderEvent.ERROR, (err) => {
      this.emit('error', err);
    });
    this.reader.start(filePath);
  }

  newScrubble(scrobble: Scrobble) { 
    if (this.currentSession.length === 0) {
      this.currentSession.push(scrobble);
      return;
    }

    const lastScrobble = this.currentSession[this.currentSession.length - 1];
    if (Math.abs(scrobble.timestamp - lastScrobble.timestamp) > maxDistanceInSec) {
      if (Math.abs(this.currentSession[this.currentSession.length - 1].timestamp - this.currentSession[0].timestamp) > minimalSessionLengthInSec) {
        this.sessions.push(this.currentSession);
        this.emit(SessionizerEvent.SESSION, this.currentSession);
      }
      this.currentSession = [];
    }
    this.currentSession.push(scrobble);
  }
}