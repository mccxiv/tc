import Client, {ChatConstants} from 'twitch-js'
import angular from 'angular'
import {CLIENT_ID} from '../../lib/constants'
import settings from '../../lib/settings/settings'
import {EventEmitter} from 'events'

/**
 * Server I/O
 *
 * Provides a way to interact with the Twitch chat servers
 * Communication is done with the IRC protocol but over webSockets, via tmi.js.
 */
angular.module('tc').factory('irc', $rootScope => {
  // ===============================================================
  // Variables
  // ===============================================================
  const ee = new EventEmitter()
  let twitchJsClient
  let client

  window.ee = ee

  // ===============================================================
  // Public members
  // ===============================================================
  ee.ready = false
  ee.badLogin = false
  ee.credentialsValid = credentialsValid
  ee.amMod = amMod
  ee.say = (channel, message) => client.say(channel, message)
  ee.whisper = (username, message) => client.whisper(username, message)
  ee.getClient = () => client

  // ===============================================================
  // Setup
  // ===============================================================
  if (credentialsValid()) create()

  onValidCredentials(create)
  onInvalidCredentials(destroy)
  onChannelsChange(syncChannels)

  // ===============================================================
  // Private methods
  // ===============================================================

  async function create () {
    destroy()
    ee.badLogin = false

    // We can't listen to ALL because of a bug
    const events = {...ChatConstants.EVENTS}
    delete events.RAW
    // delete events.ALL
    delete events.MODE
    delete events.NAMES
    delete events.NAMES_END
    delete events.ERROR_ENCOUNTERED
    delete events.PARSE_ERROR_ENCOUNTERED

    const clientSettings = {
      username: settings.identity.username,
      token: settings.identity.password,

      options: {debug: false, clientId: CLIENT_ID},
      connection: {timeout: 20000, reconnect: true},
      identity: angular.copy(settings.identity),
      channels: []
    }

    twitchJsClient = new Client(clientSettings)
    client = twitchJsClient.chat
    console.log(client)
    try {
      await client.connect()
    } catch (e) {
      console.log(e)
    }
    joinChannels()
    onBadLogin(destroy)
    forwardEvents(client, ee, ['PRIVMSG', 'WHISPER', '*'])
    ee.ready = true
    setTimeout(() => $rootScope.$apply(), 0)

    // Disconnected event gets spammed on every connection
    // attempt. This is not ok if the internet is temporarily
    // down, for example.

    onlyEmitDisconnectedOnce()

    function onlyEmitDisconnectedOnce () {
      client.once(ChatConstants.EVENTS.DISCONNECTED, (...args) => {
        ee.ready = false
        args.unshift(ChatConstants.EVENTS.DISCONNECTED)
        ee.emit.apply(ee, args)
        if (client) {
          client.once(ChatConstants.EVENTS.CONNECTED, onlyEmitDisconnectedOnce)
        }
        setTimeout(() => $rootScope.$apply(), 0)
      })
    }
  }

  function destroy () {
    // Why so much ceremony around .disconnect()? Because tmi.js won't
    // disconnect if the connection is in a certain state at the time.

    if (!client) return
    const clientToDestroy = client
    clientToDestroy.reconnect = false
    client = null
    let disconnectAttempts = 0
    clientToDestroy.disconnect()

    makeSureItsDead()

    async function makeSureItsDead () {
      console.log('Attempting to destroy a client', clientToDestroy)
      try {
        if (!clientToDestroy.ws) return // Looks like it's dead
        await clientToDestroy.disconnect()
        clientToDestroy.removeAllListeners()
      } catch (e) {
        disconnectAttempts++
        if (disconnectAttempts < 10) setTimeout(makeSureItsDead, 3000)
        else {
          console.warn('Unable to properly disconnect a client, giving up')
          console.warn('This might leak memory')
          clientToDestroy.removeAllListeners()
        }
      }
    }
  }

  /**
   * Re emits events from `emitter` on `reEmitter`
   * @param {Object}   emitter   - Emits as rebroadcast. Has .addListener()
   * @param {Object}   reEmitter - The object that will rebroadcast. Has .emit()
   * @param {String[]} events    - The events to listen for on `emitter`
   */
  function forwardEvents (emitter, reEmitter, events) {
    events.forEach(event => {
      console.log('Listening', event)
      emitter.addListener(event, (...args) => {
        args.unshift(event)
        console.log('Event:', ...args)
        reEmitter.emit.apply(reEmitter, args)
      })
    })
  }

  /**
   * Makes sure the clients are connected to the
   * correct channels, the ones in the settings.
   */
  function syncChannels () {
    joinChannels()
    leaveChannels()
  }

  /**
   * Joins any channels in settings.channels
   * that haven't been joined yet.
   */
  function joinChannels () {
    settings.channels.forEach((channel) => {
      const joined = Object.keys(client.channels).map(stripHash)
      if (joined.indexOf(channel) === -1) {
        client.join(channel)
      }
    })
  }

  /**
   * Leaves joined channels that do not
   * appear in settings.channels.
   */
  function leaveChannels () {
    const joined = Object.keys(client.channels).map(stripHash)
    joined.forEach((channel) => {
      if (settings.channels.indexOf(channel) === -1) {
        client.part(channel)
      }
    })
  }

  /**
   * When a client disconnects due to unsuccessful login,
   * sets ee.badLogin and deletes the password from settings.
   * This should cause the login form to display with an error.
   */
  function onBadLogin (cb) {
    client.on(ChatConstants.EVENTS.DISCONNECTED, (...args) => {
      console.log('DISCONNECTED ARGS:', ...args)
      const reasons = [
        'Error logging in.',
        'Login unsuccessful.',
        'Login authentication failed'
      ]
      if (reasons.includes(args[0])) {
        ee.ready = false
        ee.badLogin = args[0] // TODO
        settings.identity.password = ''
        setTimeout(() => $rootScope.$apply(), 0)
        cb()
      }
    })
  }

  function onChannelsChange (cb) {
    $rootScope.$watchCollection(
      () => settings.channels,
      (newV, oldV) => { if (newV !== oldV) cb() }
    )
  }

  function onInvalidCredentials (cb) {
    onCredentialsValidChange((valid) => { if (!valid) cb() })
  }

  function onValidCredentials (cb) {
    onCredentialsValidChange((valid) => { if (valid) cb() })
  }

  function onCredentialsValidChange (cb) {
    // TODO change this so it doesn't run for each call
    $rootScope.$watch(credentialsValid, (newv, oldv) => {
      if (oldv !== newv) cb(newv)
    })
  }

  function stripHash (string) {
    if (string.charAt(0) !== '#') return string
    else return string.substring(1)
  }

  function credentialsValid () {
    const haveUsername = !!settings.identity.username.length
    const havePassword = !!settings.identity.password.length
    return haveUsername && havePassword
  }

  function amMod (channel) {
    const channels = client.channels
    const chan = channels[channel]
    const userState = chan.userState
    return userState.isModerator
  }

  return ee
})
