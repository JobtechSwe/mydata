import { Component } from 'react'

export default class Screen extends Component {
  UNSAFE_componentWillMount () {
    this.props.navigation.addListener('willFocus', (payload) => this.componentWillFocus(payload))
    this.props.navigation.addListener('didFocus', (payload) => this.componentDidFocus(payload))
    this.props.navigation.addListener('willBlur', (payload) => this.componentWillBlur(payload))
    this.props.navigation.addListener('didBlur', (payload) => this.componentDidBlur(payload))
  }

  async componentWillFocus(navigationProps) { }
  async componentDidFocus(navigationProps) { }
  async componentWillBlur(navigationProps) { }
  async componentDidBlur(navigationProps) { }
}
