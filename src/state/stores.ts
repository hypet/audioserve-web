import { writable, derived, readable } from "svelte/store";
import { deviceName } from "../util/browser";
import type { Writable, Readable } from "svelte/store";
import { defaultConfig } from "../app-config";
import { CollectionsApi, Configuration, PositionsApi } from "../client";
import type { CollectionsInfo } from "../client";
import { PlaybackSync } from "../client-position/playback-sync";
import {
  ShuffleMode,
  StorageKeys,
  WSMessageInType,
  WSMessageOutType,
} from "../types/enums";
import { PlayItem } from "../types/play-item";
import {
  formatWSMessage,
  type AppConfig,
  type CurrentFolder,
  type CurrentPlayList,
  type ClientDevice as Device,
  type WSMessage,
} from "../types/types";
import { isDevelopment } from "../util/version";
import { baseWsUrl } from "../util/browser";

export const isAuthenticated = writable(true);
export const apiConfig = writable(new Configuration());
export const group = writable(localStorage.getItem(StorageKeys.GROUP));
export const collections: Writable<CollectionsInfo | undefined> = writable();
export const selectedCollection: Writable<number> = writable();
export const currentFolder: Writable<CurrentFolder | undefined> = writable(undefined);
export const playItem: Writable<PlayItem | undefined> = writable(undefined);
export const playList: Writable<Nullable<CurrentPlayList>> = writable(null);
export const pendingDownloads: Writable<number> = writable(0);
export const deviceId: Writable<String | undefined> = writable(undefined);
export const activeDeviceId: Writable<String | undefined> = writable(undefined);
export const devicesOnline: Writable<Device[]> = writable([]);
export const activeShuffleMode: Writable<number> = writable(ShuffleMode.Off);
export const isPlaying: Writable<boolean> = writable(false);
export const progressValue: Writable<number | undefined> = writable(undefined);
export const progressValueChanging: Writable<boolean> = writable(false);
export const rewindToValue: Writable<number | undefined> = writable(undefined);
export const volumeValue: Writable<number | undefined> = writable(undefined);

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

let deviceIdVal: String;
let playingItem: PlayItem;
let isPlayingState: boolean;
let currentPlayList: CurrentPlayList;
let devicesOnlineVal: Device[];
let activeDeviceIdVal: String;

deviceId.subscribe((value) => deviceIdVal = value);
playItem.subscribe((value) => playingItem = value);
isPlaying.subscribe((value) => isPlayingState = value);
playList.subscribe((value) => currentPlayList = value);
devicesOnline.subscribe((value) => devicesOnlineVal = value);
activeDeviceId.subscribe((value) => activeDeviceIdVal = value);

export let webSocket: WebSocket = new WebSocket(baseWsUrl(true, 3000) + "/ws");
webSocket.addEventListener("open", () => {
  console.log("WebSocket opened");
  let regDeviceReq: WSMessage = formatWSMessage(
    WSMessageOutType.RegisterDevice,
    { name: deviceName() }
  );
  webSocket.send(JSON.stringify(regDeviceReq));
});
webSocket.addEventListener("error", (err) => {
  console.error(`Web socket error`, err);
});
webSocket.addEventListener("close", (close) => {
  console.debug("Web socket close", close);
});
webSocket.addEventListener("message", evt => {
  console.debug("evt: ", evt);
  const wsMsg: WSMessage = JSON.parse(evt.data);
  const msgType = Object.keys(wsMsg)[0];
  const event = wsMsg[msgType];
  const typedMsgType: WSMessageInType = WSMessageInType[msgType as keyof typeof WSMessageInType];
  switch (typedMsgType) {
    case WSMessageInType.RewindToEvent: {
      const time: number = event["time"];
      if (time > 0) {
        console.log("RewindTo: ", time);
        rewindToValue.set(time);
      }
      break;
    }
    case WSMessageInType.CurrentPosEvent: {
      const id: number = event["track_id"];
      const time: number = event["time"];
      if (!playList) return;

      if (!playingItem || playingItem.id !== id) {
        console.log("CurrentPosEvent id=", id);
        const file = currentPlayList.files.get(id);
        const startPlay = false;
        const item = new PlayItem({
          file,
          startPlay,
          time,
        });
        playItem.set(item);
        selectedCollection.set(event["collection"]);
      } else {
        playingItem.time = time;
      }
      
      if (!isPlayingState) {
        console.log("isPlayingState: ", isPlayingState);
        isPlaying.set(true);
      }
      progressValue.set(time);
      break;
    }
    case WSMessageInType.PauseEvent: 
      isPlaying.set(false);
      console.log("isPlaying: ", isPlaying);
      break;
    case WSMessageInType.ResumeEvent:
      isPlaying.set(true);
      break;
    case WSMessageInType.PlayTrackEvent: {
      const trackId = event["track_id"];
      isPlaying.set(false);
      const file = currentPlayList.files.get(trackId);
      const time = 0.0;
      const startPlay = true;
      selectedCollection.set(event["collection"]);
      const item = new PlayItem({
        file,
        startPlay,
        time,
      });

      playItem.set(item);
      break;
    }
    case WSMessageInType.VolumeChangeEvent: {
      volumeValue.set(event["value"]);
      break;
    }
    case WSMessageInType.DevicesOnlineEvent: {
      devicesOnline.set(event["devices"]);
      for (let device of devicesOnlineVal) {
        if (device.active) {
            activeDeviceId.set(device.id);
            break;
        }
      };

      console.log("Devices: ", devicesOnlineVal);
      console.log("Selected device: " + activeDeviceIdVal);

      break;
    }
    case WSMessageInType.RegisterDeviceEvent: 
      console.debug("RegisterDeviceEvent");
      deviceId.set(event["device_id"]);
      break;
    case WSMessageInType.MakeDeviceActiveEvent:
      activeDeviceId.set(event["device_id"]);
      break;
    case WSMessageInType.SwitchShuffleEvent:
      const mode = event["mode"];
      activeShuffleMode.set(mode);
      break;
  }
});
