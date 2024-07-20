/**
* @swagger
* /jobs/indeed-application:
*   post:
*     tags:
*       - Jobs
*     operationId: ''
*     parameters: []
*     requestBody:
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               id:
*                 type: string
*                 description: id
*                 example: ABCDEFGHJIK
*               job:
*                 type: object
*                 description: job
*                 example:
*                   jobUrl: https://www.tnb.com/career/businessanalyst
*                   jobId: '1'
*                   jobKey: ABC1
*                   jobTitle: Business Analyst
*                   jobCompany: TNB1234
*                   jobLocation: 1, Jalan Pudu
*               applicant:
*                 type: object
*                 description: applicant
*                 example:
*                   phoneNumber: '+60123203243'
*                   resume: ABCDE
*                   fullName: John Smith
*                   firstName: John
*                   lastName: Smith
*                   email: john@gmail.com
*               locale:
*                 type: string
*                 description: locale
*                 example: en-MY
*               appliedOnMillis:
*                 type: number
*                 description: appliedOnMillis
*                 example: 1732943045
*     responses:
*       '201':
*         description: Job Created
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 result:
*                   type: object
*                   description: result
*                   example:
*                     message: ABCDEFGHJIK has been created
*                 meta:
*                   type: object
*                   description: meta
*                   example:
*                     code: 201
*                     name: Created
*                 errors:
*                   type: object
*                   description: errors
*                   example: null
*       '400':
*         description: Missing Mandatory Fields
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 result:
*                   type: object
*                   description: result
*                   example: null
*                 meta:
*                   type: object
*                   description: meta
*                   example: null
*                 errors:
*                   type: object
*                   description: errors
*                   example:
*                     code: 400
*                     name: Bad Request
*                     message: Missing Mandatory Fields.
*                     details:
*                       path: /jobs/indeed-application
*                       timestamp: 2024-07-19T11:21:21+0000
*       '500':
*         description: Internal Server Error
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 result:
*                   type: object
*                   description: result
*                   example: null
*                 meta:
*                   type: object
*                   description: meta
*                   example: null
*                 errors:
*                   type: object
*                   description: errors
*                   example:
*                     code: 500
*                     name: Internal Server Error
*                     message: There is an error on the downstream server, please retry again later.
*                     details:
*                       path: /jobs/indeed-application
*                       timestamp: 2024-07-19T11:21:21+0000
*/
const express = require('express');
const router = express.Router();
const db = require("../db");
const { body, validationResult } = require("express-validator");

// POST /jobs/indeed-application: Job seeker to apply from Indeed Feed and Update the Job Status.
router.post(
    "/jobs/indeed-application",
    [
      [
        body("id").notEmpty(),
        body("job.jobUrl").notEmpty(),
        body("job.jobId").notEmpty(),
        body("job.jobKey").notEmpty(),
        body("job.jobTitle").notEmpty(),
        body("job.jobCompany").notEmpty(),
        body("job.jobLocation").notEmpty(),
        body("applicant.phoneNumber").notEmpty(),
        body("applicant.resume").notEmpty(),
        body("applicant.fullName").notEmpty(),
        body("applicant.firstName").notEmpty(),
        body("applicant.lastName").notEmpty(),
        body("applicant.email").notEmpty(),
        body("locale").notEmpty(),
        body("appliedOnMillis").notEmpty(),
      ],
    ],
    async (req, res) => {
      try {
        // Error Handling 1 - 400 Bad Request - When Mandatory Fields Missing
        const errors = validationResult(req);
        console.log(errors);
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
                timestamp: new Date().toISOString,
              },
            },
          });
        }
  
        // Extract job data from request body
        const { id, job, applicant, locale, appliedOnMillis } = req.body;
  
        // SQL Query - Fetch Active Jobs with Pagination
        const checkApplicantQuery = {
          text: `SELECT * FROM Candidate
                  WHERE CandidateEmail = $1`,
          values: [applicant.email],
        };
        // Execute Query
        const { candidateRows } = await db.query(checkApplicantQuery.text, checkApplicantQuery.values);
        console.log(candidateRows);
  
        if (candidateRows.length === 0) {
          const addApplicantQuery = {
            text: `
                  INSERT INTO Candidate (CandidateFullName, CandidateFirstName, CandidateLastName, CandidateEmail, CandidatePhone, CandidateResume)
                  VALUES ($1, $2, $3, $4, $5, $6, $7)
                  RETURNING CandidateFullName
              `,
            values: [applicant.fullName, applicant.firstName, applicant.lastName, applicant.email, applicant.phoneNumber, applicant.resume],
          };
  
          // Execute Query
          const { candidateRows } = await db.query(addApplicantQuery.text, addApplicantQuery.values);
  
          console.log(`Candidate ${candidateRows[0].candidatefullname} added successfully.`);
        }
  
        // SQL Query - Insert Job Application into Database
        const query = {
          text: `
                  INSERT INTO Application (ApplicationID, JobID, CandidateEmail, AppliedOn, ApplicationStatus)
                  VALUES ($1, $2, $3, $4, $5)
                  RETURNING ApplicationID
              `,
          values: [
            id,
            job.jobId,
            applicant.email,
            appliedOnMillis,
            "Application Submitted",
          ],
        };
  
        // Execute Query
        const { rows } = await db.query(query.text, query.values);
  
        res.status(201).json({
          result: {
            message: `${rows[0].applicationid} has been created`,
          },
          meta: {
            code: 201,
            name: "Created",
          },
          errors: null,
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
            message:
              "There is an error on the downstream server, please retry again later.",
            details: {
              path: "/jobs/indeed-application",
              timestamp: new Date().toISOString,
            },
          },
        });
      }
    }
  );

module.exports = router;
