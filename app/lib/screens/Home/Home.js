import React from 'react'
import { Alert, Linking } from 'react-native'
import { getAccount, storeAccount } from '../../services/storage'
import { H3 } from '../../components/typography/Typography'
import ConsentModal from '../../components/ConsentModal'
import { Wrap } from '../../components/View/Wrapper'

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
    modalVisible: true,
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
        <H3 style={{ position: 'absolute', top: 48 }}>Hello World</H3>
        <ConsentModal
          visible={this.state.modalVisible}
          scope={scopes}
          client={{ display_name: 'myskills.se', description: 'Foo' }}
          onReject={() => this.setState({ modalVisible: false })}
        />
      </Wrap>
    )
  }
}
