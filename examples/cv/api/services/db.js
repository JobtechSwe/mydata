const consentRequests = new Map()
const loginApprovals = new Map()

module.exports = {
  saveConsentRequest: consent => consentRequests.set(consent.consentRequestId, consent),
  getConsentRequest: id => consentRequests.get(id),
  saveLoginApproval: approval => loginApprovals.set(approval.sessionId, approval),
  getLoginApproval: id => loginApprovals.get(id)
}
