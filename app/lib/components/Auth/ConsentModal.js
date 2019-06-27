import React from 'react'
import { Image, View, TouchableOpacity } from 'react-native'
import Collapsible from 'react-native-collapsible'
import Modal from 'react-native-modal'
import { Wrap, ScrollViewWrap } from '../view/Wrapper'
import styled, { theme } from '../../theme'
import { H3, H4, Paragraph, Separator } from '../typography/Typography'
import {
  AcceptConsentButton,
  DenyConsentButton,
  ConsentButtonWrap,
} from '../elements/Button/ConsentButton'
import { Info } from '../Icons'

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
  flex-direction: row;
  align-self: stretch;
`

const ClientDescription = styled(View)`
  padding: 4px 0;
`

/*
const ConsentHeaderExternal = styled(ConsentHeader)`
  padding: 12px 36px;
`
*/

const ScopeItemWrapper = styled(View)`
  margin-bottom: 0px;
`

const readAndWriteHelper = type => {
  switch (type) {
    case 'READ':
      return 'Läsa'
    case 'WRITE':
      return 'Skriva'
    default:
      return 'Inga rättigheter'
  }
}

const ScopeItem = ({ scope, lastItem }) => {
  const [collapsed, setCollapsed] = React.useState(true)
  const { read, write } = scope

  return (
    <ScopeItemWrapper key={scope.area} style={{ paddingHorizontal: 36 }}>
      <TouchableOpacity
        activeOpactiy={1}
        onPress={_ => setCollapsed(wasCollapsed => !wasCollapsed)}
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
          <Info />
        </View>
      </TouchableOpacity>
      <Collapsible collapsed={collapsed}>
        {read && (
          <>
            <H4 style={{ fontSize: 12, marginTop: 8 }}>
              {readAndWriteHelper(read.type)}
            </H4>
            <Paragraph small>{read.purpose}</Paragraph>
          </>
        )}

        {write && (
          <>
            <H4 style={{ fontSize: 12, marginTop: 8 }}>
              {readAndWriteHelper(write.type)}
            </H4>
            <Paragraph small>{write.description}</Paragraph>
          </>
        )}
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
  data: { viewModel },
  visible,
  onApprove,
  onReject,
}) => {
  const handleApprovePermissions = () => onApprove({ local: viewModel.local })

  // const { local = [], external = [] } = data
  const { local = [] } = viewModel

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
            <Image
              source={{ uri: viewModel.iconURI }}
              style={{ width: 64, height: 64, marginRight: 12 }}
            />
            <ClientDescription>
              <H3 style={{ marginBottom: 8 }}>{viewModel.displayName}</H3>
              <Paragraph align="left">{viewModel.description}</Paragraph>
            </ClientDescription>
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
            {/* <Paragraph style={{ paddingHorizontal: 32 }}> */}
            {/*   Vill upprätta en relation med dig */}
            {/* </Paragraph> */}

            {local.map((permission, i) => (
              <ScopeItem
                key={permission.area}
                lastItem={i === local.length - 1}
                scope={permission}
              />
            ))}

            {/*external.map(({ scope }) => (
              <View key={scope.displayName}>
                <Separator style={{ marginBottom: 0, marginTop: 0 }} />
                <ConsentHeaderExternal>
                  <H4>{scope.displayName}</H4>
                  <Paragraph align="left" small>
                    {scope.description}
                  </Paragraph>
                </ConsentHeaderExternal>
                <Separator style={{ marginBottom: 24, marginTop: 0 }} />
                {scope.areas.map((scope, i) => (
                  <ScopeItem key={scope.area} scope={scope} />
                ))}
              </View>
            ))*/}
          </ScrollViewWrap>
          <ConsentButtonWrap>
            <AcceptConsentButton onPress={handleApprovePermissions}>
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
