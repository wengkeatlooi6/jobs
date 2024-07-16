# Integrations Engineer Assessment (mid level)

This assessment is intended to help us measure if your skills are suitable for an integrations engineer role, you will be building an API and integrate with a 3rd party system.

We expect your solution to be built with Nodejs JS/TS and your API to use your framework of choice. 

Note: Please read the entire assessment before you start designing your solution.


## Part 1: Design your jobs database
#### Objective: Design a postgres db with tables of your choice to store the following

1. Jobs
2. Job Adverts
2. Job Applications
3. Candidates


## Part 2: Build a Jobs API integration with Indeed
####  Objective: Create a jobs API and an xml feed to be consumed by indeed

#### You need to implement the following endpoints:
- POST `/jobs`: Create a new job posting with an expiry_date set by default for 30 days.

- GET `/jobs`: Retrieves all the active (none-expired) jobs with pagination

- GET `/jobs/indeed.xml` Retrieves all the active jobs without pagination in XML format that aligns with [Indeed XML Feed reference](https://docs.indeed.com/indeed-apply/xml-feed) you can ignore the `<url>` field or leave it blank. 

Ensure that the data exchange format is JSON except for the endpoint `/jobs/indeed.xml`

Document your API with the openAPI spec, most API frameworks have a plugin or extension to integrate a generated UI such as swagger.

Implement error handling for common API issues (e.g. not found, forbidden, network issues, etc) as you see fit.

For your JSON endpoint ensure the response follows the following interface

```ts
interface API_RESPONSE  {
  result: any
  meta: any
  errors: Array<{
    code: number;
    name: string;
    message: string;
    details: any
  }> // you may ignore the error structure if you're using a validation library like typbox, zod, joi, etc but if you manage to transform the default validation errors that would be a plus ;) 
}
```


## Part 3: Handle incoming job applications from Indeed
####  Objective: Create a jobs API and an xml feed to be consumed by indeed

Indeed has this [job application testing tool](https://integration.apply.indeed.com/xml-configuration-test) that helps developers build their own indeed integration for handling incoming candidates.

You are expected to build an endpoint that can handle incoming job applications and candidates from this tool and adhere to the requirements from Indeed based on their [Application delivery reference](https://docs.indeed.com/indeed-apply/application-delivery)

Hint: to expose your API endpoint to indeed, you can use any tunneling software to expose an `http` port.

We can recommend that you use [ngrok](https://ngrok.com/) you can sign up for a free account if you like to have a stable reserved free subdomain and you can use their local Web Interface to help you log and debug incoming requests

Another option would be a VSCode port forwarding


## Part 4: Testing (Optional)
Please write integration / Unit tests for your endpoints.
You may use the test runner of choice, hint: Vitest is easy to setup.


# Proposed Solution
## Part 1: Jobs Database Design
![alt text](https://github.com/wengkeatlooi6/jobs/blob/main/ERD.png?raw=true)

# Part 2 & 3: Jobs API Integration Flow
#### Flow Diagram
![alt text](https://github.com/wengkeatlooi6/jobs/blob/main/FlowDiagram.png?raw=true)

#### Documentation (Swagger)
http://localhost:5000/api-docs/ (Local Host!)