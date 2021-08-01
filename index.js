require("dotenv").config();
const { response } = require("express");
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");
const person = require("./models/person");

app.use(express.static("build"));
app.use(cors());

morgan.token("test", (req, res) => {
  if (req.method === "POST") return JSON.stringify(req.body);
});

app.use(
  morgan((tokens, req, res) => {
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      tokens.test(req, res),
    ].join(" ");
  })
);

app.use(express.json());

// let persons = [
//   {
//     id: 1,
//     name: "Arto Hellas",
//     number: "040-123456",
//   },
//   {
//     id: 2,
//     name: "Ada Lovelace",
//     number: "39-44-5323523",
//   },
//   {
//     id: 3,
//     name: "Dan Abramov",
//     number: "12-43-234345",
//   },
//   {
//     id: 4,
//     name: "Mary Poppendick",
//     number: "39-23-6423122",
//   },
// ];

// const maxPersons = () => {
//   const maxId = Math.max(...Person.map((p) => p.id));
//   return maxId;
// };

app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

app.get("/info", (request, response) => {
  response.send(`<p>Phonebook has info for ${Person.length} people</p>
  <p>${Date()}</p>`);
});

// Getting information for a single person

app.get("/api/persons/:id", (request, response, next) => {
  const id = String(request.params.id);
  Person.findById(id)
    .then((person) => {
      response.json(person);
    })
    .catch((error) => next(error));
  // if (person) {
  //   response.json(person);
  // } else {
  //   return response.status(404).end();
  // }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Implementing a delete function

app.delete("/api/persons/:id", (request, response, next) => {
  // const id = String(request.params.id);
  // persons = Person.filter((person) => person.id !== id);
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// Implementinng adding a new entry

app.post("/api/persons/", (request, response, next) => {
  const body = request.body;
  const id = Math.floor(Math.random() * 10000);

  const person = new Person({
    id: id,
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

//Implementing put request

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

///Implementin Error handling with next middleware

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unkwnon endpoint" });
};

app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name == "ValidationError") {
    return response.status(400).send({ error: error.message });
  }
  next(error);
};
app.use(errorHandler);
