import React, { Component } from 'react'
import { Image } from 'react-native'
import { H1, Paragraph } from '../typography/Typography'
import { PrimaryButton } from '../elements/Button/Button'

import dropbox from '../../services/dropbox'

export default class PDS extends Component {
  connect = async () => {
    dropbox.once('connect', pds => {
      this.props.onConnect(pds)
    })

    await dropbox.connect()
  }

  render() {
    return (
      <>
        <H1>Lagring</H1>
        <Image
          source={require('./img/storage.png')}
          style={{ marginBottom: 48, marginTop: 48, width: 264, height: 187 }}
        />
        <Paragraph align="center" style={{ marginBottom: 48 }}>
          Dags att välja var du vill lagra din data!
        </Paragraph>
        <PrimaryButton
          onPress={this.connect}
          icon={{
            name: 'dropbox',
          }}
        >
          Dropbox
        </PrimaryButton>
      </>
    )
  }
}
