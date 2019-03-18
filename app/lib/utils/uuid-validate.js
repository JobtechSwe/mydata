const rxUUID = /mydata:\/\/register\/\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/

export const validate = code => rxUUID.test(code.toLowerCase())
