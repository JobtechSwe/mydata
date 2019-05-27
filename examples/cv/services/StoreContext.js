import React, { createContext, useEffect, useReducer } from 'react'
import * as storage from './storage'
import { write } from './data'

const StoreContext = createContext({})

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_EXPERIENCE':
      return { ...state,
        experience: state.experience
          ? state.experience.concat(action.payload.entry)
          : [action.payload.entry],
        dirty: { ...state.dirty, experience: true }
      }
    case 'UPDATE_EXPERIENCE':
      return { ...state,
        experience: state.experience.map((x, i) => action.payload.index !== i ? x : Object.assign({}, x, action.payload.entry)),
        dirty: { ...state.dirty, experience: true }
      }
    case 'ADD_LANGUAGE':
      return { ...state,
        languages: state.languages
          ? state.languages.concat(action.payload.entry)
          : [action.payload.entry],
        dirty: { ...state.dirty, languages: true }
      }
    case 'UPDATE_LANGUAGE':
      return { ...state,
        languages: state.languages.map((x, i) => action.payload.index !== i ? x : Object.assign({}, x, action.payload.entry)),
        dirty: { ...state.dirty, languages: true }
      }
    case 'ADD_EDUCATION':
      return { ...state,
        education: state.education
          ? state.education.concat(action.payload.entry)
          : [action.payload.entry],
        dirty: { ...state.dirty, education: true }
      }
    case 'UPDATE_EDUCATION':
      return { ...state,
        education: state.education.map((x, i) => action.payload.index !== i ? x : Object.assign({}, x, action.payload.entry)),
        dirty: { ...state.dirty, education: true }
      }
    case 'UPDATE_BASEDATA':
      return { ...state,
        baseData: action.payload,
        dirty: { ...state.dirty, baseData: true }
      }
    case 'LOAD_DATA':
      return { ...state, loaded: true, ...action.payload }
    case 'SAVE_DATA':
      return { ...state, dirty: { ...state.dirty, [action.area]: false } }
    case 'CLEAR':
      return { loaded: false }
    case 'SET_TOKEN':
      return { ...state, token: action.payload }
    case 'ERROR':
      console.error(action.error)
      return { ...state }
    default:
      throw Error(`Action type [${action.type}] has to be specified`)
  }
}

const StoreProvider = ({ ...props }) => {
  const [data, dispatch] = useReducer(reducer, {
    loaded: false,
    dirty: {
      baseData: false,
      experience: false,
      education: false,
      languages: false
    },
    baseData: {},
    experience: [],
    education: [],
    languages: []
  })

  // Get token
  useEffect(() => {
    const tokenFromStorage = storage.getAccessToken()
    if (tokenFromStorage && !data.token) {
      dispatch({ type: 'SET_TOKEN', payload: tokenFromStorage })
    }
  }, [])

  // Load data
  /* useEffect(() => {
    if (!data.token) { return }

    read(data.token)
      .then(retrievedData => {
        dispatch({ type: 'LOAD_DATA', payload: retrievedData })
      })
      .catch(error => {
        dispatch({ type: 'ERROR', error: new Error('LOAD_DATA', error) })
      })
  }, [data.token]) */

  const saveEffect = (area) => useEffect(() => {
    if (!data.token || !data[area]) { return }
    write(data.token, data, area)
      .then(() => dispatch({ type: 'SAVE_DATA', area }))
      .catch(error => dispatch({ type: 'ERROR', area, error: new Error('SAVE_DATA', error) }))
  }, [data.dirty[area]])

  saveEffect('baseData')
  saveEffect('experience')
  saveEffect('education')
  saveEffect('languages')

  return <StoreContext.Provider value={[data, dispatch]}>{props.children}</StoreContext.Provider>
}

export {
  StoreProvider,
  StoreContext
}
