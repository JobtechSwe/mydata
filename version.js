const fs = require('fs')
const { exec } = require('child_process')

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
    exec('git fetch --all -p && git tag', (err, stdout, stderr) => {
      if (err) {
        console.log('Unable to execute "git tag" to see existing tags')
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
  console.log('If you are happy with this, run the following commands:')
  console.log()
  console.log('git add **/package.json')
  console.log('git add .version.json')
  console.log(`git commit -m "chore: preparing tag v${versionString}"`)
  console.log(`git tag v${versionString}`)
  console.log(`git push v${versionString}`)
  
  console.log()
})