exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.createTable('clients', {
    client_id: { type: 'string', primaryKey: true },
    public_key: { type: 'string', notNull: true },
    display_name: { type: 'string', notNull: true },
    description: { type: 'string', notNull: true },
    jwks_url: { type: 'string', notNull: true }
  })
}

exports.down = (pgm) => {
  pgm.dropTable('clients')
}
