/**
 * @swagger
 * /jobs/indeed.xml:
 *   get:
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

// GET /jobs/indeed.xml: Retrieves all the active jobs without pagination in XML format that aligns with Indeed XML Feed reference you can ignore the <url> field or leave it blank.
router.get("/jobs/indeed.xml", async (req, res) => {
    try {
      if (req.accepts("xml")) {
        // SQL Query - Fetch Active Jobs with Pagination
        const query = {
          text: `
                  SELECT Job.Title, Job.DatePosted, Job.JobID, Job.RequisitionID, Job.URL, Employer.CompanyName, Employer.CompanyHeadquarter, Job.City, Job.State, Job.Country, Job.PostalCode, Job.StreetAddress, Employer.CompanyEmail, Job.Description, Job.Salary, Job.Education, Job.JobType, string_agg(Category.CategoryName, ', ') AS Categories, Job.Experience, Job.ExpiryDate, Job.RemoteType FROM Job 
                  INNER JOIN Employer ON Employer.CompanyRegistrationNo = Job.CompanyRegistrationNo
                  LEFT JOIN Category ON Category.JobID = Job.JobID
                  WHERE Job.ExpiryDate > NOW()
                  GROUP BY Job.JobID, Employer.CompanyRegistrationNo
                  ORDER BY Job.JobID;
              `,
        };
  
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
                timestamp: new Date().toISOString,
              },
            },
          });
        }
  
        const xmlResponse = `<?xml version="1.0" encoding="utf-8"?><source><publisher>My System</publisher><publisherurl>http://www.mysystem.com</publisherurl><jobs>${rows
          .map(
            (job) =>
              `<job><title><![CDATA[${job.title}]]></title><date><![CDATA[${job.dateposted}]]></date><referencenumber><![CDATA[${job.jobid}]]></referencenumber><requisitionid><![CDATA[${job.requisitionid}]]></requisitionid><url><![CDATA[${job.url}]]></url><company><![CDATA[${job.companyname}]]></company><sourcename><![CDATA[${job.companyheadquarter}]]></sourcename><city><![CDATA[${job.city}]]></city><state><![CDATA[${job.state}]]></state><country><![CDATA[${job.country}]]></country><postalcode><![CDATA[${job.postalcode}]]></postalcode><streetaddress><![CDATA[${job.streetaddress}]]></streetaddress><email><![CDATA[${job.companyemail}]]></email><description><![CDATA[${job.description}]]></description><salary><![CDATA[${job.salary}]]></salary><education><![CDATA[${job.education}]]></education><jobtype><![CDATA[${job.jobtype}]]></jobtype><category><![CDATA[${job.categories}]]></category><experience><![CDATA[${job.experience}]]></experience><expirationdate><![CDATA[${job.expirydate}]]></expirationdate><remotetype><![CDATA[${job.remotetype}]]></remotetype></job>`
          )
          .join("")}</jobs></source>`;
  
        // Set Content-Type header to indicate XML response
        res.set("Content-Type", "application/xml");
  
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
              timestamp: new Date().toISOString,
            },
          },
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
          message:
            "There is an error on the downstream server, please retry again later.",
          details: {
            path: "/jobs/indeed.xml",
            timestamp: new Date().toISOString,
          },
        },
      });
    }
  });

module.exports = router;
