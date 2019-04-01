const { create, utils } = require('@mydata/client')

const client = create({
  displayName: 'National registration',
  description: 'This is the national registration of the Kingdom of Sweden',
  clientId: process.env.CLIENT_ID || 'http://localhost:2999', // Application domain with protocol
  operator: process.env.OPERATOR_URL || 'http://localhost:3000', // URL of Operator
  clientKeys: {
    publicKey: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv/MgNZvi0YRhA0FePG6t\ne32qMz37tD1t6mKeVolt6OZt6pblbCIfIW7J99jyKy3Zk2aZF/Eerr86qjKFwGro\nAmGT4VN7bEtHOFnpj4jFf3wvo7weyRHBIh9rc5LJtZ8k1MWYGDqxT/H835ZhxMrI\niUHPVLB6JKhEBk1h8gHSJdH574T8ZNc4jrMgapOgCJqzP7OSpOEus3nRfv9vKMD8\nRGESJukNwj0Vxf4FlkuqPGhsp6ImRPKnvdCPnfInx2IEcgS3UU7sV6B7k14lzepl\n313KzFpbrS1qXbuEhwLsvIthNKqA5C/YOpiJz7NlC+sOQw8QxMLfTq9WmSuQ4HKn\n6QIDAQAB\n-----END PUBLIC KEY-----\n',
    privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQC/8yA1m+LRhGED\nQV48bq17faozPfu0PW3qYp5WiW3o5m3qluVsIh8hbsn32PIrLdmTZpkX8R6uvzqq\nMoXAaugCYZPhU3tsS0c4WemPiMV/fC+jvB7JEcEiH2tzksm1nyTUxZgYOrFP8fzf\nlmHEysiJQc9UsHokqEQGTWHyAdIl0fnvhPxk1ziOsyBqk6AImrM/s5Kk4S6zedF+\n/28owPxEYRIm6Q3CPRXF/gWWS6o8aGynoiZE8qe90I+d8ifHYgRyBLdRTuxXoHuT\nXiXN6mXfXcrMWlutLWpdu4SHAuy8i2E0qoDkL9g6mInPs2UL6w5DDxDEwt9Or1aZ\nK5DgcqfpAgMBAAECggEBAKmQdvWknbwEO0cK6dps0yfyHPZjXQUd9wlE0ScVBFjn\nplXDsyvRALsiCZy+sz9do4TI75js0fQAziwnsWwHhKkF1gMJIlDKN0Iae27mncE+\nzT7RIkjxPDGOm/dexn2A9qJXY0KUJqq+1GoXiIq1sG1AC41+0IetdVoz5cBJx4DL\n8n8RuRHdayMGYovhidxZIzNsD4ClBTHIpXg04PKgzd6zGfD3rqPrmPauPcoqWPKB\nzFL2LdFvN2t60Zw94AnfXN7khTxd2c1017B2aFr0HGog8kn+sWPqc/45Uc7sBusz\nZWCgQR5VTZ48mfaNDMky0pG2DBjQTXNp+fsRXU+HJZkCgYEA7Ph+WWXQfOPNWgCh\nSLmC3G9ct0CQLJ/FTYyWD2wwC85tPQCNjeCuphUX8OkYmpq3jlXkmc0d6VqMBDDE\nex8THpfJ1w7SIN5EVHE4REF6Kvjq3auv3LXj1KWvkCEOV03knyLIbY8T1xoKhkyK\nx+uFKE0CQaAbtqDTgqd5m74v4EsCgYEAz10eAFN7YLChY2OkA1sSbcGnMITHjyzp\nGEU/3XqsKHzz0ikMLoLx5eU0Rm4AXSAnOHyfHSmRcGIAhcVION4Lo0sUM6S8mgpi\nwQtSY1VbgxBqVAwHeRdNcO0Knn9z4Z/iFpbnT+jXpHbi7jYkjrOIgUFH9P2Y4ki9\n50EWn9ByABsCgYEAs6jmajLF8Znoe78UiIWVUDjiC1FYvWxYcyYOMx0sBBd6PJCp\nwZJB90rwvsaKz9RTLAe07GJVtjDfDOJIZKw3m68q6PCkoSTCm17HcQBPdjsIHg3n\npCcG15bSVyyoqco1de0yFdYvDZsBtbZcVZwbdWWFO2n++ORP17PPgCOeOqcCgYAC\neJyb6mLFAzXZJl3VAGfW0QD6DgsGxMU+WczqCcU1ck/BiGWxxDO3xqR51mPAuFpf\nTPTkdxNZoIFbFr/GlbbTylhCSUtKFqeYn1brAiBmDnMF72LDaaitmNWQj/pEjRA3\nrrKw/BhdyGDp79E9thwBVlLSM5d30uAYemkXnHdPUwKBgQC1qURMS8K6tZdpxOcP\nn3SXm+kzQ6l8uTzUCa7OtokwzteG0wgbq211eUwHz/w5ZWm5WELEN/pYoIbiIQ0Y\nCmx4cdQdj30a+bIj3gKb9ZNxZobY5Fwu/YlsntG47kJLzIVBe/Pb+OQnE93ayD1c\nDNGvM0BRQBe5Q4QKhecExBAIGw==\n-----END PRIVATE KEY-----\n'
  },
  jwksPath: '/jwks',
  eventsPath: '/events',
  keyValueStore: utils.createMemoryStore()
})

client.events.on('CONSENT_APPROVED', async event => {
  await client.keyProvider.keyValueStore.save(`id/${event.id}`, { accessToken: event.accessToken })
})

module.exports = client
