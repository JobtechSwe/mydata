const fs = require('fs')
const version = require('./.version.json')

const action = process.argv[2]

if (!action) {
  console.log('Usage: node version.js <major|minor|patch>')
  process.exit(1)
}

switch (action) {
  case 'major':
    version.major++
    version.minor = 0
    version.patch = 0
    break
  case 'minor':
    version.minor++
    version.patch = 0
    break
  case 'patch':
    version.patch++
}

const versionString = `${version.major}.${version.minor}.${version.patch}`

fs.writeFileSync('.version.json', JSON.stringify(version, null, 2))

const locations = [
  './',
  './app',
  './client',
  './examples/cv',
  './operator'
]

locations.forEach(location => {
  let path = `${location}/package.json`
  let package = require(path)
  package.version = versionString
  fs.writeFileSync(path, JSON.stringify(package, null, 2))

  console.log(`Set ${path} to v${package.version}`)
})

console.log()
console.log('All done!')
console.log('git add **/package.json')
console.log('git add .version.json')
console.log(`git commit -m "chore: preparing tag v${versionString}"`)
console.log(`git tag v${versionString}`)
console.log('git push master --follow-tags')

console.log()