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

function callMethod (method, args) {
  return cy
    .request({
      url: `http://localhost:1337/${method}`,
      method: 'POST',
      body: {
        args
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

Cypress.Commands.add('handleCode', (args) => {
  return callMethod('handleCode', args)
})
