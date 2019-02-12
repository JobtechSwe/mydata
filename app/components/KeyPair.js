import React, { Component } from 'react'
import { View } from 'react-native'
import { Text } from 'react-native-paper'
import Icon from 'react-native-vector-icons/AntDesign'
import { RSA } from 'react-native-rsa-native'

export default class KeyPair extends Component {

  state = {
    keys: {},
    icon: 'loading1',
    status: ''
  }

  componentDidMount() {
    if (this.props.keys) {
      this.setState({
        keys: this.props.keys,
        icon: 'key',
        status: 'RSA key pair'
      })
    } else {
      this.generate()
    }
  }

  generate = async () => {
    this.setState({ icon: 'loading1', status: 'Generating keys' })

    const keyPair = await RSA.generateKeys(4096)
    const keys = {
      publicKey: keyPair.public,
      privateKey: keyPair.private
    }

    this.setState({ keys, icon: 'key', status: 'RSA key pair' })

    this.props.onGenerate(keys)
  }

  render() {
    return (
      <View>
        <Icon
          name={this.state.icon}
          size={20}
          />
        <Text>{this.state.status}</Text>
      </View>
    )
  }
}
