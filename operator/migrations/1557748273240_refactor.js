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
    account_id: { type: 'text', notNull: true, references: 'accounts' },
    service_id: { type: 'text', notNull: true, references: 'services' },
    created: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') }
  })
  pgm.createIndex('connections', ['account_id', 'service_id'], {
    unique: true
  })

  pgm.createTable('permissions', {
    permission_id: { type: 'uuid', notNull: true, primaryKey: true },
    connection_id: { type: 'uuid', notNull: true, references: 'connections' },
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
  pgm.createIndex('permissions', [
    'connection_id',
    'domain',
    'area',
    'type',
    'accepted',
    'rejected',
    'expires',
    'revoked'
  ], { unique: true })

  pgm.createTable('account_keys', {
    account_key_id: { type: 'string', notNull: true, primaryKey: true },
    account_id: { type: 'text', notNull: true, references: 'accounts' },
    domain: { type: 'text', notNull: true },
    area: { type: 'text', notNull: true },
    read_key: { type: 'text' },
    created: { type: 'timestamp', default: pgm.func('current_timestamp') }
  })
  pgm.createIndex('account_keys', [
    'account_id',
    'domain',
    'area'
  ], { unique: true })
}

exports.down = (pgm) => {
  pgm.dropIndex('permissions', [
    'connection_id',
    'domain',
    'area',
    'type',
    'accepted',
    'rejected',
    'expires',
    'revoked'
  ], { ifExists: true })
  pgm.dropTable('permissions', { ifExists: true })

  pgm.dropIndex('account_keys', [
    'account_id',
    'domain',
    'area'
  ], { ifExists: true })
  pgm.dropTable('account_keys', { ifExists: true })

  pgm.dropIndex('connections', ['account_id', 'service_id'], { ifExists: true })
  pgm.dropTable('connections', { ifExists: true })

  pgm.dropTable('accounts', { ifExists: true })
  pgm.dropTable('services', { ifExists: true })
}
