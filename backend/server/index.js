const express = require("express");
const { PORT } = require("./config.js");
const cors = require("cors");
const db = require("./db");
const app = express();
const { body, validationResult } = require("express-validator");    // npm install Express-Validator
const xmlparser = require('express-xml-bodyparser');                // npm install express-xml-bodyparser

// Middleware
app.use(cors());
app.use(express.json());
app.use(xmlparser());

app.listen(5000, () => {
    console.log(`server has started on port: 5000`);
});

app.get("/", (req, res) => {
    res.send("Hello World!");
});


// GET /jobs: Retrieves all the active (none-expired) jobs with pagination.
app.get('/jobs', async (req, res) => {
    try {
        // Pagination Parameters
        const page = parseInt(req.query.page) || 1;             // Default Page 1 if no parameter supplied
        const pageSize = parseInt(req.query.pageSize) || 10;    // Default 10 items if no parameter supplied

        // Error Handling 1 - 400 Bad Request - When Page and PageSize count is invalid
        if (page < 1 || pageSize < 1) {
            return res.status(400).json({
                result: null,
                meta: null,
                errors: {
                    code: 400,
                    name: "Bad Request",
                    message: "Invalid Page or Page Size.",
                    details: {
                        path: "/jobs",
                        timestamp: new Date().toISOString
                    }
                }
            });
        }

        // Offset Calculation
        const offset = (page - 1) * pageSize;

        // SQL Query - Fetch Active Jobs with Pagination
        const query = {
            text: `
                SELECT * FROM Job
                WHERE ExpiryDate > NOW()
                ORDER BY JobID
                LIMIT $1
                OFFSET $2
            `,
            values: [pageSize, offset]
        }

        // Execute Query
        const { rows } = await db.query(query.text, query.values);

        // Error Handling 2 - 404 Not Found - When No Active Jobs Found
        if (rows.length === 0) {
            return res.status(404).json({
                result: null,
                meta: null,
                errors: {
                    code: 404,
                    name: "Not Found",
                    message: "No Active Jobs.",
                    details: {
                        path: "/jobs",
                        timestamp: new Date().toISOString
                    }
                }
            });
        }

        // SQL Query - Count Total Number of Active Jobs
        const countQuery = {
            text: `
                SELECT COUNT(*) FROM Job
                WHERE ExpiryDate > NOW()
            `
        }

        // Execute Count Query
        const totalCount = await db.query(countQuery.text);

        // Calculate Total Pages
        const totalPages = Math.ceil(parseInt(totalCount.rows[0].count) / pageSize);

        // const result = await db.query('SELECT * FROM Job');
        res.status(200).json({
            result: rows,
            meta: {
                code: 200,
                name: "Success",
                page: page,
                pageSize: pageSize,
                totalItems: parseInt(totalCount.rows[0].count),
                totalPages: totalPages
            },
            errors: null
        });
    } catch (err) {
        console.error(err);
        // Default Error Handling - 500 Internal Server Error
        res.status(500).json({
            result: null,
            meta: null,
            errors: {
                code: 500,
                name: "Internal Server Error",
                message: "There is an error on the downstream server, please retry again later.",
                details: {
                    path: "/jobs",
                    timestamp: new Date().toISOString
                }
            }
        });
    }
});

// POST /jobs: Create a new job posting with an expiry_date set by default for 30 days.
app.post("/jobs",
    [
        [
            body("EmployerID").notEmpty().isInt(),
            body("RequisitionID").notEmpty(),
            body("Title").notEmpty(),
            body("Description").notEmpty(),
            body("City").notEmpty(),
            body("State").notEmpty(),
            body("Country").notEmpty(),
            body("PostalCode").notEmpty().isInt(),
            body("StreetAddress").notEmpty(),
            body("Salary").notEmpty(),
            body("Education").notEmpty(),
            body("JobType").notEmpty(),
            body("Experience").notEmpty(),
            body("RemoteType").notEmpty(),
            body("URL").notEmpty(),
        ],
    ],
    async (req, res) => {
        try {
            // Error Handling 1 - 400 Bad Request - When Mandatory Fields Missing
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    result: null,
                    meta: null,
                    errors: {
                        code: 400,
                        name: "Bad Request",
                        message: "Missing Mandatory Fields.",
                        details: {
                            path: "/jobs",
                            timestamp: new Date().toISOString
                        }
                    }
                });
            }

            // Extract job data from request body
            const { EmployerID, RequisitionID, Title, Description, City, State, Country, PostalCode, StreetAddress, Salary, Education, JobType, Experience, RemoteType, URL } = req.body;

            // Calculate Today Date and Expiry Date (30 days later)
            const todayDate = new Date();
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30);

            // SQL Query - Insert Job into Database
            const query = {
                text: `
                INSERT INTO Job (EmployerID, RequisitionID, Title, Description, City, State, Country, PostalCode, StreetAddress, Salary, Education, JobType, Experience, DatePosted, ExpiryDate, RemoteType, URL)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                RETURNING Title, ExpiryDate
            `,
                values: [EmployerID, RequisitionID, Title, Description, City, State, Country, PostalCode, StreetAddress, Salary, Education, JobType, Experience, todayDate, expiryDate, RemoteType, URL]
            }

            // Execute Query
            const { rows } = await db.query(query.text, query.values);

            res.status(201).json({
                result: {
                    message: `${rows.Title} has been created`,
                    expiryDate: rows.ExpiryDate
                },
                meta: {
                    code: 201,
                    name: "Created",
                },
                errors: null
            });
        } catch (err) {
            console.error(err);
            // Default Error Handling - 500 Internal Server Error
            res.status(500).json({
                result: null,
                meta: null,
                errors: {
                    code: 500,
                    name: "Internal Server Error",
                    message: "There is an error on the downstream server, please retry again later.",
                    details: {
                        path: "/jobs",
                        timestamp: new Date().toISOString
                    }
                }
            });
        }
    });

// GET /jobs/indeed.xml: Retrieves all the active jobs without pagination in XML format that aligns with Indeed XML Feed reference you can ignore the <url> field or leave it blank.
app.get('/jobs/indeed.xml', async (req, res) => {
    try {
        if (req.accepts('xml')) {
            // SQL Query - Fetch Active Jobs with Pagination
            const query = {
                text: `
                SELECT * FROM Job
                WHERE ExpiryDate > NOW()
                ORDER BY JobID
            `
            }

            // Execute Query
            const { rows } = await db.query(query);

            // Error Handling 1 - 404 Not Found - When No Active Jobs Found
            if (rows.length === 0) {
                return res.status(404).json({
                    result: null,
                    meta: null,
                    errors: {
                        code: 404,
                        name: "Not Found",
                        message: "No Active Jobs.",
                        details: {
                            path: "/jobs/indeed.xml",
                            timestamp: new Date().toISOString
                        }
                    }
                });
            }

            const xmlResponse = `<?xml version="1.0" encoding="utf-8"?><source><publisher>My System</publisher><publisherurl>http://www.mysystem.com</publisherurl><jobs>${rows.map(job => `<job><title>${job.Title}</title><date>${job.DatePosted}</date><referencenumber>${job.JobID}</referencenumber><requisitionid>${job.RequisitionID}</requisitionid><url>${job.URL}</url><company>${job.EmployerName}</company><sourcename>${job.EmployerHeadquarter}</sourcename><city>${job.City}</city><state>${job.State}</state><country>${job.Country}</country><postalcode>${job.PostalCode}</postalcode><streetaddress>${job.StreetAddress}</streetaddress><email>${job.EmployerEmail}</email><description>${job.Description}</description><salary>${job.Salary}</salary><education>${job.Education}</education><jobtype>${job.JobType}</jobtype><category>${job.Category}</category><experience>${job.Experience}</experience><expirationdate>${job.ExpiryDate}</expirationdate><remotetype>${job.RemoteType}</remotetype></job>`).join('')}</jobs></source>`;

            // Set Content-Type header to indicate XML response
            res.set('Content-Type', 'application/xml');

            // Send XML response
            res.status(200).send(xmlResponse);
        } else {
            // Error Handling 2 - 400 Bad Request - When No Accept "xml" or "*" Specified
            res.status(400).json({
                result: null,
                meta: null,
                errors: {
                    code: 400,
                    name: "Bad Request",
                    message: "Missing Accept Headers.",
                    details: {
                        path: "/jobs/indeed.xml",
                        timestamp: new Date().toISOString
                    }
                }
            });
        }
    } catch (err) {
        console.error(err);
        // Default Error Handling - 500 Internal Server Error
        res.status(500).json({
            result: null,
            meta: null,
            errors: {
                code: 500,
                name: "Internal Server Error",
                message: "There is an error on the downstream server, please retry again later.",
                details: {
                    path: "/jobs/indeed.xml",
                    timestamp: new Date().toISOString
                }
            }
        });
    }
});

// POST /jobs/indeed-application: Job seeker to apply from Indeed Feed and Update the Job Status.
app.post("/jobs/indeed-application",
    [
        [
            body("jobUrl").notEmpty(),
            body("jobId").notEmpty(),
            body("jobTitle").notEmpty(),
            body("jobCompanyName").notEmpty(),
            body("jobLocation").notEmpty(),
            body("jobMeta").notEmpty(),
            body("apiToken").notEmpty(),
            body("postUrl").notEmpty(),
            body("phone").notEmpty(),
            body("coverletter").notEmpty(),
            body("resume").notEmpty(),
            body("name").notEmpty(),
            body("questions").notEmpty(),
            body("email").notEmpty(),
            body("locale").notEmpty(),
            body("advNum").notEmpty(),
        ],
    ],
    async (req, res) => {
        try {
            // Error Handling 1 - 400 Bad Request - When Mandatory Fields Missing
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    result: null,
                    meta: null,
                    errors: {
                        code: 400,
                        name: "Bad Request",
                        message: "Missing Mandatory Fields.",
                        details: {
                            path: "/jobs/indeed-application",
                            timestamp: new Date().toISOString
                        }
                    }
                });
            }

            // Extract job data from request body
            const { jobUrl, jobId, jobTitle, jobCompanyName, jobLocation, jobMeta, apiToken, postUrl, phone, coverletter, resume, name, questions, email, locale, advNum } = req.body;

            // SQL Query - Insert Job into Database
            const query = {
                text: `
                INSERT INTO Job (EmployerID, RequisitionID, Title, Description, City, State, Country, PostalCode, StreetAddress, Salary, Education, JobType, Experience, DatePosted, ExpiryDate, RemoteType, URL)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                RETURNING Title, ExpiryDate
            `,
                values: [EmployerID, RequisitionID, Title, Description, City, State, Country, PostalCode, StreetAddress, Salary, Education, JobType, Experience, todayDate, expiryDate, RemoteType, URL]
            }

            // Execute Query
            const { rows } = await db.query(query.text, query.values);

            res.status(201).json({
                result: {
                    message: `${rows.Title} has been created`,
                    expiryDate: rows.ExpiryDate
                },
                meta: {
                    code: 201,
                    name: "Created",
                },
                errors: null
            });
        } catch (err) {
            console.error(err);
            // Default Error Handling - 500 Internal Server Error
            res.status(500).json({
                result: null,
                meta: null,
                errors: {
                    code: 500,
                    name: "Internal Server Error",
                    message: "There is an error on the downstream server, please retry again later.",
                    details: {
                        path: "/jobs/indeed-application",
                        timestamp: new Date().toISOString
                    }
                }
            });
        }
    });
