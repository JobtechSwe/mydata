import React, { useEffect, useState, useContext } from 'react'
import { Box, Button, Typography } from '@smooth-ui/core-sc'
import axios from 'axios'
import QRCode from 'qrcode.react'
import copy from 'copy-to-clipboard'
import { StoreContext } from '../services/StoreContext'
import * as storage from '../services/storage'

let pollId

export default () => {
  const [, dispatch] = useContext(StoreContext)

  const poll = id => setInterval(async () => {
    try {
      const { data } = await axios.get(`/api/approved/${id}`)
      clearInterval(pollId)
      storage.setAccessToken(data.accessToken)
      dispatch({ type: 'SET_TOKEN', payload: data.accessToken })
      window.location.assign('/profile')
    } catch (error) {
      console.log(error)
    }
  }, 2000)

  const [data, setData] = useState(null)
  useEffect(() => {
    axios.post('/api/auth')
      .then(({ data }) => {
        console.log(data)
        setData(data)
        pollId = poll(data.id)
      })
      .catch(err => {
        console.error(err)
      })
  }, [])

  return (
    <Box
      position="absolute"
      top={0}
      ml="auto"
      mr="auto"
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      width="100vw"
    >
      {data && <Box textAlign="center">
        <Typography variant="h6">Enter the code for this consent request:</Typography>
        <Box><QRCode
          size={256}
          value={data.url}
          id="qr-code"
          data-consent-request-id={data.id}
          data-consent-request-url={data.url}
          onClick={() => copy(data.url)} /></Box>
        <Button variant="dark" onClick={() => window.location.assign(data.url)} style={{ marginTop: 10 + 'px' }}>Open on this device</Button>
      </Box>}
    </Box>
  )
}
