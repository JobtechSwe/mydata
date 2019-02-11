exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.addColumns('clients', { events_url: { type: 'string' } })
}

exports.down = (pgm) => {
  pgm.dropColumns('clients', 'events_url')
}
