import React, { useState } from 'react'
import { FormGroup, Label, ModalDialog, ModalContent, ModalHeader, ModalBody, ModalFooter, Button, Typography, Input } from '@smooth-ui/core-sc'

export default ({ languageEntry, onSave, onClose }) => {
  const [language, setLanguage] = useState(languageEntry.languageName || '')
  const [proficiency, setProficiency] = useState(languageEntry.proficiency || '')

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSave({ languageName: language, proficiency })
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
            <Label>Language</Label>
            <Input control value={language} id="language" onChange={(e) => setLanguage(e.target.value)} onKeyPress={handleKeyPress} />
            <Label>Proficiency</Label>
            <Input control value={proficiency} id="proficiency" onChange={(e) => setProficiency(e.target.value)} onKeyPress={handleKeyPress} />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button variant="primary" onClick={() => onSave({ languageName: language, proficiency })}>Save changes</Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalDialog>)
}
