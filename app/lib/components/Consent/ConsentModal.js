import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import Collapsible from 'react-native-collapsible'
import SvgUri from 'react-native-svg-uri'
import Modal from 'react-native-modal'
import { Wrap, ScrollViewWrap } from '../View/Wrapper'
import styled, { theme } from '../../theme'
import { H3, H4, Paragraph, Separator } from '../typography/Typography'
import {
  AcceptConsentButton,
  DenyConsentButton,
  ConsentButtonWrap,
} from '../elements/Button/ConsentButton'

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
  align-self: stretch;
`

const ConsentHeaderExternal = styled(ConsentHeader)`
  padding: 12px 36px;
`

const ScopeItemWrapper = styled(View)`
  margin-bottom: 0px;
`

const readAndWriteHelper = permissions => {
  if (permissions.includes('READ') && permissions.includes('WRITE')) {
    return 'Läsa och skriva'
  }

  if (permissions.includes('READ')) {
    return 'Läsa'
  }

  if (permissions.includes('WRITE')) {
    return 'Skriva'
  } else {
    return 'Inga rättigheter'
  }
}
const ScopeItem = ({ scope, lastItem }) => {
  const [collapsed, setCollapsed] = React.useState(true)
  return (
    <ScopeItemWrapper key={scope.area} style={{ paddingHorizontal: 36 }}>
      <TouchableOpacity
        activeOpactiy={1}
        onPress={_ => setCollapsed(!collapsed)}
      >
        <View
          style={{
            alignSelf: 'stretch',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Paragraph small>{scope.description}</Paragraph>
          <SvgUri
            svgXmlData={`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none">
  <path fill="#908FA3" d="M8 0C3.589 0 0 3.589 0 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm0 14.546A6.553 6.553 0 0 1 1.455 8 6.553 6.553 0 0 1 8 1.455 6.553 6.553 0 0 1 14.546 8 6.553 6.553 0 0 1 8 14.546z"/>
  <path fill="#908FA3" d="M8 3.394a.97.97 0 0 0 0 1.94.97.97 0 0 0 0-1.94zM8 6.788a.727.727 0 0 0-.727.727v4.364a.727.727 0 0 0 1.454 0V7.515A.727.727 0 0 0 8 6.788z"/>
</svg>`}
          />
        </View>
      </TouchableOpacity>
      <Collapsible collapsed={collapsed}>
        <H4 style={{ fontSize: 12, marginTop: 8 }}>Syfte</H4>
        <Paragraph small>{scope.purpose}</Paragraph>
        <H4 style={{ fontSize: 12, marginTop: 8 }}>Rättigheter</H4>
        <Paragraph small>{readAndWriteHelper(scope.permissions)}</Paragraph>
      </Collapsible>
      {lastItem ? (
        <View style={{ marginTop: 12, marginBottom: 16 }} />
      ) : (
        <Separator style={{ marginBottom: 12, marginTop: 12 }} />
      )}
    </ScopeItemWrapper>
  )
}

const ConsentModal = ({
  data: { client, externals },
  visible,
  onApprove,
  onReject,
}) => {
  return (
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
              paddingTop: 24,
              backgroundColor: theme.colors.quiet,
            }}
            contentContainerStyle={{
              width: '100%',
              alignItems: 'stretch',
            }}
          >
            {client.areas.map((scope, i) => (
              <ScopeItem
                key={scope.area}
                lastItem={i === client.areas.length - 1}
                scope={scope}
              />
            ))}
            {externals.map(({ client }) => (
              <View key={client.displayName}>
                <Separator style={{ marginBottom: 0, marginTop: 0 }} />
                <ConsentHeaderExternal>
                  <H4>{client.displayName}</H4>
                  <Paragraph align="left" small>
                    {client.description}
                  </Paragraph>
                </ConsentHeaderExternal>
                <Separator style={{ marginBottom: 24, marginTop: 0 }} />
                {client.areas.map((scope, i) => (
                  <ScopeItem
                    key={scope.area}
                    lastItem={i === client.areas.length - 1}
                    scope={scope}
                  />
                ))}
              </View>
            ))}
          </ScrollViewWrap>
          <ConsentButtonWrap>
            <AcceptConsentButton onPress={onApprove}>
              Tillåt
            </AcceptConsentButton>
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
}

export default ConsentModal
