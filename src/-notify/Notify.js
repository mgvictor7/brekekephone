import { mdiCheck, mdiClose } from '@mdi/js';
import { observer } from 'mobx-react';
import React from 'react';

import { StyleSheet, Text, View } from '../native/Rn';
import ButtonIcon from '../shared/ButtonIcon';
import v from '../variables';

const s = StyleSheet.create({
  Notify: {
    flexDirection: `row`,
    alignItems: `center`,
    width: 288,
    backgroundColor: v.bg,
    marginBottom: 10,
    alignSelf: `flex-start`,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    ...v.boxShadow,
    elevation: 3,
  },

  Notify_Info: {
    flex: 1,
    paddingLeft: 12,
    paddingVertical: 5,
  },

  Notify_Btn_reject: {
    borderColor: v.redBg,
  },
  Notify_Btn_accept: {
    borderColor: v.mainBg,
  },
});

const Notify = observer(p => {
  return (
    <View style={s.Notify}>
      {p.type === `call` && (
        <View style={s.Notify_Info}>
          <Text>
            {p.remoteVideoEnabled
              ? `Incoming video call`
              : `Incoming voice call`}
          </Text>
          <Text>{p.partyName?.toUpperCase()}</Text>
          <Text>{p.partyNumber}</Text>
        </View>
      )}
      {p.type === `inviteChat` && (
        <View style={s.Notify_Info}>
          <Text>Group chat invited</Text>
          <Text>{p.name.toUpperCase()}</Text>
          <Text>by{p.inviter}</Text>
        </View>
      )}
      <ButtonIcon
        color={v.redBg}
        onPress={() => p.reject(p.id)}
        path={mdiClose}
        size={30}
        style={s.Notify_Btn_reject}
      />
      <ButtonIcon
        color={v.mainBg}
        onPress={() => p.accept(p.id)}
        path={mdiCheck}
        size={30}
        style={s.Notify_Btn_accept}
      />
    </View>
  );
});

export default Notify;
