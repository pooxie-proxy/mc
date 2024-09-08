process.versions.node = '14.0.0'
global.Buffer = global.Buffer || require('buffer').Buffer
const mineflayer = require('mineflayer')
const bot = mineflayer.createBot({
  host: proxyHost,
  port: proxyPort,
  username: game.nick,
  if game.key != null {
    password: game.key
  }
})
export default function (protocol, proxyHost, proxyPort, botConfig) {
  bot()
}
