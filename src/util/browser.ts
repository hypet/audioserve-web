import { StorageKeys } from "../types/enums";

export function otherTheme() {
  const currentTheme = localStorage.getItem(StorageKeys.THEME) || "light";
  return currentTheme === "light" ? "dark" : "light";
}

export function getLocationPath(): string {
  let path = location.pathname;
  path = path.replace(/index.html$/, "")
  return path.replace(/\/+$/, "");
}

export function baseUrl(dev: boolean) {
  let url: string;
  if (dev) {
    url = "http://localhost:3000";
  } else {
    url = `${location.protocol}//${location.host}`;
  }
  const path = getLocationPath();
  if (path) url += path;

  return url;
}

function mapWsProtocol(p: string) {
  if (p == "http:") {
    return "ws:";
  } else if (p == "https:") {
    return "wss:";
  }
}

export function baseWsUrl(dev: boolean): string {
  let  baseUrl = dev
    ? `${mapWsProtocol(window.location.protocol)}//${
        window.location.hostname}:${window.location.port}`
    : `${mapWsProtocol(window.location.protocol)}//${window.location.host}`;

  const path = getLocationPath()
  if (path) {
    baseUrl += path
  }

  return baseUrl;
}

export function deviceName(): string {
    const { userAgent } = navigator
    let match = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []
    let temp
  
    if (/trident/i.test(match[1])) {
      temp = /\brv[ :]+(\d+)/g.exec(userAgent) || []
  
      return `IE ${temp[1] || ''}`
    }
  
    if (match[1] === 'Chrome') {
      temp = userAgent.match(/\b(OPR|Edge)\/(\d+)/)
  
      if (temp !== null) {
        return temp.slice(1).join(' ').replace('OPR', 'Opera')
      }
  
      temp = userAgent.match(/\b(Edg)\/(\d+)/)
  
      if (temp !== null) {
        return temp.slice(1).join(' ').replace('Edg', 'Edge (Chromium)')
      }
    }
  
    match = match[2] ? [ match[1], match[2] ] : [ navigator.appName, navigator.appVersion, '-?' ]
    temp = userAgent.match(/version\/(\d+)/i)
  
    if (temp !== null) {
      match.splice(1, 1, temp[1])
    }
  
    return match.join(' ').concat(' on ', navigator.platform)
}