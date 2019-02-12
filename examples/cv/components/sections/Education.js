import React, { useState, useContext } from 'react'
import Section from './Section'
import EducationDraft from './EducationDraft'
import { Box, Typography, Modal, Button } from '@smooth-ui/core-sc'
import { StoreContext } from '../../services/StoreContext'

export default () => {
  const [{ education }, dispatch] = useContext(StoreContext)

  // Local state
  const [draftIndex, setDraftIndex] = useState(undefined)
  const [modalOpen, setModal] = useState(false)

  const onSave = async (entry) => {
    typeof draftIndex === 'undefined'
      ? await dispatch({ type: 'ADD_EDUCATION', payload: { entry } })
      : await dispatch({ type: 'UPDATE_EDUCATION', payload: { entry, index: draftIndex } })
    setModal(false)
  }

  const openModal = (id) => {
    setDraftIndex(id)
    setModal(true)
  }

  const getDraft = (i) => typeof i !== 'undefined' ? education[i] : {}

  return (
    <Section title="Education" createHandler={() => openModal()}>
      {education && education.map((edu, i) => (
        <Box mt={5} key={i}>
          <Typography variant="h6">
            {edu && edu.schoolName}
            <Button onClick={() => openModal(i)} variant="light" ml={2} size="sm">Edit</Button>
          </Typography>
          <p>{edu && edu.fieldOfStudy}</p>
        </Box>
      ))}
      <Modal opened={modalOpen} onClose={() => setModal(false)}>
        <EducationDraft educationEntry={getDraft(draftIndex)} onClose={() => setModal(false)} onSave={onSave} />
      </Modal>
    </Section>
  )
}
