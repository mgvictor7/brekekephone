import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import chatStore from '../../shared/chatStore';
import contactStore from '../../shared/contactStore';
import Toast from '../../shared/Toast';
import UI from './ui';

@observer
class View extends React.Component {
  static contextTypes = {
    uc: PropTypes.object.isRequired,
  };

  render() {
    return (
      <UI
        groups={chatStore.groups.filter(g => !g.jointed).map(g => g.id)}
        formatGroup={this.formatGroup}
        accept={this.accept}
        reject={this.reject}
      />
    );
  }

  formatGroup = id => {
    const { inviter, name } = chatStore.getGroup(id) || {};
    const inviterName = contactStore.getUCUser(inviter)?.name;
    return {
      name,
      inviter: inviterName || inviter,
    };
  };

  reject = group => {
    this.context.uc
      .leaveChatGroup(group)
      .then(this.onRejectSuccess)
      .catch(this.onRejectFailure);
  };
  onRejectSuccess = res => {
    chatStore.removeGroup(res.id);
  };
  onRejectFailure = err => {
    console.error(err);
    Toast.error('Failed to reject the group chat');
  };

  accept = group => {
    this.context.uc.joinChatGroup(group).catch(this.onAcceptFailure);
  };
  onAcceptFailure = err => {
    console.error(err);
    Toast.error('Failed to accept the group chat');
  };
}

export default View;