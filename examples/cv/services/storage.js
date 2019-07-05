
export const setAccessToken = (accessToken) => {
  sessionStorage.setItem('accessToken', accessToken)
}

export const getAccessToken = () => {
  return sessionStorage.getItem('accessToken')
}

export const clearAccessToken = () => sessionStorage.removeItem('accessToken')
