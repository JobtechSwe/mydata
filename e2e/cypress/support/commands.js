// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

const appServerUrl = Cypress.env('APP_SERVER_URL') || 'http://localhost:1337'

function callMethod (method, ...args) {
  const serializable = args.map(a => (a instanceof Map || a instanceof Set) ? [...a] : a)
  return cy
    .request({
      url: `${appServerUrl}/${method}`,
      method: 'POST',
      body: {
        args: serializable
      }
    })
    .then(res => res.body)
}

Cypress.Commands.add('setConfig', (args) => {
  return callMethod('setConfig', args)
})

Cypress.Commands.add('getConfig', () => {
  return callMethod('getConfig')
})

Cypress.Commands.add('clearConfig', () => {
  return callMethod('clearConfig')
})

Cypress.Commands.add('createAccount', (args) => {
  return callMethod('createAccount', args)
})

Cypress.Commands.add('clearAccount', (args) => {
  return callMethod('clearAccount', args)
})

Cypress.Commands.add('clearStorage', (args) => {
  return callMethod('clearStorage', args)
})

Cypress.Commands.add('getConnections', (args) => {
  return callMethod('getConnections', args)
})

Cypress.Commands.add('handleAuthCode', (args) => {
  return callMethod('handleAuthCode', args)
})

Cypress.Commands.add('approveConnection', (args) => {
  return callMethod('approveConnection', args)
})

Cypress.Commands.add('approveLogin', (args) => {
  return callMethod('approveLogin', args)
})
