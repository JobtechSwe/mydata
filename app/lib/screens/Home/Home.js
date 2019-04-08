import React from 'react'
import { View } from 'react-native'
import { H1 } from '../../components/typography/Typography'
import { Wrap, ScrollViewWrap } from '../../components/View/Wrapper'
import DomainCard from '../../components/DomainCard'

export default class HomeScreen extends React.Component {
  render() {
    return (
      <Wrap>
        <ScrollViewWrap>
          <H1>MyData</H1>
          <View>
            <DomainCard
              domain="MySkills"
              logo="https://jobskills.se/static/media/jobskills_logo.74c06986.png"
            />
          </View>
        </ScrollViewWrap>
      </Wrap>
    )
  }
}
