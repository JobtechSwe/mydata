import React from 'react'
import { Wrap } from '../view/Wrapper'
import { Spinner } from '../elements/Spinner/Spinner'
import { Paragraph } from '../typography/Typography'
import ConsentModal from './ConsentModal'
import { approveConnection } from '../../services/auth'
import { toViewModel } from './parseData'

const Connection = ({ connectionRequest, onApprove, onCancel }) => {
  const [modalVisible, setModalVisible] = React.useState(true)
  const [approving, setApproving] = React.useState(false)

  const onApproveConnection = async permissions => {
    setApproving(true)
    await approveConnection({ ...connectionRequest, permissions })
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
      data={toViewModel(connectionRequest)}
    />
  )
}

// class ConsentRequest extends React.Component {
//   state = {
//     view: 'loading',
//     consentRequest: null,
//     modalVisible: true,
//   }

//   async componentDidMount() {
//     const consentRequest = await consentsService.get(
//       this.props.consentRequestId
//     )
//     this.setState({ consentRequest, view: 'approve' })
//   }

//   approve = async () => {
//     this.setState({ view: 'approving' })
//     await consentsService.approve(this.state.consentRequest)
//     this.props.onApprove()
//   }

//   reject = () => {
//     this.setState({ view: 'loading', modalVisible: false })
//     this.props.onCancel()
//   }

//   render() {
//     switch (this.state.view) {
//       case 'loading':
//         return (
//           <Wrap>
//             <Spinner />
//           </Wrap>
//         )
//       case 'approve':
//         return (
//           <ConsentModal
//             onApprove={this.approve}
//             onReject={this.reject}
//             visible={this.state.modalVisible}
//             data={toViewModel(this.state.consentRequest)}
//           />
//         )
//       case 'approving':
//         return (
//           <Wrap>
//             <Spinner />
//             <Paragraph align="center" style={{ marginTop: 24 }}>
//               Godkänner...
//             </Paragraph>
//           </Wrap>
//         )
//       case 'generating':
//         return (
//           <Wrap>
//             <Spinner />
//             <Paragraph align="center" style={{ marginTop: 24 }}>
//               Genererar...
//             </Paragraph>
//           </Wrap>
//         )
//     }
//   }
// }

export default Connection
