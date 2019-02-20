import React, { Component } from 'react'
import { View } from 'react-native'
import { Button, Text } from 'react-native-paper'
import Icon from 'react-native-vector-icons/FontAwesome5'

import dropbox from '../services/dropbox'

export default class PDS extends Component {
  connect = async () => {
    dropbox.once('connect', (pds) => {
      this.props.onConnect(pds)
    })
    await dropbox.connect()
  }

  currentComponent = () => {
    if (this.props.pds) {
      return (
        <Text label="Connected to Dropbox">
          <Icon
            name="dropbox"
            size={20}
            color="white"
          />
          Connected to Dropbox
        </Text>
      )
    } else {
      return (
        <Button
          mode="contained"
          title="Dropbox"
          onPress={this.connect}>
          <Icon
            name="dropbox"
            size={20}
            color="white"
          />
          Dropbox
        </Button>
      )
    }
  }

  render() {
    return (
      <View>
        <Text label="PDS">PDS</Text>
        {this.currentComponent()}
      </View>
    )
  }
}