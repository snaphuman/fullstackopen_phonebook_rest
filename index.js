const repl = require('node:repl');

const express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.json());

let { persons } = require('./personsMock');

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
    res.json(persons);
});

app.get('/api/persons/:uuid', (req, res) => {
    const uuid = req.params.uuid;
    const person = persons.find(person => person.uuid === uuid);

    if(person) {
        res.json(person);
    } else {
        res.status(400).json({
            error: 'Person not found'
        }).end();
    }
});

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

    const person = {
        name: body.name,
        number: body.number,
        uuid: generatedUUID(),
    }

    persons = persons.concat(person);

    res.json(person);
})

app.delete('/api/persons/:uuid', (req, res) => {
    const uuid = Number(req.params.uuid);
    persons = persons.filter(person => person.uuid !== uuid)

    res.status(204).end();
});

const generatedUUID = () => {
    return crypto.randomUUID();
}

const PORT = 3001;

app.listen(PORT);


const replServer = repl.start({
    prompt: 'my-app> ',
    useColors: true,
})

replServer.context.app = app;

console.log(`Server running on port ${PORT}`);