import { WSMessageOutType } from "./enums";
import type { AudioFile } from "../client";
import type { FolderType, TranscodingCode } from "./enums";

export interface AudioFileExt extends AudioFile {
  cached?: boolean;
}

export interface CurrentFolder {
  value: string;
  type: FolderType;
  scrollTo?: number;
}

export interface CurrentPlayList {
  files: AudioFileExt[];
  collection: number;
  folder: string;
  totalTime: number;
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
}

export interface TranscodingDetail {
  code: TranscodingCode;
  bitrate: number;
  name?: string;
}

export interface Device {
  name: string,
  id: string,
  active: boolean
}

export interface WSMessage extends Record<string,any> {
}

export function formatWSMessage(wsMsgType: WSMessageOutType, data: object): WSMessage {
  var obj: WSMessage = {};
  var t: string = WSMessageOutType[wsMsgType];
  obj[t] = data;
  return obj;
}