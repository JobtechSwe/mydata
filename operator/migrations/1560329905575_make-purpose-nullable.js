exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.alterColumn('permissions', 'purpose', { notNull: false })
}

exports.down = (pgm) => {
  pgm.alterColumn('permissions', 'purpose', { notNull: true })
}
