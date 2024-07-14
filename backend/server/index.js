const express = require("express");
const { PORT } = require("./config.js");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

app.listen(5000, () => {
  console.log(`server has started on port: 5000`);
});

app.get("/", (req, res) => {
  console.log(req.body, "abc");
  res.send("GET Request Called");
});

// POST method route
app.post("/", (req, res) => {
  console.log(req.body, "def");
  console.log(req.headers, "hef");
  res.send("POST request to the homepage");
});
