import get from 'lodash/get'
import { AppState, Platform } from 'react-native'
import RNCallKeep from 'react-native-callkeep'
import { v4 as uuid } from 'react-native-uuid'

import { getAuthStore } from '../stores/authStore'
import callStore from '../stores/callStore'

const keysInCustomNotification = [
  'title',
  'alert',
  'body',
  'message',
  'from',
  'to',
  'tenant',
  'pbxHostname',
  'pbxPort',
  'my_custom_data',
  'is_local_notification',
]

const _parseNotificationData = (...fields: object[]): ParsedPn =>
  fields
    .filter(f => !!f)
    .map(f => {
      if (typeof f === 'string') {
        try {
          return JSON.parse(f)
        } catch (err) {}
      }
      return f
    })
    .reduce((map: { [k: string]: unknown }, f: { [k: string]: unknown }) => {
      if (!f || typeof f !== 'object') {
        return map
      }
      keysInCustomNotification.forEach(k => {
        const v = f[k]
        if (!(k in map) && v) {
          map[k] = v
        }
      })
      return map
    }, {})
const parseNotificationData = (raw: object) => {
  if (Platform.OS === 'android') {
    return _parseNotificationData(
      raw,
      get(raw, 'fcm'),
      get(raw, 'data'),
      get(raw, 'alert'),
      get(raw, 'data.alert'),
      get(raw, 'custom_notification'),
      get(raw, 'data.custom_notification'),
    )
  }
  if (Platform.OS === 'ios') {
    return _parseNotificationData(
      raw,
      get(raw, 'custom_notification'),
      get(raw, 'aps'),
      get(raw, 'aps.alert'),
      get(raw, '_data'),
      get(raw, '_data.custom_notification'),
      get(raw, '_alert'),
    )
  }
  // TODO handle web
  return null
}

const parse = (raw: { [k: string]: unknown }, isLocal = false) => {
  if (!raw) {
    return null
  }

  const n = parseNotificationData(raw)
  if (!n) {
    return null
  }
  if (!n.body) {
    n.body = n.message || n.title || n.alert
  }
  if (!n.body && !n.to) {
    return null
  }

  if (
    isLocal ||
    raw['my_custom_data'] ||
    raw['is_local_notification'] ||
    n.my_custom_data ||
    n.is_local_notification
  ) {
    const p = getAuthStore().findProfile({
      ...n,
      pbxUsername: n.to,
      pbxTenant: n.tenant,
    })
    if (getAuthStore().signedInId === p?.id) {
      getAuthStore().reconnect()
    }
    if (p?.id && !getAuthStore().signedInId) {
      getAuthStore().signIn(p.id)
    }
    return null
  }
  const re = /from\s+(.+)\s+to\s+(\S+)/
  const matches = re.exec(n.title) || re.exec(n.body)
  if (!n.from) {
    n.from = matches?.[1] || ''
  }
  if (!n.to) {
    n.to = matches?.[2] || ''
  }
  n.isCall = /call/i.test(n.body) || /call/i.test(n.title)
  if (!n.isCall) {
    return AppState.currentState !== 'active' ||
      getAuthStore().currentProfile?.pbxUsername !== n.to
      ? n
      : null
  }
  lastCallPn = n
  if (
    Platform.OS === 'android' &&
    !callStore.calls.filter(c => c.incoming && c.answered).length
  ) {
    RNCallKeep.displayIncomingCall(uuid(), 'Brekeke Phone', n.to)
  }
  // Call api to sign in
  getAuthStore().signInByNotification(n)
  return null
}

export type ParsedPn = {
  title: string
  body: string
  alert: string
  message: string
  from: string
  to: string
  tenant: string
  pbxHostname: string
  pbxPort: string
  my_custom_data: unknown
  is_local_notification: boolean
  isCall: boolean
}

let lastCallPn: ParsedPn | null = null
export const getLastCallPn = () => lastCallPn

export default parse
