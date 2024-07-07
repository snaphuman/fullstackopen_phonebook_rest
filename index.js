require('dotenv').config();
const repl = require('node:repl');
const express = require('express');
const crypto = require('crypto');
const morgan = require('morgan');
const cors = require('cors');
const { mongoose } = require('mongoose');
const app = express();

const Person = require('./models/person');

// Midleware

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

morgan.token('content', (req, _res) => JSON.stringify(req.body));

const logger = (tokens, req, res) => {
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens['response-time'](req, res), 'ms',
        tokens.content(req, res),
    ]
}

app.use(morgan(logger));

// MockData

let { persons } = require('./personsMock');
const { error } = require('node:console');

// Routes

app.get('/info', (req, res) => {
    const total = persons.length;
    const currentDate = new Date();

    const html = `
        <p>Phonebook has info for ${total} people</p>
        <p>${currentDate}</p>
    `;
    res.send(html);
});

app.get('/api/persons', (req, res) => {
    Person.find({}).then(people => {
        res.json(people);
    })
});

app.get('/api/persons/:uuid', (req, res, next) => {
    Person.findById(req.params.uuid).then(person => {
        if(person) {
            res.json(person);
        } else {
            res.status(404).end();
        }
    }).catch(error => next(error))
});

app.put('/api/persons/:uuid', (req, res, next) => {
    const body = req.body;
    console.log("BODY", body)

    const person = {
        name: body.name,
        number: body.number,
    }

    Person.findByIdAndUpdate(req.params.uuid, person, {new: true})
        .then((result) => {
            res.json(result)
        })
        .catch((error) => next(error))

})

app.post('/api/persons', (req, res) => {
    const body  = req.body;
    const personExist = persons.find(person => person.name.toLowerCase() === body.name.toLowerCase())

    if (!body.name) {
        return res.status(400).json({
            error: 'Name is missing',
        }).end();
    }

    if (!body.number) {
        return res.status(400).json({
            error: 'Number is missing',
        }).end();
    }

    if (personExist) {
        return res.status(400).json({
            error: 'Name must be unique',
        }).end();
    }

    const person = new Person({
        name: body.name,
        number: body.number,
    })

    person.save().then(saved => {
        res.json(saved);
    })
})

app.delete('/api/persons/:uuid', (req, res, next) => {
    console.log('PARAMS', req.params);
    Person.findByIdAndDelete(req.params.uuid)
        .then(result => {
            res.status(204).end();
        })
        .catch(error => next(error));
});

// Error Handler

const unknownEndpoint = (req, res) => {
    res.status(404).send({error: 'Unknown Endpoint'})

}

const errorHandler = (error, req, res, next) => {
    console.error(error);

    if (error.name === 'CastError') {
        return res.status(400).send({error: 'Malformed ID'})
    }

    next(error);
};

app.use(unknownEndpoint);
app.use(errorHandler);


const generatedUUID = () => {
    return crypto.randomUUID();
}

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const replServer = repl.start({
    prompt: 'my-app> ',
    useColors: true,
})

replServer.context.app = app;