import React, { useState, useContext } from 'react'
import Section from './Section'
import LanguageDraft from './LanguageDraft'
import { Box, Typography, Modal, Button } from '@smooth-ui/core-sc'
import { StoreContext } from '../../services/StoreContext'

export default () => {
  const [{ languages }, dispatch] = useContext(StoreContext)

  // Local state
  const [draftIndex, setDraftIndex] = useState(undefined)
  const [modalOpen, setModal] = useState(false)

  const onSave = async (entry) => {
    typeof draftIndex === 'undefined'
      ? await dispatch({ type: 'ADD_LANGUAGE', payload: { entry } })
      : await dispatch({ type: 'UPDATE_LANGUAGE', payload: { entry, index: draftIndex } })
    setModal(false)
  }

  const openModal = (i) => {
    setDraftIndex(i)
    setModal(true)
  }

  const getDraft = (i) => typeof i !== 'undefined' ? languages[i] : {}

  return (
    <Section title="Languages" createHandler={() => openModal()}>
      {languages && languages.map((lang, i) => (
        <Box mt={5} key={i}>
          <Typography variant="h6">
            {lang.languageName}
            <Button onClick={() => openModal(i)} variant="light" ml={2} size="sm">Edit</Button>
          </Typography>
          <p>{lang.proficiency}</p>
        </Box>
      ))}
      <Modal opened={modalOpen} onClose={() => setModal(false)}>
        <LanguageDraft languageEntry={getDraft(draftIndex)} onClose={() => setModal(false)} onSave={onSave} />
      </Modal>
    </Section>
  )
}
