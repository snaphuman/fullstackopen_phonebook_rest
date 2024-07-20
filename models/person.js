require('dotenv').config()
const { mongoose } = require('mongoose')

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI

console.log('URL', url)

mongoose.connect(url)
  .then((result) => {
    console.log('connected to mongodb', result)
  })
  .catch((error) => {
    console.log('error connecting to mongodb', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, '{VALUE} should have more than three chars'],
  },
  number: {
    type: String,
    validate: {
      validator: (v) => {
        return /\d{3}-\d{3}-\d{4}/.test(v)
      },
      message: (props) => `${props.value} is not a valid phone number`,
    },
    minLength: [12, 'cannot be shorter than 12 chars'],
    required: [true, 'phone number is required'],
  },
})

personSchema.set('toJSON', {
  transform: (doc, obj) => {
    obj.uuid = obj._id.toString()
    delete obj._id
    delete obj.__v
  }
})

module.exports = mongoose.model('Person', personSchema)