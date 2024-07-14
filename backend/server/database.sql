CREATE DATABASE jobs;

CREATE TABLE Employer(
    EmployerID VARCHAR(15) PRIMARY KEY,
    Name VARCHAR(100),
    Email VARCHAR(50),
    Industry VARCHAR(100),
    Headquarter VARCHAR(200),
    ParentOrg VARCHAR(100)
);

CREATE TABLE Candidate(
    CandidateID VARCHAR(15) PRIMARY KEY,
    FullName VARCHAR(100),
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    Email VARCHAR(50),
    Phone INTEGER,
    Resume VARCHAR(255),
    Address VARCHAR(200)
);

CREATE TABLE Job(
    JobID VARCHAR(15) PRIMARY KEY,
    EmployerID VARCHAR(15) FOREIGN KEY REFERENCES Employer(EmployerID),
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
    Expereince VARCHAR(50),
    DatePosted DATE,
    ExpiryDate DATE,
    RemoteType VARCHAR(50),
    URL VARCHAR(255)
);

CREATE TABLE JobAdvertisement(
    AdvertisementID VARCHAR(15) PRIMARY KEY,
    JobID VARCHAR(15) FOREIGN KEY REFERENCES Job(JobID),
    StartDate date,
    EndDate date,
    Platform VARCHAR(100)
);

CREATE TABLE Category(
    CategoryID VARCHAR(15) PRIMARY KEY,
    JobID VARCHAR(15) FOREIGN KEY REFERENCES Job(JobID),
    CategoryName VARCHAR(50)
);

CREATE TABLE Application(
    ApplicationID VARCHAR(15) PRIMARY KEY,
    JobID VARCHAR(15) FOREIGN KEY REFERENCES Job(JobID),
    CandidateID VARCHAR(15) FOREIGN KEY REFERENCES Candidate(CandidateID),
    AppliedOn INTEGER,
    Status VARCHAR(20)
);