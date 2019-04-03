import React, { createContext, useEffect, useReducer } from 'react'
import * as storage from './storage'
import { read, write } from './data'

const StoreContext = createContext({})

const reducer = (state, action) => {
  switch (action.type) {
    case 'ADD_EXPERIENCE':
      return { ...state,
        dirty: true,
        experience: state.experience
          ? state.experience.concat(action.payload.entry)
          : [action.payload.entry]
      }
    case 'UPDATE_EXPERIENCE':
      return { ...state,
        dirty: true,
        experience: state.experience.map((x, i) => action.payload.index !== i ? x : Object.assign({}, x, action.payload.entry))
      }
    case 'ADD_LANGUAGE':
      return { ...state,
        dirty: true,
        languages: state.languages
          ? state.languages.concat(action.payload.entry)
          : [action.payload.entry]
      }
    case 'UPDATE_LANGUAGE':
      return { ...state,
        dirty: true,
        languages: state.languages.map((x, i) => action.payload.index !== i ? x : Object.assign({}, x, action.payload.entry))
      }
    case 'ADD_EDUCATION':
      return { ...state,
        dirty: true,
        education: state.education
          ? state.education.concat(action.payload.entry)
          : [action.payload.entry]
      }
    case 'UPDATE_EDUCATION':
      return { ...state,
        dirty: true,
        education: state.education.map((x, i) => action.payload.index !== i ? x : Object.assign({}, x, action.payload.entry))
      }
    case 'UPDATE_BASEDATA':
      return { ...state,
        dirty: true,
        baseData: action.payload
      }
    case 'LOAD_DATA':
      return { ...state, loaded: true, ...action.payload }
    case 'SAVE_DATA':
      return { ...state, dirty: false }
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
    dirty: false,
    baseData: {},
    experience: [],
    education: [],
    languages: []
  })

  useEffect(() => {
    const tokenFromStorage = storage.getAccessToken()
    if (tokenFromStorage && !data.token) {
      dispatch({ type: 'SET_TOKEN', payload: tokenFromStorage })
    }
  }, [])

  useEffect(() => {
    if (!data.token) { return }

    read(data.token)
      .then(retrievedData => {
        dispatch({ type: 'LOAD_DATA', payload: retrievedData })
      })
      .catch(error => {
        dispatch({ type: 'ERROR', error: new Error('LOAD_DATA', error) })
      })
  }, [data.token])

  useEffect(() => {
    if (!data.token || !data.loaded || !data.dirty) { return }
    const { token, baseData, experience, education, languages } = data
    write(token, { baseData, experience, education, languages })
      .then(() => {
        dispatch({ type: 'SAVE_DATA' })
      })
      .catch(error => {
        dispatch({ type: 'ERROR', error: new Error('SAVE_DATA', error) })
      })
  }, [JSON.stringify([data.baseData, data.experience, data.education, data.languages])])

  return <StoreContext.Provider value={[data, dispatch]}>{props.children}</StoreContext.Provider>
}

export {
  StoreProvider,
  StoreContext
}
