/**
* @swagger
* /jobs/indeed.xml:
*   get:
*     tags:
*       - Jobs
*     operationId: ''
*     parameters: []
*     responses:
*       '200':
*         description: Success
*         content:
*           application/xml:
*             schema:
*               type: object
*               xml:
*                 name: source
*               properties:
*                 publisher:
*                   type: string
*                   description: publisher
*                   example: My System
*                 publisherurl:
*                   type: string
*                   description: publisherurl
*                   example: http://www.mysystem.com
*                 jobs:
*                   type: object
*                   description: jobs
*                   properties:
*                     job:
*                       type: object
*                       description: job
*                       properties:
*                         title:
*                           type: string
*                           description: title
*                           example: Business Analyst
*                         date:
*                           type: string
*                           description: date
*                           example: '2024-06-01'
*                         referencenumber:
*                           type: string
*                           description: referencenumber
*                           example: '1'
*                         requisitionid:
*                           type: string
*                           description: requisitionid
*                           example: ABC1
*                         url:
*                           type: string
*                           description: url
*                           example: https://www.tnb.com/career/businessanalyst
*                         company:
*                           type: string
*                           description: company
*                           example: TNB
*                         sourcename:
*                           type: string
*                           description: sourcename
*                           example: Tenaga Nasional Berhad
*                         city:
*                           type: string
*                           description: city
*                           example: Pudu
*                         state:
*                           type: string
*                           description: state
*                           example: Kuala Lumpur
*                         country:
*                           type: string
*                           description: country
*                           example: Malaysia
*                         postalcode:
*                           type: string
*                           description: postalcode
*                           example: '53200'
*                         streetaddress:
*                           type: string
*                           description: streetaddress
*                           example: 1, Jalan Pudu
*                         email:
*                           type: string
*                           description: email
*                           example: hr@tnb.com
*                         description:
*                           type: string
*                           description: description
*                           example: Understanding business processes, identifying needs, and recommending solutions that enable the organization to achieve its objectives more effectively
*                         salary:
*                           type: string
*                           description: salary
*                           example: 4000 - 5000
*                         education:
*                           type: string
*                           description: education
*                           example: Bachelors
*                         jobtype:
*                           type: string
*                           description: jobtype
*                           example: full-time
*                         category:
*                           type: string
*                           description: category
*                           example: '[Electricity, Service]'
*                         experience:
*                           type: string
*                           description: experience
*                           example: 1 - 2 years
*                         expirationdate:
*                           type: string
*                           description: expirationdate
*                           example: '2024-06-30'
*                         remotetype:
*                           type: string
*                           description: remotetype
*                           example: 'null'
*       '404':
*         description: No Application Found
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 result:
*                   type: object
*                   description: result
*                   example: null
*                 meta:
*                   type: object
*                   description: meta
*                   example: null
*                 errors:
*                   type: object
*                   description: errors
*                   example:
*                     code: 404
*                     name: Not Found
*                     message: No Active Jobs.
*                     details:
*                       path: /jobs/indeed.xml
*                       timestamp: 2024-07-19T11:21:21+0000
*       '500':
*         description: Internal Server Error
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 result:
*                   type: object
*                   description: result
*                   example: null
*                 meta:
*                   type: object
*                   description: meta
*                   example: null
*                 errors:
*                   type: object
*                   description: errors
*                   example:
*                     code: 500
*                     name: Internal Server Error
*                     message: There is an error on the downstream server, please retry again later.
*                     details:
*                       path: /jobs/indeed.xml
*                       timestamp: 2024-07-19T11:21:21+0000
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
