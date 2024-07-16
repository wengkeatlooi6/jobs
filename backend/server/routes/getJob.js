/**
 * @swagger
 * /jobs:
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

// GET /jobs: Retrieves all the active (none-expired) jobs with pagination.
router.get("/jobs", async (req, res) => {
    try {
      // Pagination Parameters
      const page = parseInt(req.query.page) || 1; // Default Page 1 if no parameter supplied
      const pageSize = parseInt(req.query.pageSize) || 10; // Default 10 items if no parameter supplied
  
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
              timestamp: new Date().toISOString,
            },
          },
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
        values: [pageSize, offset],
      };
  
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
              timestamp: new Date().toISOString,
            },
          },
        });
      }
  
      // SQL Query - Count Total Number of Active Jobs
      const countQuery = {
        text: `
                  SELECT COUNT(*) FROM Job
                  WHERE ExpiryDate > NOW()
              `,
      };
  
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
          totalPages: totalPages,
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
  });

module.exports = router;
