import React, { Component } from 'react'
import { Input } from '../elements/Input/Input'
import { PrimaryButton } from '../elements/Button/Button'
import { View } from 'react-native'

export default class Account extends Component {
  constructor(props) {
    super(props)
    this.state = props.account || {}
  }

  render() {
    return (
      <View>
        <Input
          label={this.props.firstName}
          placeholder={this.props.firstName}
          onChangeText={text => this.setState({ firstName: text })}
          value={this.state.firstName}
        />
        <Input
          label={this.props.lastName}
          placeholder={this.props.lastName}
          onChangeText={text => this.setState({ lastName: text })}
          value={this.state.lastName}
        />
        <PrimaryButton
          title={this.props.button}
          onPress={() => this.props.onSubmit(this.state)}
        >
          {this.props.button}
        </PrimaryButton>
      </View>
    )
  }
}
