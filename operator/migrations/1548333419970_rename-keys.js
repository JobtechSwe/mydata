exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.renameColumn('accounts', 'public_key', 'account_key')
  pgm.renameColumn('clients', 'public_key', 'client_key')
}

exports.down = (pgm) => {
  pgm.renameColumn('accounts', 'account_key', 'public_key')
  pgm.renameColumn('clients', 'client_key', 'public_key')
}
