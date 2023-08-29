<script lang="ts">
  import { getContext, onDestroy } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import { EventType } from "../cache";
  import type { Cache, CacheEvent } from "../cache";
  import ContinuePlay from "svelte-material-icons/PlayCircleOutline.svelte";
  import SortNameIcon from "svelte-material-icons/SortAlphabeticalAscending.svelte";
  import SortTimeIcon from "svelte-material-icons/SortClockAscendingOutline.svelte";

  import type { PositionShort } from "../client";
  import {
    colApi,
    currentFolder,
    group,
    isAuthenticated,
    playItem,
    playList,
    selectedCollection,
    sendWsMessage,
  } from "../state/stores";
  import { FolderType, NavigateTarget, StorageKeys, WSMessageOutType } from "../types/enums";
  import { PlayItem } from "../types/play-item";
  import { formatWSMessage, type AudioFileExt, type WSMessage } from "../types/types";
  import { formatTime } from "../util/date";
  import {
    nonEmpty,
    sorted,
  } from "../util";
  import FileItem from "./FileItem.svelte";
  import Description from "./Description.svelte";
  import Cover from "./Cover.svelte";
  import type { HistoryRecord, HistoryWrapper } from "../util/history";
  import { getLocationPath } from "../util/browser";
  import { Debouncer } from "../util/events";
  import Badge from "./Badge.svelte";
  import { Scroller } from "../util/dom";
  import { Observer } from "../util/intersect";

  const cache: Cache = getContext("cache");
  const history: HistoryWrapper = getContext("history");

  export let container: HTMLDivElement;
  let observer: Observer;
  $: {
    if (container) {
      observer = new Observer(container, { rootMargin: "64px" });
    }
  }

  export let infoOpen = false;
  export const navigate = (where: NavigateTarget) => {
    console.debug("navigate");    
    if (!folderIsPlaying()) {
      $selectedCollection = $playList.collection;
      $currentFolder = { value: $playList.folder, type: FolderType.REGULAR };
    } else if (where === NavigateTarget.PLAY_ITEM) {
      const elem: HTMLElement = document.querySelector("div.item.active");
      if (elem != null) {
        const scroller = new Scroller(container);
        scroller.scrollToView(elem.parentElement);
      }
    }
  };

  let files: Map<number, AudioFileExt> = new Map<number, AudioFileExt>();
  let dirs: Map<string, AudioFileExt[]> = new Map<string, AudioFileExt[]>();
  let folderPath: string | undefined;
  let searchQuery: string | undefined;
  let folderTime: number;
  let folderTags: object = null;
  let sharedPosition: PositionShort | null;
  let sharePositionDisplayName: string;

  let descriptionPath: string;
  let coverPath: string;

  let sortTime = false;
  
  async function searchFor(query: string) {
    try {
      const result = await $colApi.colIdSearchGet({
        colId: $selectedCollection,
        q: query,
        group: $group,
      });

      // files = [];

      searchQuery = query;

      // Other properties are not relevant and should be reset
      sharedPosition = undefined;
      folderPath = undefined;
      folderTime = undefined;
      folderTags = undefined;
      descriptionPath = undefined;
      coverPath = undefined;
    } catch (resp) {
      console.error("Cannot search", resp);
      if (resp.status === 401) {
        $isAuthenticated = false;
      } else {
        window.alert("Failed to search");
        if (folderPath) {
          $currentFolder = { type: FolderType.REGULAR, value: folderPath };
        }
      }
    }
  }

  export async function loadAll() {
    try {
      console.log("loadAll");
      const audioFolder = await $colApi.colIdAll({
        colId: $selectedCollection,
      });

      files = audioFolder.files!;
      dirs = new Map<string, AudioFileExt[]>();
      audioFolder.files!.forEach((f: AudioFileExt) => {
        var artist = null;
        var title = null;
        if (f.meta && f.meta.tags) {
          const fileTags: Map<string, string> = f.meta.tags as Map<string, string>;
          if (fileTags && fileTags.size > 0) {
            artist = fileTags.get("Artist");
            title = fileTags.get("Title");
          }
        }

        const key = artist || f.parent_dir;
        const filesInDir = dirs.get(key) || [];
        filesInDir.push(f);
        dirs.set(f.parent_dir, filesInDir);
      });

      folderTime = audioFolder.totalTime;
      folderTags = audioFolder.tags;
      descriptionPath = audioFolder.description?.path;
      coverPath = audioFolder.cover?.path;
      folderPath = folder;

      $playList = {
        files,
        dirs,
        collection: $selectedCollection,
        folder: $currentFolder.value,
        totalTime: folderTime,
        hasImage: coverPath && coverPath.length > 0,
      };

  } catch (resp) {
      console.error("Cannot load all", resp);
      if (resp.status === 404) {
        console.error("loadAll not found")
        $currentFolder = { value: "", type: FolderType.REGULAR };
      } else if (resp.status === 401) {
        $isAuthenticated = false;
      }
    } finally {
      searchQuery = undefined;
    }
  }

  export function constructHistoryState(scrollTo?: number): HistoryRecord {
    if (searchQuery != null) {
      return {
        folderType: FolderType.SEARCH,
        value: searchQuery,
        collection: $selectedCollection,
        scrollTo,
      };
    } else if (folderPath != null) {
      return {
        folderType: FolderType.REGULAR,
        value: folderPath,
        collection: $selectedCollection,
        scrollTo,
      };
    }
  }

  function navigateTo(folder: string) {
    return () => {
      console.debug("navigateTo");
      $currentFolder = { value: folder, type: FolderType.REGULAR };
    };
  }

  function playSharedPosition() {
    // const idx = files.findIndex((f) => f.path === sharedPosition.path);
    // if (idx >= 0) {
    //   startPlaying(idx, true, sharedPosition.position);
    // }
  }

  function startPlaying(position: number, startPlay = true, time?: number) {
    const file = files.get(position);
    const item = new PlayItem({
      file,
      // position,
      startPlay,
      time,
    });
    let playTrack: WSMessage = formatWSMessage(WSMessageOutType.PlayTrack, 
        { collection: $selectedCollection, track_id: file.id }
      );
    sendWsMessage(playTrack);
    $playItem = item;
    console.debug("startPlaying end");
  }

  const unsubsribe: Unsubscriber[] = [];

  unsubsribe.push(
    selectedCollection.subscribe((col) => {
      if (col != undefined) {
        // initiall app load
        if (folderPath === undefined) {
          if (!$currentFolder) {
            // restore last path from localStorage
            $currentFolder = {
              value: localStorage.getItem(StorageKeys.LAST_FOLDER) || "",
              type: FolderType.REGULAR,
            };
          }
        } else {
          // go to root of other collection
          $currentFolder = { value: "", type: FolderType.REGULAR };
          if (folderPath === "") {
            // TODO: fix it by having currentFolder as object
            // have to enforce reload
            loadAll();
          }
        }
        localStorage.setItem(
          StorageKeys.LAST_COLLECTION,
          $selectedCollection.toString()
        );
      }
    })
  );

  function folderIsPlaying(): boolean {
    return (
      $playList &&
      $playList.collection === $selectedCollection &&
      $playList.folder === folderPath
    );
  }

  $: if ($currentFolder != undefined) {
    console.log("Browser loadAll...");
    let done: Promise<void>;
    const scrollTo = $currentFolder.scrollTo;
    if ($currentFolder.type === FolderType.REGULAR) {
      done = loadAll();
    } else if ($currentFolder.type === FolderType.SEARCH) {
      done = searchFor($currentFolder.value);
    }

    done.then(() => {
      history.add(constructHistoryState());
      if (!folderIsPlaying()) {
        // Do not scroll to history postion if current folder is playing
        // console.debug("History scroll to " + scrollTo);
        container.scrollTo({ top: scrollTo || 0 });
      }
    });
  }

  const globalPathPrefix = getLocationPath();

  function handleCacheEvent(evt: CacheEvent) {
    console.log("handleCacheEvent");
    const item = evt.item;
    if (item) {
      const cached = evt.kind === EventType.FileCached;
      console.debug("File cached", item);
    }
  }

  cache?.addListener(handleCacheEvent);

  let scrollDebouncer = new Debouncer<void>(() => {
    history.update(constructHistoryState(container.scrollTop));
  }, 250);

  const updateScroll = () => scrollDebouncer.debounce();
  $: container?.addEventListener("scroll", updateScroll);

  onDestroy(() => {
    unsubsribe.forEach((u) => u());
    cache?.removeListener(handleCacheEvent);
    container.removeEventListener("scroll", updateScroll);
    observer.close();
  });

  // function generateDownloadPath(): string {
  //   return (
  //     $apiConfig.basePath +
  //     `/${$selectedCollection}/download/${encodeURIComponent(folderPath)}` +
  //     (isCollapsed ? "?collapsed" : "")
  //   );
  // }
</script>

<div id="browser">
  <div class="main-browser-panel">
    {#if dirs.size > 0}
      {#each sorted(Array.from(dirs.keys())) as dir}
      {@const fileList = dirs.get(dir)}
      {#if fileList && fileList.length > 0}
      <details open role="region" aria-label="Files" class="details-album">
        <summary>{dir}<Badge value={fileList.length} />
          <!-- <span class="files-duration"><ClockIcon />
            <span>{formatTime(folderTime)}</span>
          </span> -->
          <!-- {#if $collections && $collections.folderDownload}
            <a href={generateDownloadPath()} target="_self"><span class="summary-icons" aria-label="Download"><DownloadFolderIcon /></span></a>
          {/if} -->
        </summary>
          <ul class="items-list">
            {#each fileList.sort((a, b) => (a.name < b.name ? -1 : 1)) as file}
              <FileItem
                {file}
                position={file.id}
                {container}
                playFunction={startPlaying}
              />
            {/each}
          </ul>
        </details>
        {/if}
      {/each}
    {/if}
      </div>
  {#if $currentFolder && $currentFolder.type === FolderType.REGULAR}
    <div class="browser-sidebar">
      {#if sharedPosition && sharePositionDisplayName}
        <div class="last-position" id="last-remote-position">
          <button
            on:click={playSharedPosition}
            aria-label="Continue on last position in this folder"
            ><ContinuePlay size="2rem" />
            {sharePositionDisplayName} at {formatTime(
              sharedPosition.position
            )}</button
          >
        </div>
      {/if}
      {#if coverPath || descriptionPath || nonEmpty(folderTags)}
        <details bind:open={infoOpen} role="complementary">
          <summary>Info</summary>
          {#if infoOpen}
            {#if coverPath}
              <div id="folder-cover">
                <Cover {coverPath} />
              </div>
            {/if}
            {#if nonEmpty(folderTags)}
              <div id="folder-tags">
                <table role="grid">
                  <tbody>
                    {#each sorted(Object.keys(folderTags)) as k}
                      <tr>
                        <th>{k}</th>
                        <td>{folderTags[k]}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {/if}
            {#if descriptionPath}
              <div id="folder-description">
                <Description {descriptionPath} />
              </div>
            {/if}
          {/if}
        </details>
      {/if}
    </div>
  {/if}
</div>

<style>
  #folder-tags {
    margin-top: 1rem;
  }

  .files-duration {
    font-size: 80%;
    display: inline-block;
    font-weight: normal;
    vertical-align: text-bottom;
  }
  .summary-icons {
    color: var(--primary);
  }
  .browser-sidebar button {
    overflow: hidden;
  }
  #browser {
    display: flex;
    flex-wrap: nowrap;
    flex-direction: row;
  }

  .main-browser-panel {
    width: 100%;
    margin-right: 3em;
  }

  .browser-sidebar {
    width: 66%;
    padding-right: 1rem;
  }

  @media (max-width: 770px) {
    #browser {
      flex-direction: column-reverse;
    }
    .browser-sidebar {
      width: 100%;
      padding-right: 0;
    }
  }
  .details-album {
    --spacing: 0.2rem;
  }
  summary {
    font-weight: bold;
    font-size: 1.0rem;
    line-height: 1.0rem;
  }
</style>
