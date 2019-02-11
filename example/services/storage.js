
export const setAccessToken = accessToken => {
  sessionStorage.setItem('cv/accessToken', accessToken)
}

export const getAccessToken = () => {
  return sessionStorage.getItem('cv/accessToken')
}

export const clearAccessToken = () => sessionStorage.removeItem('cv/accessToken')
