import { WSMessageOutType } from "./enums";
import type { AudioFile } from "../client";
import type { FolderType, NavigateTarget } from "./enums";

export interface AudioFileExt extends AudioFile {
  cached?: boolean;
}

export interface CurrentFolder {
  value: string;
  type: FolderType;
  scrollTo?: number;
}

export interface CurrentPlayList {
  // files: AudioFileExt[];
  files: Map<number, AudioFile>;
  dirs: Map<string, AudioFile[]>;
  collection: number;
  folder: string;
  totalTime: number;
  hasImage: boolean;
}

export interface AppConfig {
  maxParallelDownload: number;
  cacheAheadFiles: number;
  cacheAheadDelay: number;
  transcodingTolerance: number;
  positionReportingPeriod: number;
  sleepTimerPeriod: number;
  sleepTimerExtend: number;
  jumpForwardTime: number;
  jumpBackTime: number;
  transcodingJumpLimit: number;
  autorewind: boolean;
  recentDays: number;
  alwaysTranscode: string;
  folderIconSize: number;
  showFolderRemainingTime: boolean;
  expandedPlayerTray: boolean;
  enableSlideInBrowser: boolean;
}

export interface ClientDevice {
  name: string,
  id: string,
  active: boolean
}

export interface NavigateFolder {
  type: NavigateTarget,
  folder: string
}

export interface WSMessage extends Record<string, any> {
}

export function formatWSMessage(wsMsgType: WSMessageOutType, data: object): WSMessage {
  var obj: WSMessage = {};
  var t: string = WSMessageOutType[wsMsgType];
  obj[t] = data;
  return obj;
}