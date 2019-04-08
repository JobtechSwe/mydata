import React from 'react'
import { Alert, View } from 'react-native'
import { Spinner } from '../../components/elements/Spinner/Spinner'
import { H2, H3, Paragraph } from '../../components/typography/Typography'
import { PrimaryButton } from '../../components/elements/Button/Button'
import { Wrap, ScrollViewWrap } from '../../components/View/Wrapper'
import { getAccount, storeAccount } from '../../services/storage'

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

  return (
    <Wrap
      style={{
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        paddingTop: 64,
      }}
    >
      <ScrollViewWrap
        contentContainerStyle={{
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          flex: 1,
        }}
      >
        {!account ? (
          <Spinner />
        ) : (
          <View style={{ flex: 1 }}>
            <H2 style={{ alignSelf: 'flex-start' }}>Inställningar</H2>
            <Paragraph align="left">Förnamn: {account.firstName}</Paragraph>
            <Paragraph align="left">Efternamn: {account.lastName}</Paragraph>
            <H3 style={{ marginTop: 32 }}>PDS</H3>
            <Paragraph align="left">
              Leverantör: {account.pds.provider}
            </Paragraph>
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
        )}
      </ScrollViewWrap>
    </Wrap>
  )
}

export default Settings
