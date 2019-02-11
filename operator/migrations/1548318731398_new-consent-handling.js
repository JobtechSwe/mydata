exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.dropTable('consents')

  pgm.createTable('consent_requests', {
    consent_request_id: { type: 'uuid', primaryKey: true },
    consent_id: { type: 'uuid', notNull: true },
    account_id: { type: 'uuid', notNull: true },
    client_id: { type: 'text', notNull: true },
    response: { type: 'json', notNull: true },
    processed: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  })

  pgm.createTable('scope', {
    scope_id: { type: 'uuid', primaryKey: true },
    consent_id: { type: 'uuid', notNull: true },
    domain: { type: 'text', notNull: true },
    area: { type: 'text', notNull: true },
    description: { type: 'text', notNull: true },
    purpose: { type: 'text', notNull: true },
    lawful_basis: { type: 'text', notNull: true },
    read: { type: 'boolean', notNull: true },
    write: { type: 'boolean', notNull: true }
  })

  pgm.createTable('encryption_keys', {
    scope_id: { type: 'uuid', primaryKey: true },
    encryption_key: { type: 'text', notNull: true }
  })
}

exports.down = (pgm) => {
  pgm.dropTable('consent_requests')
  pgm.dropTable('scope')
  pgm.dropTable('encryption_keys')

  pgm.createTable('consents', {
    id: { type: 'uuid', primaryKey: true },
    account_id: { type: 'uuid', notNull: true },
    client_id: { type: 'string', notNull: true },
    scope: { type: 'string', notNull: true }
  })
}
