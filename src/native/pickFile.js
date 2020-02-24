import { mdiDotsHorizontal } from '@mdi/js';
import { Platform } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import * as ImagePicker from 'react-native-full-image-picker';
import shortid from 'shortid';

import g from '../global';
import intl from '../intl/intl';

ImagePicker.AlbumView.autoConvertPath = true;
ImagePicker.AlbumListView.autoConvertPath = true;

const actionSheetHandlers = [
  () =>
    new Promise(resolve => {
      ImagePicker.getCamera({
        callback: arr => resolve(arr[0]),
        maxSize: 1,
      });
    }),
  () =>
    new Promise(resolve => {
      ImagePicker.getVideo({
        callback: arr => resolve(arr[0]),
      });
    }),
  () =>
    new Promise(resolve => {
      ImagePicker.getAlbum({
        callback: arr => resolve(arr[0]),
        maxSize: 1,
      });
    }),
  () =>
    DocumentPicker.pick({
      type: [DocumentPicker.types.allFiles],
    }),
];

const pickFile = cb =>
  g.openPicker({
    options: [
      {
        key: 0,
        label: intl`Take a new photo`,
        icon: mdiDotsHorizontal,
      },
      {
        key: 1,
        label: intl`Take a new video`,
        icon: mdiDotsHorizontal,
      },
      {
        key: 2,
        label: intl`Select from photo library`,
        icon: mdiDotsHorizontal,
      },
      {
        key: 3,
        label: intl`More...`,
        icon: mdiDotsHorizontal,
      },
    ],
    onSelect: i => pickFileOnSelect(i, cb),
  });

const pickFileOnSelect = async (i, cb) => {
  const fn = actionSheetHandlers[i];
  if (!fn) {
    return;
  }
  //
  let file = null;
  try {
    file = await fn();
  } catch (err) {
    if (!DocumentPicker.isCancel(err)) {
      g.showError({
        message: intl`Failed to pick file from system`,
        err,
      });
    }
  }
  if (!file?.uri) {
    return;
  }
  //
  const getName = p =>
    p &&
    p
      .split(/[\\/]/g)
      .pop()
      .replace(/\?.+$/, ``);
  let name = file.fileName || file.filename || file.name || getName(file.uri);
  let size = file.fileSize || file.filesize || file.size || 0;
  if (!size) {
    try {
      const stat = await RNFS.stat(file.uri);
      name = getName(stat.originalFilepath || stat.path) || name;
      size = stat.size;
    } catch (err) {}
  }
  //
  let ext = name
    .split(`.`)
    .pop()
    .replace(/\?.+$/, ``);
  if (Platform.OS === `ios` && ext === name) {
    name = shortid();
    switch (file.type) {
      case `image`:
        ext = `jpg`;
        break;
      case `video`:
        ext = `mp4`;
        break;
      case `audio`:
        ext = `mp3`;
        break;
      default:
        break;
    }
  }
  //
  if (!name.toLowerCase().endsWith(ext.toLowerCase())) {
    name = name + `.` + ext;
  }
  //
  cb({ uri: file.uri, name, size });
};

export default pickFile;
