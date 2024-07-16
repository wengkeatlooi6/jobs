const express = require("express");
const { PORT } = require("./config.js");
const cors = require("cors");
const db = require("./db");
const app = express();
const { body, validationResult } = require("express-validator"); // npm install express-validator
const xmlparser = require("express-xml-bodyparser"); // npm install express-xml-bodyparser
const swaggerSetup = require('./swagger.js');
const jobsRoute = require('./routes/getJob.js');
const jobsXMLRoute = require('./routes/getJobXML.js');
const addJobRoute = require('./routes/postJob.js');
const updateJobRoute = require('./routes/updateJob.js');

// Middleware
app.use(cors());
app.use(express.json());
app.use(xmlparser());
app.use('/', swaggerSetup);     // Integrate Swagger setup
app.use('/', jobsRoute);
app.use('/', jobsXMLRoute);
app.use('/', addJobRoute);
app.use('/', updateJobRoute);

app.listen(5000, () => {
  console.log(`server has started on port: 5000`);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
