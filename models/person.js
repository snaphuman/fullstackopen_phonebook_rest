require('dotenv').config();
const { mongoose } = require("mongoose");

mongoose.set('strictQuery', false);

const url = process.env.MONGODB_URI;

console.log('URL', url)

mongoose.connect(url)
        .then((result) => {
            console.log('connected to mongodb', result)
        })
        .catch((error) => {
            console.log('error connecting to mongodb', error.message)
        }) 

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

personSchema.set('toJSON', {
    transform: (doc, obj) => {
        obj.uuid = obj._id.toString();
        delete obj._id;
        delete obj.__v;
    }
});

module.exports = mongoose.model('Person', personSchema)