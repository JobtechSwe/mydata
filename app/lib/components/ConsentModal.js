import React from 'react'
import { View } from 'react-native'
import Modal from 'react-native-modal'
import { Wrap, ScrollViewWrap } from './View/Wrapper'
import { H3, Paragraph, Separator } from './typography/Typography'
import {
  AcceptConsentButton,
  DenyConsentButton,
  ConsentButtonWrap,
} from './elements/Button/ConsentButton'

const ConsentModal = ({ client, scope, visible, onApprove, onReject }) => (
  <Wrap>
    <Modal
      animationType="slide"
      isVisible={visible}
      backdropOpacity={0.6}
      style={{
        marginHorizontal: 0,
        marginBottom: 0,
        width: '100%',
        height: '100%',
      }}
    >
      <View style={{ marginTop: 'auto', height: '82.5%' }}>
        <Separator style={{ marginBottom: 0, marginTop: 0 }} />
        <View
          style={{
            backgroundColor: 'white',
            paddingHorizontal: 36,
            paddingVertical: 24,
          }}
        >
          <H3>{client.display_name}</H3>
          <Paragraph align="left">{client.description}</Paragraph>
        </View>
        <Separator style={{ marginBottom: 0, marginTop: 0 }} />
        <ScrollViewWrap
          style={{
            paddingHorizontal: 36,
            paddingTop: 24,
            backgroundColor: '#F9F9FB',
          }}
          contentContainerStyle={{ alignItems: 'flex-start' }}
        >
          <View>
            {scope.map(scope => (
              <View key={scope.area} style={{ marginBottom: 24 }}>
                <H3>{scope.area}</H3>
                <Paragraph small>{scope.description}</Paragraph>
              </View>
            ))}
          </View>
        </ScrollViewWrap>
        <ConsentButtonWrap>
          <AcceptConsentButton onPress={onApprove}>Tillåt</AcceptConsentButton>
          <DenyConsentButton onPress={onReject}>Neka</DenyConsentButton>
        </ConsentButtonWrap>
      </View>
    </Modal>
  </Wrap>
)

export default ConsentModal
