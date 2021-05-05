const { response } = require("express");
const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require("cors");

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

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendick",
    number: "39-23-6423122",
  },
];

const maxPersons = () => {
  const maxId = Math.max(...persons.map((p) => p.id));
  return maxId;
};

app.get("/api/persons", (request, response) => {
  response.json(persons);
});

app.get("/info", (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p>
  <p>${Date()}</p>`);
});

// Getting information for a single person

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  person = persons.find((person) => person.id === id);
  if (person) {
    response.json(person);
  } else {
    return response.status(404).end();
  }
});
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Implementing a delete function

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

// Implementinng adding a new entry

app.post("/api/persons/", (request, response) => {
  const body = request.body;
  const id = Math.floor(Math.random() * 10000);
  if (persons.find((person) => person.name === body.name)) {
    response.status(400).json({ error: "name must be unique" });
  } else if (body.name === "" || body.number === "") {
    response.status(400).json({ error: "Name or number is missing" });
  } else {
    const person = {
      id: id,
      name: body.name,
      number: body.number,
    };

    persons = persons.concat(person);

    response.json(person);
  }
});
