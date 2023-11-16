import { Scrobble } from "../types";

export enum ReaderEvent {
  SCROBBLE = "scrobble",
  END = "end",
  ERROR = "error",
}

export interface Reader {
  start: (filePath: string) => void;
  on: (event: ReaderEvent, callback: (scrobble: Scrobble) => void) => this;
}