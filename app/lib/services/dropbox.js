import { Linking } from 'react-native'
import Config from 'react-native-config'
import EventEmitter from 'eventemitter3'

function processQueryString(qs) {
  return unescape(qs)
    .split('&')
    .map(kv => kv.split('='))
    .reduce((obj, [key, val]) => Object.assign(obj, { [key]: val }), {})
}

class DropboxConnector extends EventEmitter {

  constructor() {
    super()
    this.connect = this.connect.bind(this)
    this.handleUrl = this.handleUrl.bind(this)
  }

  async connect() {
    Linking.addEventListener('url', this.handleUrl)

    const url = `https://api.dropbox.com//oauth2/authorize?response_type=token&client_id=${Config.DROPBOX_KEY}&redirect_uri=mydata://callback/dropbox`
    await Linking.openURL(url)
    
    return this
  }

  async handleUrl(event) {
    Linking.removeEventListener('url', this.handleUrl)

    const [, queryString] = event.url.match(/#(.*)/)
    const dropbox = processQueryString(queryString)

    this.emit('connect', dropbox)
  }
}

export default new DropboxConnector()
