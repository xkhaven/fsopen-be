require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')
const requestLogger = () => {
  morgan.token('body', function (req, res) {
    if (req.method === 'POST') {
      return JSON.stringify(req.body)
    }
  })
  return morgan(':method :url :status :res[content-length] - :response-time ms :body')
}

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(requestLogger())

app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

app.get('/info', (request, response) => {
  Person.find({})
    .then(persons => {
      const count = persons.length
      const date = new Date()
      response.send(`Phonebook has ${count} entries<br/>${date.toString()}`)
    })
    .catch(error => next(error))
})

app.get('/api/persons', (request, response, next) => {
  Person.find({})
    .then(persons => {
      response.json(persons)
    })
    .catch(error => next(error))
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(result => {
      if (result) {
        response.json(result)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Content missing. Check name and number.'
    })
  }

  const newEntry = new Person(body)

  newEntry.save()
    .then(result => response.json(result))
    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => response.status(204).end())
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'Content missing. Check name and number.'
    })
  }

  const entry = {
    name: body.name,
    number: body.number
  }

  Person.findByIdAndUpdate(request.params.id, entry, {new: true})
    .then(result => response.json(result))
    .catch(error => next(error))
})

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

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
