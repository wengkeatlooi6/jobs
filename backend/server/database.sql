CREATE DATABASE jobs;

CREATE TABLE Employer(
    EmployerID SERIAL PRIMARY KEY,
    Name VARCHAR(100),
    Email VARCHAR(50),
    Industry VARCHAR(100),
    Headquarter VARCHAR(200),
    ParentOrg VARCHAR(100)
);

SELECT * FROM Employer;

INSERT INTO Employer (Name, Email, Industry, Headquarter, ParentOrg)
VALUES ('Maybank', 'hr@maybank.com', 'Banking', 'Kuala Lumpur', 'Malayan Banking Berhad'),
('TNB', 'hr@tnb.com', 'Electricity Utility', 'Kuala Lumpur', 'Tenaga Nasional Berhad'),
('PETRONAS', 'contactmplus@petronas.com', 'Oil and Gas', 'Kuala Lumpur', 'PETRONAS Gas Berhad'),
('Sime Darby', 'hr@simedarby.com', 'Engineering and Construction', 'Selangor', 'Sime Darby Berhad'),
('Top Glove', 'hr@topglove.com', 'Glove Manufacturing', 'Selangor', 'Top Glove Corporation Berhad');

CREATE TABLE Candidate(
    CandidateID SERIAL PRIMARY KEY,
    FullName VARCHAR(100),
    FirstName VARCHAR(100),
    LastName VARCHAR(100),
    Email VARCHAR(50),
    Phone INTEGER,
    Resume VARCHAR(255),
    City VARCHAR(100),
    State VARCHAR(100),
    Country VARCHAR(100),
    PostalCode INTEGER,
    StreetAddress VARCHAR(255)
);

SELECT * FROM Candidate;

INSERT INTO Candidate (FullName, FirstName, LastName, Email, Phone, Resume, City, State, Country, PostalCode, StreetAddress)
VALUES ('John Michael Smith', 'John', 'Smith', 'john@gmail.com', 0123483548, 'abcd', 'Segambut', 'Kuala Lumpur', 52200, 'No. 1, Jalan 3'),
('Emily Rose Johnson', 'Emily', 'Johnson', 'emily@gmail.com', 013494547, 'abcd', 'Cheras', 'Selangor', 43200, 'No. 13, Jalan Situ'),
('David Alexander Brown', 'David', 'Brown', 'david@gmail.com', 0194673385, 'abcd', 'Georgetown', 'Penang', 14400, 'No. 12, Jalan Sini'),
('Sarah Elizabeth Davis', 'Sarah', 'Davis', 'sarah@gmail.com', 0123454233, 'abcd', 'Tangkak', 'Johor', 83420, 'No. 24, Jalan Atas'),
('James Patrick Wilson', 'James', 'Wilson', 'james@gmail.com', 01123678431, 'abcd', 'Seremban', 'Negeri Sembilan', 73492, 'No. 8, Jalan Bawah');

CREATE TABLE Job(
    JobID SERIAL PRIMARY KEY,
    EmployerID INTEGER FOREIGN KEY REFERENCES Employer(EmployerID),
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
    URL VARCHAR(255)
);

SELECT * FROM Job;

INSERT INTO Job (EmployerID, RequisitionID, Title, Description, City, State, Country, PostalCode, StreetAddress, Salary, Education, JobType, Experience, DatePosted, ExpiryDate, RemoteType, URL)
VALUES (1, "ABC1", "Business Analyst", "Understanding business processes, identifying needs, and recommending solutions that enable the organization to achieve its objectives more effectively", "Pudu", "Kuala Lumpur", "Malaysia", 53200, "1, Jalan Pudu", "4000 - 5000", "Bachelors", "full-time", 2024-06-01, 2024-06-30, null, "https://www.maybank.com/career/businessanalyst");

CREATE TABLE JobAdvertisement(
    AdvertisementID SERIAL PRIMARY KEY,
    JobID INTEGER FOREIGN KEY REFERENCES Job(JobID),
    Platform VARCHAR(100)
);

SELECT * FROM JobAdvertisement;

INSERT INTO JobAdvertisement (JobID, Platform)
VALUES (1, "Indeed");

CREATE TABLE Category(
    CategoryID SERIAL PRIMARY KEY,
    JobID INTEGER FOREIGN KEY REFERENCES Job(JobID),
    CategoryName VARCHAR(50)
);

SELECT * FROM Category;

INSERT INTO Category (JobID, CategoryName)
VALUES (1, "Banking"),
(1, "Financial"),
(1, "Insurance");

CREATE TABLE Application(
    ApplicationID SERIAL PRIMARY KEY,
    JobID INTEGER FOREIGN KEY REFERENCES Job(JobID),
    CandidateID INTEGER FOREIGN KEY REFERENCES Candidate(CandidateID),
    AppliedOn INTEGER,
    Status VARCHAR(20)
);

SELECT * FROM Application;

INSERT INTO JobAdvertisement (JobID, CandidateID, AppliedOn, Status)
VALUES (1, 1, 1721021773, "Pending Review"),
(1, 2, 1720935373, "Application Viewed");
