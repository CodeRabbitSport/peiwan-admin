import { isServer } from './is'

export type DeviceType = 'pc' | 'pad' | 'phone'

function getUA() {
  if (isServer) return ''
  return navigator.userAgent || ''
}

function isIpadOS(): boolean {
  if (isServer) return false
  const ua = getUA()
  const isIpadUA = /iPad/.test(ua)
  const isIpadLike = navigator.platform === 'MacIntel' && (navigator as any).maxTouchPoints > 1
  return isIpadUA || isIpadLike
}

function isAndroidTablet(): boolean {
  if (isServer) return false
  const ua = getUA()
  return /Android/.test(ua) && !/Mobile/.test(ua)
}

function isAndroidPhone(): boolean {
  if (isServer) return false
  const ua = getUA()
  return /Android/.test(ua) && /Mobile/.test(ua)
}

function isIphone(): boolean {
  if (isServer) return false
  const ua = getUA()
  return /iPhone/.test(ua)
}

function isSmallViewportPhone(): boolean {
  if (isServer) return false
  try {
    return window.innerWidth < 768
  } catch {
    return false
  }
}

export function isPhone(): boolean {
  if (isServer) return false
  return isIphone() || isAndroidPhone() || (!isIpadOS() && !isAndroidTablet() && isSmallViewportPhone())
}

export function isPad(): boolean {
  if (isServer) return false
  return isIpadOS() || isAndroidTablet()
}

export function isPc(): boolean {
  if (isServer) return false
  return !isPhone() && !isPad()
}

export function getDeviceType(): DeviceType {
  if (isPhone()) return 'phone'
  if (isPad()) return 'pad'
  return 'pc'
}
