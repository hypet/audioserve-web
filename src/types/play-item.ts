import { get } from "svelte/store";
import {
  apiConfig,
  selectedCollection,
} from "../state/stores";
import type { AudioFileExt } from "./types";

export interface PlayItemParams {
  file: AudioFileExt;
  collection?: number;
  startPlay?: boolean;
  time?: number;
}

export class PlayItem {
  id: number;
  url: string;
  duration: number | undefined;
  name: string;
  path: string;
  startPlay?: boolean;
  cached: boolean;
  time?: number;
  mime: string;

  constructor(params: PlayItemParams) {
    this.id = params.file.id;
    this.url = this.constructURLWithId(params.file.id, params.collection);
    this.duration = params.file.meta?.duration;
    this.name = params.file.name;
    this.path = params.file.path.join("/");
    this.cached = false;
    this.startPlay = params.startPlay;
    this.time = params.time;
    this.mime = params.file.mime;
  }

    // private constructURL(file: AudioFileExt, collection?: number) {
  //   const basePath = get(apiConfig).basePath;
  //   const col = collection ?? get(selectedCollection);
  //   let url = basePath + "/" + col + "/audio/" + encodeURIComponent(file.path);
  //   const query = new URLSearchParams();
  //   if (this.transcoding) {
  //     query.append("trans", this.transcoding);
  //   }
  //   const queryString = query.toString();
  //   if (queryString) {
  //     url += "?" + queryString;
  //   }
  //   return url;
  // }

  private constructURLWithId(track_id: number, collection?: number) {
    const basePath = get(apiConfig).basePath;
    const col = collection ?? get(selectedCollection);
    let url = basePath + "/" + col + "/media/" + track_id;
    const query = new URLSearchParams();
    // if (this.transcoding) {
    //   query.append("trans", this.transcoding);
    // }
    const queryString = query.toString();
    if (queryString) {
      url += "?" + queryString;
    }
    return url;
  }

  // This is much more complicated, then I thought
  // 1) For reliable format support probably  webm/audio has to be used
  // 2) MP3 works only in chrome :-(
  // 3) If try to feed all audiofile, chrome fails on full buffer
  // This means much more work is needed -  MediaSource will have to be available to player, which
  // will manage cache buffer and will have to call remove for old parts
  // On the other hand there is big potential for loading only required parts of audio,
  // Media source can handle widows of audio frames.
  // I guess to really leverage it on must read the specification first.

  createMediaSourceUrl() {
    const mediaSource = new MediaSource();
    mediaSource.addEventListener("sourceopen", (evt) => {
      console.debug("Media source opened", evt);
      fetch(this.url, { credentials: "include" })
        .then((resp) => {
          if (resp.status >= 400) {
            throw new Error("Error response from server: " + resp.status);
          }
          let mime = resp.headers.get("Content-Type");
          // if (mime =="audio/ogg") {
          //     mime= "audio/webm; codecs=opus"
          // }
          if (!MediaSource.isTypeSupported(mime)) {
            throw new Error(
              `Mime type ${mime} is not supported as MediaSource`
            );
          }
          const mediaBuffer = mediaSource.addSourceBuffer(mime);
          const inputStream = resp.body.getReader();

          let reader = ({ done, value }: { done: boolean; value: any }) => {
            if (done) {
              console.debug("End of stream for " + this.url);
            } else {
              console.debug(`Read ${value.length} bytes`);
              mediaBuffer.appendBuffer(value);
            }
          };
          inputStream.read().then(reader);
          mediaBuffer.addEventListener("updateend", () =>
            inputStream.read().then(reader)
          );
          mediaBuffer.addEventListener("error", (e) => {
            console.error("Media stream error", e);
          });
        })
        .catch((e) => {
          console.error("Media source error", e);
          mediaSource.endOfStream("network");
        });
    });

    return URL.createObjectURL(mediaSource);
  }

  public setTime(time: number) {
    this.time = time;
  }
}
