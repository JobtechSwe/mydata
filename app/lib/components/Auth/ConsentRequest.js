import React from 'react'
import { Wrap } from '../view/Wrapper'
import { Spinner } from '../elements/Spinner/Spinner'
import { Paragraph } from '../typography/Typography'
import ConsentModal from './ConsentModal'
import { approveConnection } from '../../services/auth'
import { toViewModel, toResponse } from './parseData'

const Connection = ({ connectionRequest, onApprove, onCancel }) => {
  const [modalVisible, setModalVisible] = React.useState(true)
  const [approving, setApproving] = React.useState(false)

  const onApproveConnection = async permissions => {
    setApproving(true)
    await approveConnection(connectionRequest, toResponse(permissions))
    onApprove()
  }

  React.useEffect(() => () => setApproving(false), [])

  const onDenyConnection = () => {
    // TODO: Implement
    setModalVisible(false)
    onCancel()
  }

  if (approving) {
    return (
      <Wrap>
        <Spinner />
        <Paragraph align="center" style={{ marginTop: 24 }}>
          Godkänner...
        </Paragraph>
      </Wrap>
    )
  }

  return (
    <ConsentModal
      onApprove={onApproveConnection}
      onReject={onDenyConnection}
      visible={modalVisible}
      data={{
        viewModel: toViewModel(connectionRequest),
        connectionRequest,
      }}
    />
  )
}

export default Connection
