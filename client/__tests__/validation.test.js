const { validate, withValidation } = require('../lib/validation')
const Joi = require('joi')

describe('validation', () => {
  const validAnimal = {
    name: 'fido',
    kind: 'dog',
    puppyTo: ['pepsi', 'cola']
  }

  const dragon = { name: 'dragon', isReal: false }

  const animalSchema = {
    name: Joi.string().required(),
    kind: Joi.string().required(),
    puppyTo: Joi.array().items(Joi.string().min(1)).required()
  }

  describe('#validate', () => {
    it('validates when schema is fulfilled', async () => {
      const { error, value } = validate(animalSchema)(validAnimal)
      expect(error).toBeNull()
      expect(value).toEqual(validAnimal)
    })

    it('validates, partial application', async () => {
      const validateAnimal = validate(animalSchema)
      const { error, value } = validateAnimal(validAnimal)

      expect(error).toBeNull()
      expect(value).toEqual(validAnimal)
    })

    it('returns error when schema is not fulfilled', async () => {
      const { error, value } = validate(animalSchema, dragon)
      expect(error.name).toBe('ValidationError')
      expect(value).toEqual(dragon)
    })
  })

  describe('#withValidation', () => {
    let func

    beforeEach(() => {
      func = jest.fn()
    })

    it('calls func if valid body', () => {
      withValidation(animalSchema)(func)(validAnimal)
      expect(func).toHaveBeenCalledWith(validAnimal)
    })

    it('does not call func if invalid body', () => {
      withValidation(animalSchema)(func)(dragon)
      expect(func).not.toBeCalled()
    })

    it('returns error if invalid', () => {
      const { value, error } = withValidation(animalSchema)(func)(dragon)

      expect(error.name).toBe('ValidationError')
      expect(value).toEqual(dragon)
    })
  })
})
