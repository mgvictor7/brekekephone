declare global {
  interface Window {
    Brekeke: Brekeke
  }
}

export type Brekeke = {
  pbx: {
    getPal(wsUri: string, options: GetPalOptions): Pbx
  }
  WebrtcClient: {
    Phone: Sip
  }
}

export type GetPalOptions = {
  tenant: string
  login_user: string
  login_password: string
  _wn: string
  park: string[]
  voicemail: string
  user: string
  status: boolean
  secure_login_password: boolean
  phonetype: string
}

/* PBX */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
export type Pbx = {
  login(resolve: () => void, reject: (err: Error) => void)
  close()

  debugLevel: number

  onClose?()
  onError?(err: Error)
  notify_serverstatus?(e: PbxEvent['serverStatus'])
  notify_status?(e: PbxEvent['userStatus'])
  notify_park?(e: PbxEvent['park'])
  notify_voicemail?(e: PbxEvent['voicemail'])

  // not actually exist in the sdk, should be added manually
  _pal<K extends keyof PbxPal, P = Parameters<PbxPal[K]>[0]>(
    k: K,
    ...p: P extends undefined ? [] : [P]
  ): Promise<Parameters<Parameters<PbxPal[K]>[1]>[0]>
}

export type PbxEvent = {
  serverStatus: {
    status: 'active' | 'inactive'
  }
  userStatus: {
    status: string
    user: string
    talker_id: string
  }
  park: {
    park: string
    status: 'on' | 'off'
  }
  voicemail: {
    new: number
  }
}

export type PbxPal = {
  getProductInfo(
    p: undefined,
    resolve: (i: {
      'sip.wss.port': string
      'webrtcclient.dtmfSendMode': number | string
      'webphone.turn.server': string
      'webphone.turn.username': string
      'webphone.turn.credential': string
      'webphone.uc.host': string
    }) => void,
    reject: (err: Error) => void,
  )
  createAuthHeader(
    p: { username: string },
    resolve: (authHeader: string) => void,
    reject: (err: Error) => void,
  )

  getExtensions(
    p: {
      tenant: string
      pattern: '..*'
      type: 'user'
      limit: number
    },
    resolve: (extensions: string[]) => void,
    reject: (err: Error) => void,
  )
  getExtensionProperties<T extends string | string[]>(
    p: {
      tenant: string
      extension: T
      property_names: string[]
    },
    resolve: (properties: T[]) => void,
    reject: (err: Error) => void,
  )
  setExtensionProperties(
    p: {
      tenant: string
      extension: string
      properties: {
        p1_ptype?: string
        p2_ptype?: string
        p3_ptype?: string
        p4_ptype?: string
        pnumber: string
      }
    },
    resolve: () => void,
    reject: (err: Error) => void,
  )

  getContactList(
    p: {
      shared: string
      offset: number
      limit: number
    },
    resolve: (res: { aid: string; display_name: string }[]) => void,
    reject: (err: Error) => void,
  )
  getContact(
    p: {
      aid: string
    },
    resolve: (res: PbxContact) => void,
    reject: (err: Error) => void,
  )
  setContact(
    p: PbxContact,
    resolve: (res: PbxContact) => void,
    reject: (err: Error) => void,
  )

  pnmanage(
    p: {
      command: string
      service_id: string
      application_id: string
      user_agent: string
      username: string
      device_id?: string
      endpoint?: string
      auth_secret?: string
      key?: string
    },
    resolve: () => void,
    reject: (err: Error) => void,
  )

  hold(
    p: {
      tenant: string
      tid: string
    },
    resolve: () => void,
    reject: (err: Error) => void,
  )
  unhold: PbxPal['hold']

  startRecording: PbxPal['hold']
  stopRecording: PbxPal['hold']

  transfer(
    p: {
      tenant: string
      user: string
      tid: string
      mode?: string
    },
    resolve: () => void,
    reject: (err: Error) => void,
  )

  conference: PbxPal['hold']
  cancelTransfer: PbxPal['hold']

  park(
    p: {
      tenant: string
      tid: string
      number: string
    },
    resolve: () => void,
    reject: (err: Error) => void,
  )
}

export type PbxContact = {
  aid: string
  phonebook: string
  shared: string
  info: {
    $firstname: string
    $lastname: string
    $tel_work: string
    $tel_home: string
    $tel_mobile: string
    $address: string
    $company: string
    $email: string
    $title: string
    $hidden: string
  }
}

/* SIP */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
export type Sip = {
  new (options: {
    logLevel: string
    multiSession: number
    dtmfSendMode: number
    ctiAutoAnswer: number
    eventTalk: number
    defaultOptions: {
      videoOptions: {
        call: {
          mediaConstraints: MediaStreamConstraints
        }
        answer: {
          mediaConstraints: MediaStreamConstraints
        }
      }
    }
    configuration?: SipConfiguration
  }): Sip

  addEventListener<K extends keyof SipEventMap>(
    type: K,
    listener: (e: SipEventMap[K]) => void,
  )
  removeEventListener<K extends keyof SipEventMap>(
    type: K,
    listener: (e: SipEventMap[K]) => void,
  )

  startWebRTC(configuration: SipConfiguration)
  stopWebRTC()

  setDefaultCallOptions(options: CallOptions)
  getSession(sessionId: string): Session
  makeCall(number: string, options: null, videoEnabled?: boolean)
  answer(sessionId: string, options: null, videoEnabled?: boolean)
  setWithVideo(sessionId: string, withVideo?: boolean)
  setMuted(options: { main: boolean }, sessionId: string)

  sendDTMF(dtmf: string, sessionId: string)
}

export type SipConfiguration = {
  url?: string
  host?: string
  port?: string
  tls?: boolean

  user: string
  auth?: string
  password?: string

  useVideoClient?: boolean
  videoClientUser?: string

  user_agent?: string
  userAgent?: string
  register?: boolean
  socketKeepAlive?: number
}

export type CallOptions = {
  pcConfig?: {
    iceServers?: RTCIceServer[]
    bundlePolicy?: RTCBundlePolicy
  }
}

export type SipEventMap = {
  phoneStatusChanged: PhoneStatusChangedEvent
  sessionCreated: Session
  sessionStatusChanged: Session
  videoClientSessionCreated: VideoSession
  videoClientSessionEnded: VideoSession
  rtcErrorOccurred: Error
}
export type PhoneStatusChangedEvent = {
  phoneStatus: 'starting' | 'started' | 'stopping' | 'stopped'
  from: string
  reason: string
  response: unknown
}
export type Session = {
  sessionId: string
  sessionStatus: 'dialing' | 'terminated' | 'connected'
  rtcSession: {
    remote_identity: {
      display_name: string
      uri: {
        user: string
      }
    }
    direction: 'outgoing' | 'incoming'
    terminate()
  }
  withVideo: boolean
  remoteWithVideo: boolean
  remoteStreamObject: MediaStream
  localStreamObject: MediaStream
  incomingMessage?: {
    getHeader(h: string): string
  }
  videoClientSessionTable: {
    [id: string]: Session
  }
  // Unused properties
  answering: boolean
  audio: boolean
  video: boolean
  shareStream: boolean
  exInfo: string
  muted: {
    main: boolean
    videoClient: boolean
  }
  remoteUserOptionsTable: null
  analyzer: null
}
export type VideoSession = {
  sessionId: string
  videoClientSessionId: string
}

/* UC */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
export type UcErrors = {
  PLEONASTIC_LOGIN: number
}

export type UcChatClient = {
  new (log: UcLogger): UcChatClient
  setEventListeners(listeners: UcListeners)
  signIn(
    uri: string,
    path: string,
    pbxTenant: string,
    pbxUsername: string,
    pbxPassword: string,
    option?: object,
    resolve: () => void,
    reject: (err: Error) => void,
  )
  signOut()
  getProfile(): {
    user_id: string
    name: string
    profile_image_url: string
  }
  getStatus(): {
    status: number // 0 | 1 | 2 | 3
    display: string
  }
  changeStatus(
    status: string,
    dislay: string,
    resolve: () => void,
    reject: (err: Error) => void,
  )
  getBuddylist(): {
    user: UcUser[]
  }
  receiveUnreadText(
    resolve: (res: UcReceieveUnreadTextRes) => void,
    reject: (err: Error) => void,
  )
  readText(map: object)
  searchTexts(
    opt: UcSearchTextsOpt,
    resolve: (res: UcSearchTextsRes) => void,
    reject: (err: Error) => void,
  )
  sendText(
    text: string,
    opt: UcSendTextOpt,
    resolve: (res: UcSendTextRes) => void,
    reject: (err: Error) => void,
  )
  sendConferenceText(
    text: string,
    conf_id: string,
    resolve: (res: UcSendTextRes) => void,
    reject: (err: Error) => void,
  )
  createConference(
    subject: string,
    members: string[],
    resolve: (res: UcCreateConferenceRes) => void,
    reject: (err: Error) => void,
  )
  joinConference(
    conf_id: string,
    opt?: unknown,
    resolve: () => void,
    reject: (err: Error) => void,
  )
  leaveConference(
    conf_id: string,
    resolve: () => void,
    reject: (err: Error) => void,
  )
  inviteToConference(
    conf_id: string,
    members: string[],
    resolve: () => void,
    reject: (err: Error) => void,
  )
  acceptFileWithXhr(
    file: unknown,
    xhr: XMLHttpRequest,
    reject: (err: Error) => void,
  )
  cancelFile(file_id: string, reject: (err?: Error) => void)
  sendFile(
    opt: UcSendFileOpt,
    input: unknown,
    resolve: (res: UcSendFileRes) => void,
    reject: (err?: Error) => void,
  )
  sendFiles(
    opt: UcSendFilesOpt,
    file: unknown[],
    resolve: (res: UcSendFilesRes) => void,
    reject: (err?: Error) => void,
  )
}

export type UcUser = {
  user_id: string
  name: string
  profile_image_url: string
  status: number
  display: string
}
export type UcReceieveUnreadTextRes = {
  messages: UcMessage[]
}
export type UcMessage = {
  requires_read: boolean
  received_text_id: string
  text: string
  sender?: {
    user_id: string
  }
  sent_ltime: string
}
export type UcSearchTextsOpt = {
  user_id?: string
  conf_id?: string
  max?: number
  begin?: number
  end?: number
  asc?: boolean
}
export type UcSearchTextsRes = {
  logs: UcMessageLog[]
}
export type UcMessageLog = {
  log_id: string
  ctype: number // content type
  content: string
  sender: {
    user_id: string
  }
  ltime: number
}
export type UcSendTextOpt = {
  user_id: string
}
export type UcSendTextRes = {
  text_id: string
  ltime: number
}
export type UcCreateConferenceRes = {
  conference: UcConference
}
export type UcConference = {
  conf_id: string
  subject: string
}
export type UcSendFileOpt = {
  user_id: string
}
export type UcSendFileRes = {
  text_id: string
  ltime: number
  fileInfo: UcFileInfo
}
export type UcFileInfo = {
  file_id: string
  name: string
  size: number
  status: number
  progress: number
}
export type UcSendFilesOpt = {
  conf_id: string
  input: unknown
}
export type UcSendFilesRes = {
  infoList: UcSendFileRes[]
}

export type UcLogger = {
  new (lv: string): UcLogger
}

export type UcListeners = {
  forcedSignOut?: (e: UcEventMap['forcedSignOut']) => void
  buddyStatusChanged?: (e: UcEventMap['buddyStatusChanged']) => void
  receivedTyping?: (e: UcEventMap['receivedTyping']) => void
  receivedText?: (e: UcEventMap['receivedText']) => void
  fileReceived?: (e: UcEventMap['fileReceived']) => void
  fileInfoChanged?: (e: UcEventMap['fileInfoChanged']) => void
  fileTerminated?: (e: UcEventMap['fileTerminated']) => void
  invitedToConference?: (e: UcEventMap['invitedToConference']) => void
  conferenceMemberChanged?: (e: UcEventMap['conferenceMemberChanged']) => void
}
export type UcEventMap = {
  forcedSignOut: {
    code: string
  }
  buddyStatusChanged: {
    user_id: string
    name: string
    profile_image_url: string
    status: number // 0 | 1 | 2 | 3
    display: string
  }
  receivedTyping: {
    tenant: string
    user_id: string
    request_ltime: string
    request_tstamp: number
  }
  receivedText: {
    sender: {
      user_id: string
    }
    conf_id: string
    received_text_id: string
    text: string
    sent_ltime: string
    sent_tstime: number
  }
  fileReceived: {
    fileInfo: {
      file_id: string
      name: string
      size: number
      status: number // 0 | 1 | 2 | 3 | 4 | 5 | 6
      progress: number
      target: {
        user_id: string
      }
    }
    conf_id: string
    text_id: string
    sent_ltime: string
    sent_tstime: number
  }
  fileInfoChanged: UcEventMap['fileReceived']
  fileTerminated: UcEventMap['fileReceived']
  invitedToConference: {
    conference: {
      conf_id: string
      subject: string
      from: {
        user_id: string
      }
      user?: {
        user_id: string
        conf_status: 0 | 2
      }[]
      conf_status: 0 | 2
    }
  }
  conferenceMemberChanged: UcEventMap['invitedToConference']
}
