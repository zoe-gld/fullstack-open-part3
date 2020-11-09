const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()

app.use(express.json())
app.use(cors())

morgan.token('body', function (req, res) {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
  return " "
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
  {
    id: 1,
    name: "Artho Hellas",
    number: "040-123456"
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "040-654321"
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "055-123456"
  },
  {
    id: 4,
    name: "DHH",
    number: "040-124563"
  }
]

app.get('/', (request, response) => {
  response.send('<h1>Hello from the phonebook</h1>')
})

app.get('/info', (request, response) => {
  response.send(
    `<p>Phonebook has info for ${persons.length} people.</p><p>${new Date()}</p>`
  )
})

app.get('/api/persons', (request, response) => {
  response.json(persons)
})

app.post('/api/persons', (request, response) => {
  const body = request.body
  if (!body.name) {
    return response.status(400).json({
      error: 'Invalid entry - Name is missing!'
    })
  }

  if (!body.number) {
    return response.status(400).json({
      error: 'Invalid entry - Phone number is missing!'
    })
  }

  if (persons.map(person => person.name).includes(body.name)) {
    return response.status(400).json({
      error: 'Invalid entry - Name must be unique.'
    })
  }

  const person = {
    id: Math.floor(Math.random() * Math.floor(1000000)),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)
  response.json(person)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const contact = persons.find(person => person.id === id)
  if (contact) {
    return response.json(contact)
  }
  response.status(404).end()
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(note => note.id !== id)

  response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
