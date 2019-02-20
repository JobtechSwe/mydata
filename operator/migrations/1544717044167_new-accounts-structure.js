exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.dropColumns('accounts', ['username', 'password'])
  pgm.addColumns('accounts', { public_key: { type: 'string' } })
}

exports.down = (pgm) => {
  pgm.addColumns('accounts', {
    username: { type: 'string', unique: true },
    password: { type: 'bytea' }
  })
  pgm.dropColumns('accounts', 'public_key')
}
