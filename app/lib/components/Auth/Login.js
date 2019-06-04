import React, { useState } from 'react'
import { View } from 'react-native'
import Modal from 'react-native-modal'
import { Wrap, ScrollViewWrap } from '../view/Wrapper'
import styled, { theme } from '../../theme'
import { H3, Paragraph, Separator } from '../typography/Typography'
import {
  AcceptConsentButton,
  DenyConsentButton,
  ConsentButtonWrap,
} from '../elements/Button/ConsentButton'

import { approveLogin } from '../../services/auth'

const StyledModal = styled(Modal)`
  margin: 0;
  width: 100%;
  align-self: center;
  height: 100%;
`

const ModalWrapper = styled(View)`
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  margin-top: auto;
`

const ConsentHeader = styled(View)`
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 24px 36px;
`

const ScopeItemWrapper = styled(View)`
  margin-bottom: 24px;
`

function Login(props) {
  const [currentState, updateState] = useState({
    view: 'question',
    modalVisible: true,
  })

  const approve = async () => {
    updateState({ ...currentState, view: 'approving' })
    approveLogin({
      connection: props.existingConnection,
      sessionId: props.sessionId,
    })
    props.onApprove()
  }

  const acceptSituation = () => {
    props.onError()
  }

  const reject = () => {
    updateState({ ...currentState, view: 'question' })
    props.onCancel()
  }

  switch (currentState.view) {
    case 'question':
      return (
        <Wrap>
          <StyledModal
            animationType="fade"
            isVisible={true}
            backdropOpacity={0.6}
          >
            <ModalWrapper>
              <ConsentHeader>
                <H3 style={{ margin: 0 }}>Inloggningsförfrågan</H3>
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
                <ScopeItemWrapper style={{ marginBottom: 24 }}>
                  <H3>Vill du logga in på:</H3>
                  <Paragraph small>
                    {props.existingConnection.serviceId}
                  </Paragraph>
                </ScopeItemWrapper>
              </ScrollViewWrap>
              <ConsentButtonWrap
                style={{
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                }}
              >
                <AcceptConsentButton onPress={approve}>Ja</AcceptConsentButton>
                <Separator
                  vertical={true}
                  style={{ marginBottom: 0, marginTop: 0 }}
                />
                <DenyConsentButton onPress={reject}>Nej</DenyConsentButton>
              </ConsentButtonWrap>
            </ModalWrapper>
          </StyledModal>
        </Wrap>
      )
    case 'approving':
      return <Paragraph>Godkänner...</Paragraph>
    case 'error':
      return (
        <Wrap>
          <StyledModal
            animationType="fade"
            isVisible={currentState.modalVisible}
            backdropOpacity={0.6}
          >
            <ModalWrapper>
              <Separator style={{ marginBottom: 0, marginTop: 0 }} />
              <ConsentHeader>
                <H3>Fel:</H3>
                <Paragraph align="left">{currentState.error.message}</Paragraph>
              </ConsentHeader>
              <Separator style={{ marginBottom: 0, marginTop: 0 }} />
              <ConsentButtonWrap>
                <AcceptConsentButton onPress={acceptSituation}>
                  Ok
                </AcceptConsentButton>
                <Separator
                  vertical={true}
                  style={{ marginBottom: 0, marginTop: 0 }}
                />
                <DenyConsentButton onPress={reject}>Nej</DenyConsentButton>
              </ConsentButtonWrap>
            </ModalWrapper>
          </StyledModal>
        </Wrap>
      )
  }
}

export default Login
