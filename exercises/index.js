const config = require('./config')

const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

const Person = require('./models/person')

app.use(express.json())
app.use(express.static('build'))
app.use(cors())

morgan.token('body', function (req) {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return ' '
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (request, response) => {
  response.send('<h1>Hello from the phonebook</h1>')
})

app.get('/info', (request, response) => {
  Person.find({})
    .then(people => {
      response.send(`<p>Phonebook has info for ${people.length} people.</p><p>${new Date()}</p>`)
    })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(people => {
    response.json(people)
  })
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  if (!body.name) {
    return response.status(400).json({
      error: 'Invalid entry - Name is missing!'
    })
  }

  if (!body.number) {
    return response.status(400).send({
      error: 'Invalid entry - Phone number is missing!'
    })
  }

  const person = new Person({
    name: body.name,
    number: body.number
  })

  person.save()
    .then(savedPerson => {response.json(savedPerson.toJSON())})
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true, runValidators: true, context: 'query'
  })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }

  next(error)
}
app.use(errorHandler)


const PORT = config.web.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
