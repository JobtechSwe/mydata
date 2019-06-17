/* eslint-disable */
import React, { useState, useEffect } from 'react'
import { Linking } from 'react-native'
import { H1 } from '../../components/typography/Typography'
import { Wrap, ScrollViewWrap } from '../../components/View/Wrapper'
import ConsentList from '../../components/ConsentList/ConsentList'
import { getAll } from '../../services/consents'
import { getAccount } from '../../services/account'

const HomeScreen = ({ navigation }) => {
  const [consents, setConsents] = useState([])

  const handleOpenURL = event => {
    const { navigate } = navigation
    navigate('QR-kod', { myDataUrl: event.url })
  }

  // const updateConsents = () => getAll().then(setConsents)

  useEffect(() => {
    Linking.addEventListener('url', handleOpenURL)

    getAccount().then(console.log)
    // TODO: Uncomment =)
    // const subscription = navigation.addListener('willFocus', updateConsents)
    // updateConsents()

    return () => {
      Linking.removeEventListener('url', handleOpenURL)
      // subscription.remove()
    }
  }, [navigation])

  return (
    <Wrap style={{ justifyContent: 'flex-start', paddingHorizontal: 26 }}>
      <ScrollViewWrap contentContainerStyle={{ justifyContent: 'flex-start' }}>
        <H1 style={{ marginTop: 64 }}>Egendata</H1>
        <ConsentList consents={consents} />
      </ScrollViewWrap>
    </Wrap>
  )
}

export default HomeScreen
