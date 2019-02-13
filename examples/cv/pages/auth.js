import React, { useEffect, useState, useContext } from 'react'
import { Box, Typography } from '@smooth-ui/core-sc'
import axios from 'axios'
import QRCode from 'qrcode.react'
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

  const [id, setId] = useState(null)
  useEffect(() => {
    axios.post('/api/auth')
      .then(val => val.data.id)
      .then(id => {
        setId(id)
        pollId = poll(id)
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
      {id && <Box textAlign="center">
        <Typography variant="h6">Enter the code for this consent request:</Typography>
        <Typography variant="h1" data-cy="consent-request-id">{id}</Typography>
        <QRCode value={id} />
      </Box>}
    </Box>
  )
}
