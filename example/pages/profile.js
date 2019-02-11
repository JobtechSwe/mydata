import React, { useContext } from 'react'
import { Box, theme } from '@smooth-ui/core-sc'
import Header from '../components/Header'
import Experience from '../components/sections/Experience'
import Education from '../components/sections/Education'
import Languages from '../components/sections/Languages'
import { StoreContext } from '../services/StoreContext'
import { DotLoader } from 'react-spinners'

const LoadingScreen = () => <Box
  ml="auto"
  mr="auto"
  maxWidth={960}
  height="100vh"
  display="flex"
  justifyContent="center"
  alignItems="center"
>
  <DotLoader
    sizeUnit={'px'}
    size={60}
    color={theme.brick}
    loading
  />
</Box>

const Profile = () => <Box
  ml="auto"
  mr="auto"
  maxWidth={960}
>
  <Header />
  <Box>
    <Experience />
    <Education />
    <Languages />
  </Box>
</Box>

export default () => {
  const [{ loaded }] = useContext(StoreContext)
  return loaded
    ? <Profile />
    : <LoadingScreen />
}
