const consents = new Map()
const consentRequests = new Map()

module.exports = {
  saveConsent: consent => consents.set(consent.consentId, consent),
  getConsent: id => consents.get(id),
  saveConsentRequest: consent => consentRequests.set(consent.consentRequestId, consent),
  getConsentRequest: id => consentRequests.get(id)
}
