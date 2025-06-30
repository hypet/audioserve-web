<script lang="ts">
  import { getContext, onDestroy, createEventDispatcher } from "svelte";
  import type { Unsubscriber } from "svelte/store";
  import { EventType } from "../cache";
  import type { Cache, CacheEvent } from "../cache";
  import ContinuePlay from "svelte-material-icons/PlayCircleOutline.svelte";
  import SortNameIcon from "svelte-material-icons/SortAlphabeticalAscending.svelte";
  import SortTimeIcon from "svelte-material-icons/SortClockAscendingOutline.svelte";

  import type { AudioFile, PositionShort, SearchResult, Subfolder } from "../client";
  import {
    colApi,
    currentFolder,
    group,
    isAuthenticated,
    playItem,
    playList,
    searchTerm,
    selectedCollection,
    sendWsMessage,
  } from "../state/stores";
  import { FolderType, NavigateTarget, StorageKeys, WSMessageOutType } from "../types/enums";
  import { PlayItem } from "../types/play-item";
  import { formatWSMessage, type WSMessage, type NavigateFolder } from "../types/types";
  import { formatTime } from "../util/date";
  import {
    nonEmpty,
    sorted,
  } from "../util";
  import {
    pathToString
  } from "../util/browser"
  import FileItem from "./FileItem.svelte";
  import Description from "./Description.svelte";
  import Cover from "./Cover.svelte";
  import type { HistoryRecord, HistoryWrapper } from "../util/history";
  import { getLocationPath } from "../util/browser";
  import { Debouncer } from "../util/events";
  import Badge from "./Badge.svelte";
  import { Scroller } from "../util/dom";
  import { Observer } from "../util/intersect";
  import { SortedMap } from "collections/sorted-map";
  import { Set } from "collections/set";
  import type { ScoredAudioFile } from "../client/models/ScoredAudioFile";

  const cache: Cache = getContext("cache");
  const history: HistoryWrapper = getContext("history");
  
  export let container: HTMLDivElement;
  let observer: Observer;
  $: {
    if (container) {
      observer = new Observer(container, { rootMargin: "64px" });
    }
  }

  $: if (selectedCollection) {
    loadAll();
  }

  export let infoOpen = false;
  export const navigate = (where: NavigateTarget) => {
    if (!folderIsPlaying()) {
      $selectedCollection = $playList.collection;
      $currentFolder = { value: $playList.folder, type: FolderType.REGULAR };
    } else if (where === NavigateTarget.PLAY_ITEM) {
      const elem: HTMLElement = document.querySelector("div.item.active");
      if (elem != null) {
        const scroller = new Scroller(container);
        scroller.scrollToView(elem.parentElement);
      }
    } else if (where === NavigateTarget.PLAYLIST_FOLDER) {
      if (!$playItem) return;
      navigateTo(pathToString($playItem.path))();
    }
  };

  let files: Map<number, AudioFile> = new Map<number, AudioFile>();
  let rootDirToSubfolders: SortedMap<string, Set<string>> = new SortedMap()
  let subDirToTrackIds: SortedMap<string, number[]> = new SortedMap();

  let searchResult: ScoredAudioFile[] = [];
  $: {
    if ($searchTerm.length > 0) {
      if ($searchTerm != searchQuery) {
        searchFor($searchTerm);
        searchQuery = $searchTerm;
      }
    } 
    else {
      searchResult = [];
      $playList = {
        files: files,
        dirs: new Map(),
        collection: $selectedCollection,
        totalTime: folderTime,
        hasImage: coverPath && coverPath.length > 0,
      };
    }
  }

  let folderPath: string | undefined;
  let searchQuery: string | undefined;
  let folderTime: number;
  let folderTags: object = null;
  let sharedPosition: PositionShort | null;
  let sharePositionDisplayName: string;
  let descriptionPath: string;
  let coverPath: string;
  
  async function search_request(query: string): Promise<SearchResult> {
    const result = await $colApi.colIdSearchGet({
        colId: $selectedCollection,
        q: query,
        group: $group,
      });
    return result;
  }

  function searchFor(query: string) {
    search_request(query).then((result) => {
      searchResult = result.files || [];
    })
    .catch((error) => {
      console.error(error);
      searchResult = [];
    }).then(() => {
      const elem = container.firstChild;
      const scroller = new Scroller(container);
      if (elem != null) scroller.scrollToView(elem);
    });
  }

  export async function loadAll() {
    try {
      const now = Date.now();
      const audioFolder = await $colApi.colIdAll({
        colId: $selectedCollection,
      });

      files = audioFolder.files!;
      const rootDirToSubfoldersLocal: SortedMap<string, Set<string>> = new SortedMap();
      const subDirToTrackIdsLocal: SortedMap<string, number[]> = new SortedMap();

      files.forEach((f: AudioFile) => {
        var artist = null;
        var title = null;
        if (f.meta && f.meta.tags) {
          const fileTags: Map<string, string> = f.meta.tags as Map<string, string>;
          if (fileTags && fileTags.size > 0) {
            artist = fileTags.get("Artist");
            title = fileTags.get("Title");
          }
        }

        const rootDir = f.path[0];
        const dir = pathToString(f.path);

        const rootDirContent = rootDirToSubfoldersLocal.get(rootDir) || new Set<string>();
        rootDirContent.add(pathToString(f.path.slice(1, f.path.length)));
        rootDirToSubfoldersLocal.set(rootDir, rootDirContent);

        const subDirContent = subDirToTrackIdsLocal.get(dir) || [];
        subDirContent.push(f.id);
        subDirToTrackIdsLocal.set(dir, subDirContent);
      });

      // folderTime = audioFolder.totalTime;
      // folderTags = audioFolder.tags;
      // descriptionPath = audioFolder.description?.path;
      // coverPath = audioFolder.cover?.path;
      rootDirToSubfolders = rootDirToSubfoldersLocal;
      subDirToTrackIds = subDirToTrackIdsLocal;
      $playList = {
        files,
        rootDirToSubfolders: rootDirToSubfoldersLocal,
        collection: $selectedCollection,
        totalTime: folderTime,
        hasImage: coverPath && coverPath.length > 0,
      };
      console.log("loadAll time:", (Date.now() - now));
  } catch (resp) {
      console.error("Cannot load all", resp);
      if (resp.status === 404) {
        console.error("loadAll not found")
        $currentFolder = { value: "", type: FolderType.REGULAR };
      } else if (resp.status === 401) {
        $isAuthenticated = false;
      }
    } finally {
      // searchQuery = undefined;
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
      const id = folderNameToId(folder);
      $selectedCollection = $playList.collection;
      const elem: HTMLElement = document.getElementById(id);
      const scroller = new Scroller(container, 10);
      scroller.scrollToView(elem);
    };
  }

  function folderNameToId(folder: string): string {
    return folder.replace(/\W/g,'_');
  }

  function playSharedPosition() {
    // const idx = files.findIndex((f) => f.path === sharedPosition.path);
    // if (idx >= 0) {
    //   startPlaying(idx, true, sharedPosition.position);
    // }
  }

  function startPlaying(position: number, startPlay = true, time?: number) {
    const file = files.get(position)!;
    const item = new PlayItem({
      file,
      collection: $selectedCollection,
      startPlay,
      time,
    });
    let playTrack: WSMessage = formatWSMessage(WSMessageOutType.PlayTrack, 
        { collection: $selectedCollection, track_id: file.id }
      );
    sendWsMessage(playTrack);
    $playItem = item;
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
  <div class="folders-sidebar-wrap">
    <div class="folders-sidebar">
      {#if searchResult.length === 0 && rootDirToSubfolders.size > 0 }
        {#each rootDirToSubfolders.keys() as dir}
        {@const subDirs = rootDirToSubfolders.get(dir)}
        <details open role="region" aria-label="Folders" class="details-folder">
          <summary class="subdir"><span class="subdir" role="link" on:click={navigateTo(dir)} >{dir}</span></summary>
          <ul class="subdir-list">
              {#each Array.from(subDirs) as subDir}
              <span class="subdir" role="link" on:click={navigateTo(dir + " > " + subDir)} >{subDir}</span>
              {/each}
            </ul>
          </details>
        {/each}
      {/if}
    </div>
  </div>
  <div class="main-browser-panel">
    {#if searchResult.length > 0}
      {#each searchResult as scoredItem}
      {@const file = scoredItem.item}
      {@const dir = pathToString(file.path)}
      {@const folderId = folderNameToId(dir)}
      <details open role="region" aria-label="Files" class="details-album">
        <summary id="{folderId}">{dir}</summary>
          <ul class="items-list">
              <FileItem
                {file}
                position={file.id}
                {container}
                playFunction={startPlaying}
              />
          </ul>
        </details>
      {/each}
    {:else}
      {#if subDirToTrackIds.size > 0}
        {#each subDirToTrackIds.keys() as dir}
          {@const subDirIdList = subDirToTrackIds.get(dir)}
          {#if subDirIdList && subDirIdList.length > 0}
          <details open role="region" aria-label="Files" class="details-album">
            <summary id="{folderNameToId(dir)}">{dir}<Badge value={subDirIdList.length} />
            </summary>
              <ul class="items-list">
                {#each subDirIdList as trackId}
                {@const file = files.get(trackId)}
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

  .main-browser-panel-wrap {
    width: 100%;
    overflow-y: hidden;
  }

  .main-browser-panel {
    width: 100%;
    height: 100vh;
    margin-right: 3em;
    overflow-y: scroll;
  }

  .folder-item {
    width: 100%;
    box-sizing: border-box;
  }

  .folders-sidebar-wrap {
    width: 33%;
    overflow-y: hidden;
  }

  .folders-sidebar {
    width: 100%;
    height: 100vh;
    padding-left: 1rem;
    font-size: 0.7rem;
    overflow-y: scroll;
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
  .details-folder {
    --spacing: 0.4rem;
  }
  summary {
    font-weight: bold;
    font-size: 0.9rem;
    line-height: 0.9rem;
  }
  span.subdir {
    display: block;
    width: 100%;
    box-sizing: border-box;
    font-weight: normal;
    font-size: 0.7rem;
    line-height: 0.9rem;
  }
</style>
