/**
 * @swagger
 * /jobs:
 *   post:
 *     summary: Returns a list of users
 *     description: Get all users from the database
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   username:
 *                     type: string
 */
const express = require('express');
const router = express.Router();
const db = require("../db");
const { body, validationResult } = require("express-validator");

// POST /jobs: Create a new job posting with an expiry_date set by default for 30 days.
router.post(
    "/jobs",
    [
      [
        body("CompanyRegistrationNo").notEmpty(),
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
                timestamp: new Date().toISOString,
              },
            },
          });
        }
  
        // Extract job data from request body
        const {
          CompanyRegistrationNo,
          RequisitionID,
          Title,
          Description,
          City,
          State,
          Country,
          PostalCode,
          StreetAddress,
          Salary,
          Education,
          JobType,
          Experience,
          RemoteType,
          URL,
        } = req.body;
  
        // Calculate Today Date and Expiry Date (30 days later)
        const todayDate = new Date();
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);
  
        // SQL Query - Insert Job into Database
        const query = {
          text: `
                  INSERT INTO Job (CompanyRegistrationNo, RequisitionID, Title, Description, City, State, Country, PostalCode, StreetAddress, Salary, Education, JobType, Experience, DatePosted, ExpiryDate, RemoteType, URL)
                  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
                  RETURNING Title, ExpiryDate
              `,
          values: [
            CompanyRegistrationNo,
            RequisitionID,
            Title,
            Description,
            City,
            State,
            Country,
            PostalCode,
            StreetAddress,
            Salary,
            Education,
            JobType,
            Experience,
            todayDate,
            expiryDate,
            RemoteType,
            URL,
          ],
        };
  
        // Execute Query
        const { rows } = await db.query(query.text, query.values);
  
        res.status(201).json({
          result: {
            message: `${rows[0].title} has been created`,
            expiryDate: rows[0].expirydate,
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
              path: "/jobs",
              timestamp: new Date().toISOString,
            },
          },
        });
      }
    }
  );

module.exports = router;
