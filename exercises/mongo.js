const mongoose = require('mongoose')

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url =
  `mongodb+srv://game_project:${password}@cluster0.x5k5h.mongodb.net/phonebook-app?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const contactSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Contact = mongoose.model('Contact', contactSchema)

const contact = new Contact({
  name: name,
  number: number
})

if (process.argv.length < 3) {
  console.log('Please provide at least the password as argument: node mongo.js <password>')
  process.exit(1)
}
if (process.argv.length === 3) {
  Contact.find({}).then(result => {
    result.forEach(contact => {
      console.log(contact)
    })
    mongoose.connection.close()
  })
}
if (process.argv.length > 3) {
  contact.save().then(result => {
    console.log(`added ${name} number ${number} to phonebook!`)
    mongoose.connection.close()
  })
}
