const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://dbuser:${password}@cluster0.8xds5.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv[3] && process.argv[4]) {
  const person = new Person({
    name: process.argv[3],
    number: process.argv[4],
  })

  person
    .save()
    .then(response => {
      console.log(`${process.argv[3]} – ${process.argv[4]} saved!`)
      mongoose.connection.close()
    })
    .catch(error => console.log(error))
}
else {
  Person
    .find({})
    .then(persons => {
      console.log('Phonebook:')
      persons.map(p => {
        console.log(`${p.name} ${p.number}`)
      })
      mongoose.connection.close()
    })
    .catch(error => console.log(error))
}
