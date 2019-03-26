const os = require('os')

function checkOs () {
  return os.platform()
}

module.exports = {
  getDockerInterfaceAddress: () => {
    switch (checkOs()) {
      case 'linux':
        const interfaces = os.networkInterfaces()
        const interfaceName = Object.keys(interfaces).find(i => i.startsWith('br-'))
        return interfaces[interfaceName].find(o => o.family === 'IPv4').address
      default:
        return 'host.docker.internal'
    }
  }
}
