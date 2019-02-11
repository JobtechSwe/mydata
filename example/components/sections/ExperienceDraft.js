import React, { useState } from 'react'
import { FormGroup, Label, ModalDialog, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Typography, Input } from '@smooth-ui/core-sc'

export default ({ experienceEntry, onSave, onClose }) => {
  const [title, setTitle] = useState(experienceEntry.title || '')
  const [employer, setEmployer] = useState(experienceEntry.employer || '')
  const [fromDate, setFromDate] = useState(experienceEntry.fromDate || '2001-01-01')
  const [toDate, setToDate] = useState(experienceEntry.toDate || '2001-01-01')
  const [description, setDescription] = useState(experienceEntry.description || '')

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSave({ title, employer, fromDate, toDate, description })
    }
  }

  return (
    <ModalDialog>
      <ModalContent>
        <ModalHeader>
          <Typography variant="h5" m={0}>
            Edit education
          </Typography>
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label>Title</Label>
            <Input control value={title} id="title" onChange={(e) => setTitle(e.target.value)} onKeyPress={handleKeyPress} />
            <Label>Employer</Label>
            <Input control value={employer} id="employer" onChange={(e) => setEmployer(e.target.value)} onKeyPress={handleKeyPress} />
            <Label>From</Label>
            <Input control value={fromDate} id="description" onChange={(e) => setFromDate(e.target.value)} onKeyPress={handleKeyPress} type="date" />
            <Label>To</Label>
            <Input control value={toDate} id="description" onChange={(e) => setToDate(e.target.value)} onKeyPress={handleKeyPress} type="date" />
            <Label>Description</Label>
            <Input control value={description} id="description" onChange={(e) => setDescription(e.target.value)} onKeyPress={handleKeyPress} />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => onSave({ title, employer, fromDate, toDate, description })}>Save changes</Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalDialog>)
}
