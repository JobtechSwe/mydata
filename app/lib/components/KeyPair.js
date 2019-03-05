import React, { Component } from 'react'
import { RSA } from 'react-native-rsa-native'
import { Paragraph } from './typography/Typography'
import { Spinner } from './elements/Spinner/Spinner'

export default class KeyPair extends Component {
  state = {
    keys: {},
    status: '',
  }

  componentDidMount() {
    if (this.props.keys) {
      this.setState({
        keys: this.props.keys,
        status: 'RSA key pair',
      })
    } else {
      this.generate()
    }
  }

  generate = async () => {
    this.setState({ status: 'Genererar nycklar...' })

    const keyPair = await RSA.generateKeys(4096)
    const keys = {
      publicKey: keyPair.public,
      privateKey: keyPair.private,
    }

    this.setState({ status: 'Nycklar genererade' })

    this.props.onGenerate(keys)
  }

  render() {
    return (
      <>
        <Spinner />
        <Paragraph style={{ marginTop: 24 }}>{this.state.status}</Paragraph>
      </>
    )
  }
}
