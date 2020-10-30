import { Platform } from 'react-native'
import DocumentRnPicker0 from 'react-native-document-picker'
import RNFS from 'react-native-fs'
import * as ImageRnPicker from 'react-native-full-image-picker'
import { v4 as uuid } from 'react-native-uuid'

import RnPicker from '../global/RnPicker'
import { onPickFileNativeError, pickFileNativeOptions } from './pickFile.web'

ImageRnPicker.AlbumView.autoConvertPath = true
ImageRnPicker.AlbumListView.autoConvertPath = true

const DocumentRnPicker = DocumentRnPicker0 as any

const actionSheetHandlers = [
  () =>
    new Promise(resolve => {
      ImageRnPicker.getCamera({
        callback: arr => resolve(arr[0]),
        maxSize: 1,
      })
    }),
  () =>
    new Promise(resolve => {
      ImageRnPicker.getVideo({
        callback: arr => resolve(arr[0]),
      })
    }),
  () =>
    new Promise(resolve => {
      ImageRnPicker.getAlbum({
        callback: arr => resolve(arr[0]),
        maxSize: 1,
      })
    }),
  () =>
    DocumentRnPicker.pick({
      type: [DocumentRnPicker.types.allFiles],
    }),
]

const pickFile = cb =>
  RnPicker.open({
    options: pickFileNativeOptions(),
    onSelect: i => pickFileOnSelect(i, cb),
  })

const pickFileOnSelect = async (i, cb) => {
  const fn = actionSheetHandlers[i]
  if (!fn) {
    return
  }
  //
  let file: any = null
  try {
    file = await fn()
  } catch (err) {
    if (!DocumentRnPicker.isCancel(err)) {
      onPickFileNativeError(err)
    }
  }
  if (!file?.uri) {
    return
  }
  //
  const getName = p => p && p.split(/[\\/]/g).pop().replace(/\?.+$/, '')
  let name = file.fileName || file.filename || file.name || getName(file.uri)
  let size = file.fileSize || file.filesize || file.size || 0
  if (!size) {
    try {
      const stat = await RNFS.stat(file.uri)
      name = getName(stat.originalFilepath || stat.path) || name
      size = stat.size
    } catch (err) {}
  }
  //
  let ext = name.split('.').pop().replace(/\?.+$/, '')
  if (Platform.OS === 'ios' && ext === name) {
    name = uuid()
    switch (file.type) {
      case 'image':
        ext = 'jpg'
        break
      case 'video':
        ext = 'mp4'
        break
      case 'audio':
        ext = 'mp3'
        break
      default:
        break
    }
  }
  //
  if (!name.toLowerCase().endsWith(ext.toLowerCase())) {
    name = name + '.' + ext
  }
  //
  cb({ uri: file.uri, name, size })
}

export default pickFile