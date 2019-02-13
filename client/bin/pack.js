const pkg = require(`${process.cwd()}/package.json`)
const tar = require('tar')

const name = pkg.name.replace(/@/g, '').replace(/\//g, '-')

tar
  .create({
    file: `${name}-latest.tgz`,
    prefix: 'package/',
    portable: true,
    gzip: true
  }, ['package.json', 'README.md', 'LICENSE', 'lib'])
