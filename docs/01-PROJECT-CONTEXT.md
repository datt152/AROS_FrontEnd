# Project Context

## Project

Graduation project: online multiple-choice examination system with OMR support.

## Backend

- Java
- Spring Boot
- REST API
- PostgreSQL
- Swagger/OpenAPI

## Frontend

### Web
- React
- TypeScript

### Future Mobile
- React Native
- Mobile supports both Teacher and Student roles.
- Mobile intentionally exposes only important/high-value functions rather than the full Web feature set.

## Main business capabilities

- Account management
- Classroom management
- Student management
- Subject management
- Question bank
- Exam creation and management
- Question/answer randomization
- Exam organization
- Student exam-taking
- Automatic/manual grading as supported by backend
- OMR processing
- Result viewing
- Per-teacher data isolation

## Primary frontend goals

- Easy to understand for a student developer
- Feature-oriented organization
- Strong TypeScript safety
- Clear server/client/UI state separation
- Good API management
- Reusable business logic for future Mobile
- Avoid unnecessary global state
- Avoid premature abstraction
- Maintain a path toward production-scale evolution

## Roles

### Teacher

Teacher is the primary management role and owns/manages their teaching data according to backend authorization.

Typical capabilities:
- Manage classrooms
- Manage students
- Manage subjects
- Manage question bank
- Create/manage exams
- Organize exams
- Upload/process OMR
- View results

### Student

Student consumes exams and results.

Typical capabilities:
- View available exams
- Take exams
- Submit answers
- View results/history

Exact authorization is always determined by backend API behavior and documented business rules.

## Platform principle

Web and Mobile are applications/platforms.

Teacher and Student are roles.

Business features are domains such as:
- classroom
- student
- subject
- question-bank
- exam
- omr
- result
- auth

Do not organize the entire architecture around roles.
