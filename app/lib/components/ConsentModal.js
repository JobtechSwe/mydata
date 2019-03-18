import React from 'react'
import { View } from 'react-native'
import Modal from 'react-native-modal'
import { Wrap, ScrollViewWrap } from './View/Wrapper'
import styled, { theme } from '../theme'
import { H3, Paragraph, Separator } from './typography/Typography'
import {
  AcceptConsentButton,
  DenyConsentButton,
  ConsentButtonWrap,
} from './elements/Button/ConsentButton'

const StyledModal = styled(Modal)`
  margin: 0;
  width: 100%;
  height: 100%;
`

const ModalWrapper = styled(View)`
  margin-top: auto;
  height: 85%;
`

const ConsentHeader = styled(View)`
  background-color: ${({ theme }) => theme.colors.white};
  padding: 24px 36px;
`

const ScopeItemWrapper = styled(View)`
  margin-bottom: 24px;
`

const ConsentModal = ({ client, scope, visible, onApprove, onReject }) => (
  <Wrap>
    <StyledModal
      animationType="slide"
      isVisible={visible}
      backdropOpacity={0.6}
    >
      <ModalWrapper>
        <Separator style={{ marginBottom: 0, marginTop: 0 }} />
        <ConsentHeader>
          <H3>{client.displayName}</H3>
          <Paragraph align="left">{client.description}</Paragraph>
        </ConsentHeader>
        <Separator style={{ marginBottom: 0, marginTop: 0 }} />
        <ScrollViewWrap
          style={{
            paddingHorizontal: 36,
            paddingTop: 24,
            backgroundColor: theme.colors.quiet,
          }}
          contentContainerStyle={{ alignItems: 'flex-start' }}
        >
          {scope.map(scope => (
            <ScopeItemWrapper key={scope.area} style={{ marginBottom: 24 }}>
              <H3>{scope.area}</H3>
              <Paragraph small>{scope.description}</Paragraph>
            </ScopeItemWrapper>
          ))}
        </ScrollViewWrap>
        <ConsentButtonWrap>
          <AcceptConsentButton onPress={onApprove}>Tillåt</AcceptConsentButton>
          <Separator
            vertical={true}
            style={{ marginBottom: 0, marginTop: 0 }}
          />
          <DenyConsentButton onPress={onReject}>Neka</DenyConsentButton>
        </ConsentButtonWrap>
      </ModalWrapper>
    </StyledModal>
  </Wrap>
)

export default ConsentModal
