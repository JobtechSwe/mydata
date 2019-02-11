const { query } = require('../adapters/postgres')
const { camelCase } = require('changecase-objects')
const MemoryKeyStore = require('@mydata/client/lib/memoryKeyStore')
const memoryKeyStore = new MemoryKeyStore()

async function loadFromPostgres ({ use, kid }) {
  const col = kid ? 'kid' : 'use'
  const val = kid || use
  const { rows } = await query(`SELECT * FROM keys WHERE ${col} = $1`, [val])
  return rows.map(r => camelCase(r))
}
async function getKey (kid) {
  const [pg, mem] = await Promise.all([
    loadFromPostgres({ kid }),
    memoryKeyStore.getKey(kid)
  ])
  console.log(pg, mem)
  return pg.length ? pg[0] : mem
}
async function getKeys (use) {
  const [pg, mem] = await Promise.all([
    loadFromPostgres({ use }),
    memoryKeyStore.getKeys(use)
  ])
  return pg.concat(mem)
}
async function saveKey ({ kid, use, publicKey, privateKey }, ttl) {
  if (!ttl) {
    const sql = `
      INSERT INTO keys (kid, use, public_key, private_key)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (kid) DO NOTHING
    `
    await query(sql, [ kid, use, publicKey, privateKey ])
  } else {
    memoryKeyStore.saveKey({ kid, use, publicKey, privateKey }, ttl)
  }
  return { kid, use, publicKey, privateKey }
}
async function removeKey (kid) {
  await Promise.all([
    query(`DELETE FROM keys WHERE kid = $1`, [ kid ]),
    memoryKeyStore.removeKey(kid)
  ])
}
async function updateTTL (kid, ttl) {
  if (!ttl) {
    const key = await memoryKeyStore.getKey(kid)
    await Promise.all([
      saveKey(key),
      memoryKeyStore.removeKey(kid)
    ])
  } else {
    await memoryKeyStore.updateTTL(kid, ttl)
  }
}

module.exports = { getKey, getKeys, saveKey, removeKey, updateTTL }
