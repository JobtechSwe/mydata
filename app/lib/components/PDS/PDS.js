import React, { Component } from 'react'
import { Image, Text } from 'react-native'
import { H1, Paragraph } from '../typography/Typography'
import { PrimaryButton } from '../elements/Button/Button'
import FontAwesome, { Icons, IconTypes } from 'react-native-fontawesome'

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
        <H1 style={{ position: 'absolute', top: 128 }}>Lagring</H1>
        <Image
          source={require('./img/storage.png')}
          style={{ marginBottom: 48, marginTop: 48, width: 264, height: 187 }}
        />
        <Paragraph align="center" style={{ marginBottom: 32 }}>
          Dags att välja var du vill lagra din data!
        </Paragraph>
        <PrimaryButton
          onPress={this.connect}
          style={{ position: 'absolute', bottom: 64 }}
        >
          <Text style={{ fontSize: 20, color: 'white' }}>
            <FontAwesome type={IconTypes.FAB}>{Icons.dropbox}</FontAwesome>
          </Text>
          Dropbox
        </PrimaryButton>
      </>
    )
  }
}
