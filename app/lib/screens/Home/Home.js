import React from 'react'
import { View, Alert, Linking, Modal } from 'react-native'
import { getAccount, storeAccount } from '../../services/storage'
import {
  H3,
  Paragraph,
  Separator,
} from '../../components/typography/Typography'
import {
  AcceptConsentButton,
  DenyConsentButton,
  ConsentButtonWrap,
} from '../../components/elements/Button/ConsentButton'
import { Wrap, ScrollViewWrap } from '../../components/View/Wrapper'

const scopes = [
  {
    area: 'Education',
    description: 'För att du skall kunna hålla reda på dina utbildningar.',
  },
  {
    area: 'Skills',
    description:
      'För att du skall kunna spara ner dina tidigare arbetserfarenheter.',
  },
  {
    area: 'Language',
    description: 'För att du skall kunna spara ner dina språkkunskaper.',
  },
]

export default class HomeScreen extends React.Component {
  state = {
    account: {},
  }

  async componentDidMount() {
    await this.readAccountFromStorage()

    if (!this.state.account) {
      const { navigate } = this.props.navigation
      navigate('Account')
    }

    Linking.addEventListener('url', this.handleOpenURL)
  }
  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleOpenURL)
  }

  handleOpenURL = event => {
    this.navigate(event.url)
  }

  navigate = url => {
    const { navigate } = this.props.navigation
    if (/mydata:\/\/callback/.test(url)) {
      navigate('Account')
    }
  }

  editAccount = () => {
    this.props.navigation.navigate('Account')
  }

  manageConsentsRequest = () => {
    this.props.navigation.navigate('ManageConsentsRequest')
  }

  clearAccount = async () => {
    Alert.alert(
      'Clear account',
      'Are you sure you want to clear your account? This is a REALLY bad idea!',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        { text: 'OK', onPress: () => this.doClearAccount() },
      ]
    )
  }

  doClearAccount = async () => {
    await storeAccount()
    this.setState({ account: undefined })
    const { navigate } = this.props.navigation
    navigate('AuthLoading')
  }

  readAccountFromStorage = async () => {
    const account = await getAccount()
    this.setState({
      account,
    })
  }

  render() {
    return (
      <Wrap>
        <ScrollViewWrap>
          <Modal>
            <H3>myskills.se</H3>
            <Paragraph align="left">
              MySkills.se är en tjänst för att du enkelt skall kunna fylla i
              kompetenser på ett och samma ställe.
            </Paragraph>
            <Separator />
            <H3>Begär följande rättigheter:</H3>
            <View>
              {scopes.map(scope => (
                <View key={scope.area} style={{ marginBottom: 24 }}>
                  <H3>{scope.area}</H3>
                  <Paragraph small>{scope.description}</Paragraph>
                </View>
              ))}
            </View>
            <ConsentButtonWrap>
              <AcceptConsentButton onPress={this.approve}>
                Godkänn
              </AcceptConsentButton>
              <DenyConsentButton onPress={this.reject}>Neka</DenyConsentButton>
            </ConsentButtonWrap>
          </Modal>
        </ScrollViewWrap>
      </Wrap>
    )
  }
}
