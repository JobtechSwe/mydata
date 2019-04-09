import React from 'react'
import { H1 } from '../../components/typography/Typography'
import { Wrap, ScrollViewWrap } from '../../components/View/Wrapper'

export default class HomeScreen extends React.Component {
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
