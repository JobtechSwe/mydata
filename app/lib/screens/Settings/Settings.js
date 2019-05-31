import React from 'react'
import SvgUri from 'react-native-svg-uri'
import { Alert, View } from 'react-native'
import { Spinner } from '../../components/elements/Spinner/Spinner'
import { H2, H3, Paragraph } from '../../components/typography/Typography'
import { PrimaryButton } from '../../components/elements/Button/Button'
import { Wrap, ScrollViewWrap } from '../../components/View/Wrapper'
import { storeAccount } from '../../services/storage'
import { getAccount } from '../../services/account'
import AsyncStorage from '@react-native-community/async-storage'

function Settings({ navigation }) {
  const [account, setAccount] = React.useState()

  const getAccountFromStorage = async () => {
    const account = await getAccount()

    setAccount(account)
  }
  React.useEffect(() => {
    getAccountFromStorage()
  }, [])

  const doClearAccount = async () => {
    await storeAccount()
    AsyncStorage.removeItem('connections')
    setAccount(undefined)
    const { navigate } = navigation
    navigate('AuthLoading')
  }

  const clearAccount = async () => {
    Alert.alert(
      'Clear account',
      'Are you sure you want to clear your account? This is a REALLY bad idea!',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        { text: 'OK', onPress: () => doClearAccount() },
      ]
    )
  }

  if (!account) {
    return (
      <Wrap>
        <ScrollViewWrap>
          <Spinner />
        </ScrollViewWrap>
      </Wrap>
    )
  }

  return (
    <Wrap
      style={{
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
      }}
    >
      <ScrollViewWrap
        contentContainerStyle={{
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          flex: 1,
        }}
      >
        <View style={{ width: '100%' }}>
          <H2 style={{ alignSelf: 'flex-start', marginTop: 64 }}>
            Inställningar
          </H2>
          <Paragraph align="left">{`${account.firstName} ${
            account.lastName
          }`}</Paragraph>
          <H3 style={{ marginTop: 32 }}>PDS</H3>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <SvgUri
              width="22"
              height="18"
              style={{ marginRight: 12 }}
              svgXmlData={`
<svg width="375" height="512" viewBox="0 0 375 512" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M327.019 74.98C278.667 26.629 214.38 0 146 0C77.619 0 13.331 26.629 -35.02 74.98C-83.372 123.332 -110 187.62 -110 256C-110 324.38 -83.372 388.667 -35.02 437.019C13.332 485.371 77.619 512 146 512C214.38 512 278.667 485.371 327.019 437.019C375.371 388.667 402 324.38 402 256C402 187.62 375.371 123.333 327.019 74.98V74.98ZM146 482C21.383 482 -80 380.617 -80 256C-80 131.383 21.383 30 146 30C270.617 30 372 131.383 372 256C372 380.617 270.617 482 146 482Z" fill="#0AC238"/>
<path d="M268.305 173.859C262.448 168.003 252.95 168.003 247.093 173.86L114.634 306.319L44.907 236.592C39.05 230.735 29.552 230.735 23.694 236.592C17.836 242.449 17.836 251.947 23.694 257.805L104.027 338.138C105.418 339.533 107.072 340.639 108.892 341.393C110.712 342.147 112.663 342.533 114.633 342.531C118.471 342.531 122.311 341.066 125.239 338.138L268.305 195.072C274.163 189.215 274.163 179.717 268.305 173.859V173.859Z" fill="#0AC238"/>
</svg>`}
            />
            <Paragraph align="left" style={{ textTransform: 'capitalize' }}>
              {account.pds.provider}
            </Paragraph>
          </View>
          <View style={{ width: '100%', justifyContent: 'center' }}>
            <PrimaryButton
              style={{ marginTop: 32 }}
              icon={{ name: 'ban' }}
              onPress={clearAccount}
            >
              Radera konto
            </PrimaryButton>
          </View>
        </View>
      </ScrollViewWrap>
    </Wrap>
  )
}

export default Settings
