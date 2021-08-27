require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')

morgan.token('body', function (req, res) {
  if (req.method === 'POST') {
    return JSON.stringify(req.body)
  }
})

app.use(cors())
app.use(express.json())
app.use(express.static('build'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/info', (req, res) => {
  const count = persons.length
  const date = new Date()
  res.send(`Phonebook has ${count} entries<br/>${date.toString()}`)
})

app.get('/api/persons', (req, res) => {
  Person
    .find({})
    .then(persons => {
      res.json(persons)
    })
})

app.get('/api/persons/:id', (request, response) => {
  Person
  .find({_id: request.params.id})
  .then(result => {
    if (result) {
      response.json(result)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => console.log(error))
})

app.post('/api/persons', (request, response) => {
  const generateId = () => {
    return Math.floor(Math.random() * 1000);
  }

  if (!request.body || !request.body.name || !request.body.number) {
    return response.status(400).json({
      error: 'Content missing. Check name and number.'
    })
  }

  const newPerson = request.body

  Person
    .find({name: newPerson.name})
    .then(result => {
      if (result.length) {
        response.status(409).json({
          error: 'Name already exists.'
        })
      }
      else {
        const newEntry = new Person(newPerson)

        newEntry
          .save()
          .then(result => response.json({'message': `${newPerson.name} saved!`}))
      }
    })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(p => p.id !== id)

  response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
