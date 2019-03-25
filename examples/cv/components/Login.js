import React, { useEffect, useState, useContext } from 'react'
import { Box, Typography } from '@smooth-ui/core-sc'
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
    axios
      .get('/api/loginRequest')
      .then(({ data }) => {
        console.log(data)
        setData(data)
        pollId = poll(data.sessionId)
      })
      .catch(err => {
        console.error(err)
      })
  }, [])

  return (
    <Box
      ml={100 + 'px'}
      mr="auto"
      maxWidth={550}
      style={{ backgroundColor: 'white', boxShadow: '3px 3px 7px 7px rgba(0,0,0,0.1)', padding: 50 + 'px', marginTop: 50 + 'px', borderRadius: 2 + 'px' }}>
      {data && <Box>
        <Typography variant="h2">Scan this code to sign in</Typography>
        <QRCode
          value={data.url}
          onClick={() => copy(data.url)}
        />
      </Box>}
    </Box>
  )
}
