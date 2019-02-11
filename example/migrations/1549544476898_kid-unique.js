exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.alterColumn('keys', 'kid', { unique: true })
}

exports.down = (pgm) => {
  pgm.alterColumn('keys', 'kid', { unique: false })
}
