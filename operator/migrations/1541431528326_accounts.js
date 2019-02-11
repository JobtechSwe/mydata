exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.createTable('accounts', {
    id: { type: 'uuid', primaryKey: true },
    username: { type: 'string', notNull: true, unique: true },
    password: { type: 'bytea', notNull: true },
    pds_provider: 'string',
    pds_credentials: 'bytea'
  })
}

exports.down = (pgm) => {
  pgm.dropTable('accounts')
}
