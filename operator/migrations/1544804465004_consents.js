exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.createTable('consents', {
    id: { type: 'uuid', primaryKey: true },
    account_id: { type: 'uuid', notNull: true },
    client_id: { type: 'string', notNull: true },
    scope: { type: 'string', notNull: true }
  })
}

exports.down = (pgm) => {
  pgm.dropTable('consents')
}
