import React from 'react'
import { Image } from 'react-native'
import SvgIcon from 'react-native-svg-icon'
import styled from '../../../theme'
import icons from './img/icons'

const StyledNavbarIcon = styled(Image)`
  height: 21px;
  width: 24px;
`

const HomeIcon = ({ active }) => (
  <StyledNavbarIcon
    source={
      active
        ? require('./img/home_active.png')
        : require('./img/home_inactive.png')
    }
  />
)

const ConsentIcon = ({ active }) => (
  <StyledNavbarIcon
    style={{ width: 18, height: 21 }}
    source={
      active ? require('./img/qr_active.png') : require('./img/qr_inactive.png')
    }
  />
)

const AccountIcon = ({ active }) => (
  <StyledNavbarIcon
    style={{ width: 18, height: 21 }}
    source={
      active
        ? require('./img/account_active.png')
        : require('./img/account_inactive.png')
    }
  />
)

const getNavbarIcon = (name, active) => {
  let icon

  switch (name) {
    case 'konto':
      icon = <AccountIcon active={active} />
      break
    case 'qr-kod':
      icon = <ConsentIcon active={active} />
      break
    case 'hem':
      icon = <HomeIcon active={active} />
      break
  }

  return icon
}

export const NavbarIcon = ({ name, active }) => getNavbarIcon(name, active)

export const Icon = props => (
  <SvgIcon
    {...props}
    svgs={icons}
  />
)
