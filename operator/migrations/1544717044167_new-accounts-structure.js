exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.dropColumns('accounts', ['username', 'password'])
  pgm.addColumns('accounts', { public_key: { type: 'string' } })
}

exports.down = (pgm) => {
  pgm.addColumns('accounts', {
    username: { type: 'string', notNull: true, unique: true },
    password: { type: 'bytea', notNull: true }
  })
  pgm.dropColumns('accounts', 'public_key')
}
