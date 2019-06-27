exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.renameColumn('permissions', 'accepted', 'approved_at')
}

exports.down = (pgm) => {
  pgm.renameColumn('permissions', 'approved_at', 'accepted')
}
