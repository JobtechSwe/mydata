import React from 'react'
import { View } from 'react-native'
import { H1 } from '../../components/typography/Typography'
import { Wrap, ScrollViewWrap } from '../../components/View/Wrapper'
import DomainCard from '../../components/DomainCard'

export default class HomeScreen extends React.Component {
  render() {
    return (
      <Wrap style={{ justifyContent: 'flex-start', paddingHorizontal: 26 }}>
        <ScrollViewWrap
          contentContainerStyle={{ justifyContent: 'flex-start' }}
        >
          <H1 style={{ marginTop: 64 }}>MyData</H1>
          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              flexWrap: 'wrap',
            }}
          >
            <DomainCard
              domain="MySkills"
              logo="https://jobskills.se/static/media/jobskills_logo.74c06986.png"
            />
            <DomainCard
              domain="MySkills"
              logo="https://jobskills.se/static/media/jobskills_logo.74c06986.png"
            />
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
