exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.alterColumn('keys', 'private_key', { notNull: false })
}

exports.down = (pgm) => {
  pgm.alterColumn('keys', 'private_key', { notNull: true })
}
