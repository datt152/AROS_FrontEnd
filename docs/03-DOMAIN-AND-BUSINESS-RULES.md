# Domain and Business Rules

## Purpose

This document records frontend-relevant business concepts and invariants. Backend authorization and validation remain authoritative.

## Domain model

Core concepts:

```text
User
Teacher
Student
Classroom
Subject
Question
QuestionOption
Exam
ExamQuestion
ExamSession / Submission
Result
OMR
```

## Relationships

Conceptual relationships:

```text
Teacher
 ├── owns/manages Classrooms
 ├── manages Subjects
 ├── manages Question Bank
 ├── creates Exams
 └── views Results / OMR data

Classroom
 └── contains Students

Subject
 └── is associated with teaching/exam context

Question
 └── has QuestionOptions

Exam
 ├── belongs to teaching context
 ├── contains ExamQuestions
 └── may use randomized question/answer ordering

Student
 └── participates in ExamSession / Submission

Submission
 └── produces Result
```

## Role rules

Do not assume a user can access another user's teaching data.

The frontend must not treat hidden UI as a security boundary.

Authorization is enforced by Spring Boot.

Frontend role checks are for UX and route protection only.

## Exam-taking rules

The exact rules must follow backend contracts, but the frontend should be designed around:

- Exam availability
- Exam start
- Exam session state
- Selected answers
- Question navigation
- Submission
- Result availability

Do not calculate authoritative scores in the frontend unless explicitly required for UI-only preview. The backend is authoritative for final grading.

## OMR rules

OMR processing is a domain capability, not a generic image-upload feature.

Web may provide:
- Image/file selection
- Upload
- Processing status
- Result preview

The actual recognition/grading algorithm belongs to the backend/OMR processing system.

## Data isolation

Frontend queries must always use the authenticated user's permitted scope as defined by backend APIs.

Never implement client-side filtering as a substitute for backend authorization.

## Business-rule change policy

If a business rule changes:
1. Update this document.
2. Update relevant types/schemas.
3. Update affected feature behavior.
4. Update tests.
5. Update AI-agent instructions if the workflow changes.
