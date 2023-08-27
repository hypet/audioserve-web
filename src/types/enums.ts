export enum StorageKeys {
  LAST_FOLDER = "AUDIOSERVE_LAST_FOLDER",
  LAST_COLLECTION = "AUDIOSERVE_LAST_COLLECTION",
  LAST_FILE = "AUDIOSERVE_LAST_FILE",
  LAST_POSITION = "AUDIOSERVE_LAST_POSITION",
  LAST_PAUSE = "AUDIOSERVE_LAST_PAUSE",
  THEME = "AUDIOSERVE_THEME",
  TRANSCODING = "AUDIOSERVE_TRANSCODING",
  GROUP = "AUDIOSERVE_GROUP",
  PREFERENCES = "AUDIOSERVE_PREFERENCES",
  PLAYBACK_SPEED = "AUDIOSERVE_PLAYBACK_SPEED",
  PLAYBACK_VOLUME = "AUDIOSERVE_PLAYBACK_VOLUME",
}

export enum FolderType {
  REGULAR,
  SEARCH,
  RECENT,
  // ALL,
}

export enum NavigateTarget {
  PLAYLIST_FOLDER,
  PLAY_ITEM,
}

export enum ShuffleMode {
  Off = 0,
  CurrentDir = 1,
  CollectionWide = 2,
  Global = 3,
}

export enum WSMessageInType {
  RegisterDeviceEvent,
  DevicesOnlineEvent,
  MakeDeviceActiveEvent,
  PlayTrackEvent,
  PauseEvent,
  ResumeEvent,
  SwitchShuffleEvent,
  CurrentPosEvent,
  RewindToEvent,
  VolumeChangeEvent,
}

export enum WSMessageOutType {
  RegisterDevice,
  MakeDeviceActive,
  PlayTrack,
  Pause,
  Resume,
  NextTrack,
  PrevTrack,
  SwitchShuffle,
  CurrentPos,
  RewindTo,
  VolumeChange,
}