import React from 'react'
import { View, Alert, Linking } from 'react-native'
import { getAccount, storeAccount } from '../../services/storage'
import { H3, Paragraph } from '../../components/typography/Typography'
import { PrimaryButton } from '../../components/elements/Button/Button'
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
          <Paragraph>This app:</Paragraph>
          <H3>myskills.se</H3>
          <Paragraph align="left">
            MySkills.se är en tjänst för att du enkelt skall kunna fylla i
            kompetenser på ett och samma ställe.
          </Paragraph>
          <Paragraph>Wants these permissions</Paragraph>
          <View>
            {scopes.map(scope => (
              <View key={scope.area} style={{ marginBottom: 32 }}>
                <H3>{scope.area}</H3>
                <Paragraph small>{scope.description}</Paragraph>
              </View>
            ))}
          </View>
          <PrimaryButton onPress={this.approve}>I Approve!</PrimaryButton>
          <PrimaryButton onPress={this.reject}>Nope!</PrimaryButton>
        </ScrollViewWrap>
      </Wrap>
    )
  }
}
