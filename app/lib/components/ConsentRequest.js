import React, { Component } from 'react'
import { Wrap } from '../components/View/Wrapper'
import { Spinner } from '../components/elements/Spinner/Spinner'
import * as consentsService from '../services/consents'
import { Paragraph } from '../components/typography/Typography'
import ConsentModal from './ConsentModal'

class ConsentRequest extends Component {
  state = {
    view: 'loading',
    consentRequest: null,
    modalVisible: true,
  }

  async componentDidMount() {
    const consentRequest = await consentsService.get(
      this.props.consentRequestId
    )
    this.setState({ consentRequest, view: 'approve' })
  }

  approve = async () => {
    this.setState({ view: 'approving' })
    await consentsService.approve(this.state.consentRequest)
    this.props.onApprove()
  }

  reject = () => {
    this.setState({ view: 'loading', modalVisible: false })
    this.props.onCancel()
  }

  render() {
    switch (this.state.view) {
      case 'loading':
        return (
          <Wrap>
            <Spinner />
          </Wrap>
        )
      case 'approve':
        return (
          <ConsentModal
            onApprove={this.approve}
            onReject={this.reject}
            visible={this.state.modalVisible}
            client={this.state.consentRequest.client}
            scope={this.state.consentRequest.data.scope}
          />
        )
      case 'approving':
        return (
          <Wrap>
            <Spinner />
            <Paragraph align="center" style={{ marginTop: 24 }}>
              Godkänner...
            </Paragraph>
          </Wrap>
        )
      case 'generating':
        return (
          <Wrap>
            <Spinner />
            <Paragraph align="center" style={{ marginTop: 24 }}>
              Genererar...
            </Paragraph>
          </Wrap>
        )
    }
  }
}

export default ConsentRequest
