exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.createTable('keys', {
    kid: { type: 'text', notNull: true, primaryKey: true },
    use: { type: 'text', notNull: true },
    public_key: { type: 'text', notNull: true },
    private_key: { type: 'text', notNull: true }
  })
}

exports.down = (pgm) => {
  pgm.dropTable('keys')
}
