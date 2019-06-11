exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.renameColumn('permissions', 'permission_id', 'id')
  pgm.renameColumn('permissions', 'legal_basis', 'lawful_basis')
  pgm.addColumns('permissions', {
    description: { type: 'text' }
  })
}

exports.down = (pgm) => {
  pgm.renameColumn('permissions', 'id', 'permission_id')
  pgm.renameColumn('permissions', 'lawful_basis', 'legal_basis')
  pgm.dropColumns('permissions', 'description')
}
