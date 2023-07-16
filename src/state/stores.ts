import { writable, derived, readable } from "svelte/store";
import type { Writable, Readable } from "svelte/store";
import { defaultConfig } from "../app-config";
import { CollectionsApi, Configuration, PositionsApi } from "../client";
import type { CollectionsInfo, Transcoding, TranscodingsInfo } from "../client";
import { PlaybackSync } from "../client-position/playback-sync";
import {
  ShuffleMode,
  StorageKeys,
  TranscodingCode,
  transcodingCodeToName,
} from "../types/enums";
import type { PlayItem } from "../types/play-item";
import type {
  AppConfig,
  CurrentFolder,
  CurrentPlayList,
  TranscodingDetail,
} from "../types/types";
import { isDevelopment } from "../util/version";
import { baseWsUrl } from "../util/browser";

export const isAuthenticated = writable(true);
export const apiConfig = writable(new Configuration());
export const group = writable(localStorage.getItem(StorageKeys.GROUP));
export const collections: Writable<CollectionsInfo | undefined> = writable();
export const selectedCollection: Writable<number | undefined> = writable();

export const transcodings: Writable<TranscodingsInfo> = writable();
const initialTranscoding =
  localStorage.getItem(StorageKeys.TRANSCODING) || TranscodingCode.Medium;
export const selectedTranscoding: Writable<TranscodingCode> = writable(
  initialTranscoding as TranscodingCode
);
export const selectedTranscodingDetails: Readable<TranscodingDetail> = derived(
  [transcodings, selectedTranscoding],
  ([$transcodings, $selectedTranscoding]) => {
    const code = $selectedTranscoding;
    const key = transcodingCodeToName(code).toLocaleLowerCase();
    if ($transcodings && key in $transcodings) {
      const info: Transcoding = $transcodings[key];
      return {
        code,
        bitrate: info.bitrate,
        name: info.name,
      };
    } else {
      return {
        code,
        bitrate: 0,
      };
    }
  }
);
export const currentFolder: Writable<CurrentFolder | undefined> =
  writable(undefined);

export const playItem: Writable<PlayItem> = writable(undefined);
export const playList: Writable<CurrentPlayList> = writable(undefined);
export const pendingDownloads: Writable<number> = writable(0);
export const deviceId: Writable<String> = writable(undefined);
export const activeDeviceId: Writable<String> = writable(undefined);
export const activeShuffleMode: Writable<ShuffleMode> = writable(ShuffleMode.Off);

export const colApi = derived(
  apiConfig,
  ($apiConfig) => new CollectionsApi($apiConfig)
);

export const positionsApi = derived(
  [apiConfig, group],
  ([$apiConfig, $group]) => {
    if (!group) return null;
    return new PositionsApi($apiConfig);
  }
);

const getInitialConfig = () => {
  const pref = localStorage.getItem(StorageKeys.PREFERENCES);
  let conf = defaultConfig;
  if (pref) {
    try {
      const prefObj = JSON.parse(pref);
      conf = Object.assign(conf, prefObj);
    } catch (e) {
      console.error("Invalid preferences");
    }
  }

  return conf;
};

export const config: Writable<AppConfig> = writable(getInitialConfig());

export const positionWsApi: Readable<PlaybackSync> = derived(
  [config, apiConfig, group],
  ([$config, $apiConfig, $group]) => {
    return new PlaybackSync({
      development: isDevelopment,
      developmentPort: 3000,
      positionReportingPeriod: $config.positionReportingPeriod,
      group: $group,
    });
  }
);
function getWindowSize() {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
}

export const windowSize = readable(getWindowSize(), (set) => {
  window.addEventListener("resize", () => set(getWindowSize()));
});

export const sleepTime = writable(0);

export let webSocket: WebSocket = new WebSocket(baseWsUrl(true, 3000) + "/ws");
