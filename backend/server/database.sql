CREATE DATABASE jobs;

CREATE TABLE Employer(
    CompanyRegistrationNo VARCHAR(50) PRIMARY KEY,
    CompanyName VARCHAR(100),
    CompanyEmail VARCHAR(50),
    CompanyIndustry VARCHAR(100),
    CompanyHeadquarter VARCHAR(200),
    CompanyParentOrg VARCHAR(100)
);

SELECT * FROM Employer;

INSERT INTO Employer (CompanyRegistrationNo, CompanyName, CompanyEmail, CompanyIndustry, CompanyHeadquarter, CompanyParentOrg)
VALUES ('MBB1234', 'Maybank', 'hr@maybank.com', 'Banking', 'Kuala Lumpur', 'Malayan Banking Berhad'),
('TNB1234', 'TNB', 'hr@tnb.com', 'Electricity Utility', 'Kuala Lumpur', 'Tenaga Nasional Berhad'),
('PTN1234', 'PETRONAS', 'contactmplus@petronas.com', 'Oil and Gas', 'Kuala Lumpur', 'PETRONAS Gas Berhad'),
('SDB1234', 'Sime Darby', 'hr@simedarby.com', 'Engineering and Construction', 'Selangor', 'Sime Darby Berhad'),
('TGL1234', 'Top Glove', 'hr@topglove.com', 'Glove Manufacturing', 'Selangor', 'Top Glove Corporation Berhad');

CREATE TABLE Candidate(
    CandidateFullName VARCHAR(100),
    CandidateFirstName VARCHAR(100),
    CandidateLastName VARCHAR(100),
    CandidateEmail VARCHAR(50) PRIMARY KEY,
    CandidatePhone VARCHAR(50),
    CandidateResume VARCHAR(255),
    CandidateAddress VARCHAR(255)
);

SELECT * FROM Candidate;

INSERT INTO Candidate (CandidateFullName, CandidateFirstName, CandidateLastName, CandidateEmail, CandidatePhone, CandidateResume, CandidateAddress)
VALUES ('John Michael Smith', 'John', 'Smith', 'john@gmail.com', '0123483548', 'abcd', 'Segambut'),
('Emily Rose Johnson', 'Emily', 'Johnson', 'emily@gmail.com', '013494547', 'abcd', 'Cheras'),
('David Alexander Brown', 'David', 'Brown', 'david@gmail.com', '0194673385', 'abcd', 'Georgetown'),
('Sarah Elizabeth Davis', 'Sarah', 'Davis', 'sarah@gmail.com', '0123454233', 'abcd', 'Tangkak'),
('James Patrick Wilson', 'James', 'Wilson', 'james@gmail.com', '01123678431', 'abcd', 'Seremban');

CREATE TABLE Job(
    JobID SERIAL PRIMARY KEY,
    CompanyRegistrationNo VARCHAR(50),
    RequisitionID VARCHAR(15),
    Title VARCHAR(150),
    Description VARCHAR(255),
    City VARCHAR(100),
    State VARCHAR(100),
    Country VARCHAR(100),
    PostalCode INTEGER,
    StreetAddress VARCHAR(255),
    Salary VARCHAR(100),
    Education VARCHAR(100),
    JobType VARCHAR(50),
    Experience VARCHAR(50),
    DatePosted DATE,
    ExpiryDate DATE,
    RemoteType VARCHAR(50),
    URL VARCHAR(255),
    CONSTRAINT fk_CompanyRegistrationNo FOREIGN KEY(CompanyRegistrationNo) REFERENCES Employer(CompanyRegistrationNo)
);

SELECT * FROM Job;

SELECT Job.Title, Job.DatePosted, Job.JobID, Job.RequisitionID, Job.URL, Employer.CompanyName, Employer.CompanyHeadquarter, Job.City, Job.State, Job.Country, Job.PostalCode, Job.StreetAddress, Employer.CompanyEmail, Job.Description, Job.Salary, Job.Education, Job.JobType, string_agg(Category.CategoryName, ', ') AS Categories, Job.Experience, Job.ExpiryDate, Job.RemoteType FROM Job 
INNER JOIN Employer ON Employer.CompanyRegistrationNo = Job.CompanyRegistrationNo
LEFT JOIN Category ON Category.JobID = Job.JobID
WHERE Job.ExpiryDate > NOW()
GROUP BY Job.JobID, Employer.CompanyRegistrationNo
ORDER BY Job.JobID;

INSERT INTO Job (CompanyRegistrationNo, RequisitionID, Title, Description, City, State, Country, PostalCode, StreetAddress, Salary, Education, JobType, Experience, DatePosted, ExpiryDate, RemoteType, URL)
VALUES ('TNB1234', 'ABC1', 'Business Analyst', 'Understanding business processes, identifying needs, and recommending solutions that enable the organization to achieve its objectives more effectively', 'Pudu', 'Kuala Lumpur', 'Malaysia', 53200, '1, Jalan Pudu', '4000 - 5000', 'Bachelors', 'full-time', '1 - 2 years', DATE '2024-06-01', DATE '2024-06-30', null, 'https://www.maybank.com/career/businessanalyst'),
('TNB1234', 'ABC2', 'Business Admin', 'To assist on day to day operation', 'Pudu', 'Kuala Lumpur', 'Malaysia', 53200, '1, Jalan Pudu', '4000 - 5000', 'Bachelors', 'full-time', '1 - 2 years', DATE '2024-07-01', DATE '2024-07-30', null, 'https://www.tnb.com/career/businessadmin'),
('TNB1234', 'ABC3', 'Operation Analyst', 'Monitor and cascade to respective team for operational tasks', 'Pudu', 'Kuala Lumpur', 'Malaysia', 53200, '1, Jalan Pudu', '4000 - 5000', 'Bachelors', 'full-time', '1 - 2 years', DATE '2024-07-01', DATE '2024-07-30', null, 'https://www.tnb.com/career/operationanalyst');

CREATE TABLE JobAdvertisement(
    AdvertisementID SERIAL PRIMARY KEY,
    JobID INTEGER,
    Platform VARCHAR(100),
    CONSTRAINT fk_JobID FOREIGN KEY(JobID) REFERENCES Job(JobID)
);

SELECT * FROM JobAdvertisement;

INSERT INTO JobAdvertisement (JobID, Platform)
VALUES (1, 'Indeed');

CREATE TABLE Category(
    CategoryID SERIAL PRIMARY KEY,
    JobID INTEGER,
    CategoryName VARCHAR(50),
    CONSTRAINT fk_JobID FOREIGN KEY(JobID) REFERENCES Job(JobID)
);

SELECT * FROM Category;

INSERT INTO Category (JobID, CategoryName)
VALUES (1, 'Electricity'),
(1, 'Service'), 
(2, 'Business'),
(2, 'Administrator');


CREATE TABLE Application(
    ApplicationID VARCHAR(100) PRIMARY KEY,
    JobID INTEGER,
    CandidateEmail VARCHAR(100),
    AppliedOn BIGINT,
    ApplicationStatus VARCHAR(100),
    CONSTRAINT fk_JobID FOREIGN KEY(JobID) REFERENCES Job(JobID),
    CONSTRAINT fk_CandidateEmail FOREIGN KEY(CandidateEmail) REFERENCES Candidate(CandidateEmail)
);

SELECT * FROM Application;

INSERT INTO Application (ApplicationID, JobID, CandidateEmail, AppliedOn, ApplicationStatus)
VALUES ('ABC1324', 1, 'john@gmail.com', 1721021773, 'Pending Review'),
('abc1235', 1, 'emily@gmail.com', 1720935373, 'Application Viewed');
