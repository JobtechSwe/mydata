import React, { Component } from 'react'
import { Paragraph } from './typography/Typography'
import { Spinner } from './elements/Spinner/Spinner'
import { generateKeys } from '../services/crypto'

export default class KeyPair extends Component {
  state = {
    keys: {},
    status: '',
  }

  componentDidMount() {
    if (this.props.keys) {
      this.setState({
        keys: this.props.keys,
        status: 'Nycklar genererade',
      })
    } else {
      this.generate()
    }
  }

  generate = async () => {
    this.setState({ status: 'Genererar nycklar...' })

    const keys = await generateKeys(2048)

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
