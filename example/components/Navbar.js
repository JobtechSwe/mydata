import React, { useContext } from 'react'
import { Typography, styled, Button } from '@smooth-ui/core-sc'
import { StoreContext } from '../services/StoreContext'
import * as storage from './../services/storage'

const Navbar = styled.nav`
  height: 60px;
  box-shadow: 0px 3px 5px 0px rgba(0,0,0,0.15);
  background-color: white;
`

const Headline = styled(Typography)`
  color: #6c757d;
  text-align: center;
  line-height: 1.4em;
`

const LogoutBtn = styled(Button)`
  position: absolute;
  top: 15px;
  right: 15px;
`

export default () => {
  const [{ loaded }, dispatch] = useContext(StoreContext)

  const logout = () => {
    dispatch({ type: 'CLEAR' })
    storage.clearAccessToken()
    window.location.assign('/')
  }

  return (
    <Navbar>
      <Headline variant="h1">C : V</Headline>
      {loaded && <LogoutBtn size="sm" variant="dark" onClick={logout}>Logout</LogoutBtn>}
    </Navbar>)
}
