exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.dropTable('encryption_keys')

  pgm.createTable('encryption_keys', {
    key_id: { type: 'text', primaryKey: true },
    encryption_key: { type: 'text', notNull: true }
  })

  pgm.createTable('scope_keys', {
    scope_id: { type: 'uuid', primaryKey: true },
    encryption_key_id: { type: 'text', notNull: true }
  })
}

exports.down = (pgm) => {
  pgm.dropTable('encryption_keys')
  pgm.dropTable('scope_keys')

  pgm.createTable('encryption_keys', {
    scope_id: { type: 'uuid', primaryKey: true },
    encryption_key: { type: 'text', notNull: true }
  })
}
