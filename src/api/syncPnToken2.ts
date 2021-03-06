import { Platform } from 'react-native'

import { intlDebug } from '../stores/intl'
import profileStore, { Profile } from '../stores/profileStore'
import RnAlert from '../stores/RnAlert'
// @ts-ignore
import PushNotification from '../utils/PushNotification'
import { PBX } from './pbx'
import { setSyncPnTokenModule } from './syncPnToken'
import { updatePhoneIndexWithoutCatch } from './updatePhoneIndex'

const syncPnTokenWithoutCatch = async (p: Profile, pbx?: PBX) => {
  if (Platform.OS === 'web') {
    return
  }

  if (profileStore.pnSyncLoadingMap[p.id]) {
    return
  }
  profileStore.pnSyncLoadingMap[p.id] = true

  pbx = pbx || new PBX()
  await pbx.connect(p)
  const webPhone = await updatePhoneIndexWithoutCatch(p, pbx)
  if (!webPhone) {
    return
  }

  let t = await PushNotification.getToken()
  let tvoip = t
  if (Platform.OS === 'ios') {
    tvoip = await PushNotification.getVoipToken()
    if (!t) {
      t = tvoip
    }
  }

  const fn =
    Platform.OS === 'ios'
      ? p.pushNotificationEnabled
        ? pbx.setApnsToken
        : pbx.removeApnsToken
      : Platform.OS === 'android'
      ? p.pushNotificationEnabled
        ? pbx.setFcmPnToken
        : pbx.removeFcmPnToken
      : null
  if (!fn) {
    return
  }

  if (t) {
    await fn({
      username: webPhone.id,
      device_id: t,
    })
  }
  if (tvoip) {
    await fn({
      username: webPhone.id,
      device_id: tvoip,
      voip: true,
    })
  }

  pbx.disconnect()

  profileStore.upsertProfile({
    id: p.id,
    pushNotificationEnabledSynced: true,
  })

  profileStore.pnSyncLoadingMap[p.id] = false
}

const syncPnToken = (p: Profile, pbx?: PBX, silent = false) =>
  syncPnTokenWithoutCatch(p, pbx).catch((err: Error) => {
    profileStore.pnSyncLoadingMap[p.id] = false
    if (silent) {
      console.error(
        `Failed to sync Push Notification settings for ${p.pbxUsername}`,
        err,
      )
      return
    }
    RnAlert.error({
      message: intlDebug`Failed to sync Push Notification settings for ${p.pbxUsername}`,
      err,
    })
  })

const syncPnTokenForAllAccounts = (silent = false) => {
  profileStore.profiles.forEach(p => {
    if (p.pushNotificationEnabledSynced) {
      return
    }
    syncPnToken(p, undefined, silent)
  })
}

const m = {
  sync: syncPnToken,
  syncForAllAccounts: syncPnTokenForAllAccounts,
}
setSyncPnTokenModule(m)

export type TSyncPnToken = typeof m
