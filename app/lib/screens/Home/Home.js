import React from 'react'
import { Linking } from 'react-native'
import { H1 } from '../../components/typography/Typography'
import { Wrap, ScrollViewWrap } from '../../components/View/Wrapper'

export default class HomeScreen extends React.Component {
  componentDidMount() {
    Linking.addEventListener('url', this.handleOpenURL)
  }

  componentWillUnmount() {
    Linking.removeEventListener('url', this.handleOpenURL)
  }

  handleOpenURL = event => {
    const { navigate } = this.props.navigation

    navigate('QR-kod', { myDataUrl: event.url })
  }

  render() {
    return (
      <Wrap style={{ justifyContent: 'flex-start', paddingHorizontal: 26 }}>
        <ScrollViewWrap
          contentContainerStyle={{ justifyContent: 'flex-start' }}
        >
          <H1 style={{ marginTop: 64 }}>MyData</H1>
        </ScrollViewWrap>
      </Wrap>
    )
  }
}
