const fs = require('fs')
const { exec } = require('child_process')

const PACKAGE_JSON_LOCATIONS = [
  '.',
  './app',
  './client',
  './examples/cv',
  './operator'
]

/*
 * Program
 */

const action = process.argv[2]

if (!action) {
  console.log('Usage: node version.js <major|minor|patch>')
  process.exit(1)
}

getTags()
.then(versions => {
  const latestVersion = Math.max.apply(null, Object.keys(versions))
  const version = versions[latestVersion]
  
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
  
  PACKAGE_JSON_LOCATIONS.forEach(location => {
    let path = `${location}/package.json`
    let package = require(path)
    package.version = versionString
    fs.writeFileSync(path, JSON.stringify(package, null, 2))
    
    console.log(`Set ${path} to v${package.version}`)
  })
  
  console.log(`
# To finish, run the following commands:
git add **/package.json
git add .version.json
git commit -m "chore: preparing tag v${versionString}"
git tag v${versionString}
git push origin v${versionString}
  `)
})
.catch(error => {
  console.log(`\nSomethig went wrong`)
  console.log(error)
})

/*
 * Helpers
 */
function getVersionFromTag (tag) {
  const v = {}
  v.major = parseInt(tag.split('v')[1].split('.')[0])
  v.minor = parseInt(tag.split('v')[1].split('.')[1])
  v.patch = parseInt(tag.split('v')[1].split('.')[2])

  return v
}

function getTags () {
  return new Promise((resolve, reject) => {
    exec('git fetch --tags -p && git tag', (err, stdout, stderr) => {
      if (err) {
        console.log('Unable to get git tags, exiting.')
        return reject(err)
      }
    
      if (stderr) {
        return reject(stderr)
      }

      // the *entire* stdout and stderr (buffered)
      const tags = stdout.split('\n')
      const versions = {}
      tags.forEach(tag => {
        if (/^v[0-9]+\.[0-9]+\.[0-9]+/.test(tag)) {
          let v = getVersionFromTag(tag)
          versions[v.major * 10000 + v.minor * 1000 + v.patch] = v
        }
      })
      
      return resolve(versions)
    })
  })
}