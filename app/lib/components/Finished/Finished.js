import React, { Component } from 'react'
import { Image } from 'react-native'
import { H1, Paragraph } from '../typography/Typography'
import { PrimaryButton } from '../elements/Button/Button'

export default class Finished extends Component {
  render() {
    return (
      <>
        <H1 style={{ position: 'absolute', top: 128 }}>Klart!</H1>
        <Image
          source={require('./img/finished.png')}
          style={{ marginBottom: 48, marginTop: 48, width: 264, height: 187 }}
        />
        <Paragraph align="center" style={{ marginBottom: 32 }}>
          Du kommer nu att kunna vara i full kontroll över din data och över
          vilka som använder den!
        </Paragraph>
        <PrimaryButton
          onPress={this.props.onFinished}
          style={{ position: 'absolute', bottom: 64 }}
        >
          Börja använd
        </PrimaryButton>
      </>
    )
  }
}
