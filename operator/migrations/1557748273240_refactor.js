exports.shorthands = undefined

exports.up = (pgm) => {
  pgm.dropTable('accounts', { ifExists: true })
  pgm.dropTable('consent_requests', { ifExists: true })
  pgm.dropTable('encryption_keys', { ifExists: true })
  pgm.dropTable('scope', { ifExists: true })
  pgm.dropTable('scope_keys', { ifExists: true })
  pgm.dropTable('clients', { ifExists: true })

  pgm.createTable('accounts', {
    account_id: { type: 'text', notNull: true, primaryKey: true },
    account_key: { type: 'text', notNull: true },
    pds_provider: { type: 'text', notNull: true },
    pds_credentials: { type: 'text', notNull: true },
    created: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  })
  pgm.createTable('services', {
    service_id: { type: 'text', notNull: true, primaryKey: true },
    service_key: { type: 'text', notNull: true },
    display_name: { type: 'text', notNull: true },
    description: { type: 'text', notNull: true },
    icon_uri: { type: 'text', notNull: true },
    jwks_uri: { type: 'text', notNull: true },
    events_uri: { type: 'text', notNull: true },
    created: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  })
  pgm.createTable('connections', {
    connection_id: { type: 'uuid', notNull: true, primaryKey: true },
    account_id: { type: 'text', notNull: true },
    service_id: { type: 'text', notNull: true },
    created: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  })
  pgm.createTable('permissions', {
    permission_id: { type: 'uuid', notNull: true, primaryKey: true },
    connection_id: { type: 'uuid', notNull: true },
    domain: { type: 'text', notNull: true },
    area: { type: 'text', notNull: true },
    type: { type: 'text', notNull: true },
    purpose: { type: 'text', notNull: true },
    legal_basis: { type: 'text', notNull: true },
    read_key: { type: 'text' },
    accepted: { type: 'timestamp' },
    rejected: { type: 'timestamp' },
    expires: { type: 'timestamp' },
    revoked: { type: 'timestamp' }
  })
}

exports.down = (pgm) => {
  pgm.dropTable('accounts', { ifExists: true })
  pgm.dropTable('services', { ifExists: true })
  pgm.dropTable('connections', { ifExists: true })
  pgm.dropTable('permissions', { ifExists: true })
}
