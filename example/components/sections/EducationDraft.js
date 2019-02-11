import React, { useState } from 'react'
import { FormGroup, Label, ModalDialog, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Typography, Input } from '@smooth-ui/core-sc'

export default ({ educationEntry, onSave, onClose }) => {
  const [schoolName, setSchoolName] = useState(educationEntry.schoolName || '')
  const [fieldOfStudy, setFieldOfStudy] = useState(educationEntry.fieldOfStudy || '')
  const [degree, setDegree] = useState(educationEntry.degree || '')

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSave({ schoolName, fieldOfStudy, degree })
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
            <Label>School</Label>
            <Input control value={schoolName} id="schoolName" onChange={(e) => setSchoolName(e.target.value)} onKeyPress={handleKeyPress} />
            <Label>Field of Study</Label>
            <Input control value={fieldOfStudy} id="fieldOfStudy" onChange={(e) => setFieldOfStudy(e.target.value)} onKeyPress={handleKeyPress} />
            <Label>Degree</Label>
            <Input control value={degree} id="degree" onChange={(e) => setDegree(e.target.value)} onKeyPress={handleKeyPress} />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => onSave({ schoolName, fieldOfStudy, degree })}>Save changes</Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalDialog>)
}
