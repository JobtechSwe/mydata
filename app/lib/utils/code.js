const authenticationUrlRegex = /^mydata:\/\/account\/(.*)$/

export const parse = (url) => {
  try {
    const [, code] = url.match(authenticationUrlRegex)

    if (!code) {
      throw new Error('Unidentified code')
    }
    return code
  } catch (error) {
    console.error('could not match url!', error)
  }
}
