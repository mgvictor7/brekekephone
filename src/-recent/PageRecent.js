import { mdiPhone } from '@mdi/js';
import { observer } from 'mobx-react';
import PropTypes from 'prop-types';
import React from 'react';

import authStore from '../-/authStore';
import contactStore from '../-/contactStore';
import g from '../global';
import FieldGroup from '../shared/FieldGroup';
import Item from '../shared/ItemUser';
import Layout from '../shared/Layout';
import Search from '../shared/Search';

@observer
class Recent extends React.Component {
  static contextTypes = {
    sip: PropTypes.object.isRequired,
  };

  isMatchUser = call => {
    if (call.partyNumber.includes(contactStore.searchText)) {
      return call.id;
    }
  };

  callBack = id => {
    const number = authStore.profile.recentCalls?.find(c => c.id === id)
      ?.partyNumber;
    if (number) {
      this.context.sip.createSession(number);
      g.goToCallsManage();
    } else {
      g.showError({ message: `Could not find number from store to call` });
    }
  };

  getAvatar = id => {
    const ucUser = contactStore.getUCUser(id) || {};

    return {
      id: id,
      avatar: ucUser.avatar,
    };
  };

  getMatchUserIds = () =>
    authStore.profile.recentCalls.filter(this.isMatchUser);

  render() {
    const users = this.getMatchUserIds();
    return (
      <Layout
        header={{
          title: `Recent`,
        }}
      >
        <Search />
        <React.Fragment>
          <FieldGroup>
            {users.length !== 0 &&
              users.map((u, i) => (
                <Item
                  last={i === users.length - 1}
                  icon={[mdiPhone]}
                  function={[() => this.callBack(u.id)]}
                  detail={true}
                  {...this.getAvatar(u.partyNumber)}
                  {...u}
                />
              ))}
          </FieldGroup>
        </React.Fragment>
      </Layout>
    );
  }
}

export default Recent;
