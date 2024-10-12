import { writable, derived, readable, get } from "svelte/store";
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
export const isPaused: Writable<boolean> = writable(true);
export const progressValue: Writable<number | undefined> = writable(undefined);
export const progressValueChanging: Writable<boolean> = writable(false);
export const rewindToValue: Writable<number | undefined> = writable(undefined);
export const volumeValue: Writable<number | undefined> = writable(undefined);
export const searchTerm: Writable<string> = writable('');
export const lastPlayActionTimestamp: Writable<number> = writable(0);

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

let webSocket: WebSocket; 

function connectWebSocket() {
  webSocket = new WebSocket(baseWsUrl(true, 3000) + "/ws");
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
        const collection: number = event["collection"];
        if (!playList) return;

        // Workaround for case when inactive device start play for another track and then 
        // receives CurrentPosEvent for the previously playing track
        if (Date.now() - get(lastPlayActionTimestamp) < 1000) return;

        if (!get(playItem) || get(playItem)?.id !== id) {
          console.log("CurrentPosEvent id =", id);
          const file = get(playList)?.files.get(id)!;
          const startPlay = false;
          const item = new PlayItem({
            file,
            collection,
            startPlay,
            time,
          });
          playItem.set(item);
          if (get(selectedCollection) !== collection) {
            selectedCollection.set(collection);
          }
        } else {
          get(playItem)?.setTime(time);
        }
        
        isPaused.set(false);
        progressValue.set(time);
        break;
      }
      case WSMessageInType.PauseEvent: 
        isPaused.set(true);
        break;
      case WSMessageInType.ResumeEvent:
        isPaused.set(false);
        break;
      case WSMessageInType.PlayTrackEvent: {
        const trackId = event["track_id"];
        const collection: number = event["collection"];
        isPaused.set(false);
        const file = get(playList)?.files.get(trackId)!;
        const time = 0.0;
        const startPlay = true;
        if (get(selectedCollection) !== collection) {
          selectedCollection.set(collection);
        }
        const item = new PlayItem({
          file,
          collection,
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
        for (let device of get(devicesOnline)) {
          if (device.active) {
              activeDeviceId.set(device.id);
              break;
          }
        };

        console.log("Devices: ", get(devicesOnline));
        console.log("Selected device: ", get(activeDeviceId));

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
}

connectWebSocket();

export function reconnectWebSocketIfNeeded() {
  if (webSocket && webSocket.readyState === webSocket.CONNECTING) {
    return;
  }
  if (!webSocket || webSocket.readyState !== webSocket.OPEN) {
    connectWebSocket();
  }
}

export function sendWsMessage(msg: WSMessage) {
  const json = JSON.stringify(msg);
  waitForSocketConnection(function() {
    webSocket.send(json);
  });
}

function waitForSocketConnection(callback: Function){
  setTimeout(
    function () {
      if (webSocket.readyState === webSocket.OPEN) {
        if (callback != null){
          callback();
        }
      } else {
          waitForSocketConnection(callback);
      }
    }, 500);
}

export function isActiveDevice() {
  return deviceId === activeDeviceId;
}