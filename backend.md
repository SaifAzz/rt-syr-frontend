# RT-SYR Backend API Specification

This document provides a comprehensive list of all APIs required for the RT-SYR platform. Use this as a reference for backend implementation.

**Base URL:** `/api` (configurable via `VITE_API_URL` environment variable)

**Authentication:** All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

---

## 📋 Table of Contents

1. [Homepage & Public APIs](#1-homepage--public-apis)
2. [Authentication APIs](#2-authentication-apis)
3. [User Management APIs](#3-user-management-apis)
4. [Jobs APIs](#4-jobs-apis)
5. [Tenders APIs](#5-tenders-apis)
6. [Applications APIs](#6-applications-apis)
7. [Companies APIs](#7-companies-apis)
8. [Organizations APIs](#8-organizations-apis)
9. [Content Management APIs](#9-content-management-apis)
10. [Pricing APIs](#10-pricing-apis)
11. [Admin APIs](#11-admin-apis)
12. [File Upload APIs](#12-file-upload-apis)
13. [Search API](#13-search-api)

---

## 1. Homepage & Public APIs

### 1.1 Get Homepage Statistics ⭐ **PRIORITY**
**Endpoint:** `GET /api/stats`  
**Auth Required:** ❌ Public  
**Description:** Returns statistics displayed on the homepage (shown in the hero section)

**Response (200):**
```json
{
  "activeOpportunities": 500,
  "registeredUsers": 10000,
  "verifiedCompanies": 200,
  "organizations": 150
}
```

**Notes:**
- `activeOpportunities`: Total count of active jobs + active tenders
- `registeredUsers`: Total count of verified users (job seekers)
- `verifiedCompanies`: Total count of approved/verified companies
- `organizations`: Total count of approved organizations

---

## 2. Authentication APIs

### 2.1 User Signup
**Endpoint:** `POST /api/auth/signup`  
**Auth Required:** ❌ Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "full_name": "John Doe",
  "phone": "+963912345678",
  "role": "user"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully. Please verify your email.",
  "userId": "uuid",
  "email": "user@example.com"
}
```

---

### 2.2 User Login
**Endpoint:** `POST /api/auth/login`  
**Auth Required:** ❌ Public

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "email_verified": true,
    "company_id": null,
    "organization_id": null
  }
}
```

---

### 2.3 Verify Email
**Endpoint:** `POST /api/auth/verify-email`  
**Auth Required:** ❌ Public

**Request Body:**
```json
{
  "userId": "uuid",
  "code": "123456"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2.4 Resend Verification Code
**Endpoint:** `POST /api/auth/resend-verification`  
**Auth Required:** ❌ Public

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Response (200):**
```json
{
  "message": "Verification code sent successfully"
}
```

---

### 2.5 Refresh Access Token
**Endpoint:** `POST /api/auth/refresh`  
**Auth Required:** ❌ Public

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 3. User Management APIs

### 3.1 Get Current User Profile
**Endpoint:** `GET /api/profiles/me`  
**Auth Required:** ✅ Required

**Response (200):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "phone": "+963912345678",
  "avatar_url": "https://...",
  "bio": "Experienced software engineer...",
  "role": "user",
  "email_verified": true,
  "plan_status": "active",
  "plan_id": "job-single",
  "company_id": null,
  "organization_id": null,
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### 3.2 Update Current User Profile
**Endpoint:** `PATCH /api/profiles/me`  
**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "full_name": "John Updated Doe",
  "phone": "+963912345678",
  "avatar_url": "https://storage.example.com/avatars/avatar.png",
  "bio": "Updated bio..."
}
```

**Response (200):** Updated user object

---

### 3.3 Get All Users (Admin Only)
**Endpoint:** `GET /api/users`  
**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `search` (optional): Search by email, name, or phone

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "full_name": "John Doe",
      "role": "user",
      "email_verified": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 5000,
  "page": 1,
  "limit": 20
}
```

---

### 3.4 Get User by ID
**Endpoint:** `GET /api/users/:id`  
**Auth Required:** ✅ Required

**Response (200):** User object

---

### 3.5 Update User (Admin Only)
**Endpoint:** `PATCH /api/users/:id`  
**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Request Body:** Partial user object

**Response (200):** Updated user object

---

## 4. Jobs APIs

### 4.1 Get All Jobs
**Endpoint:** `GET /api/jobs`  
**Auth Required:** ❌ Public

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (`open`, `closed`)
- `category` (optional): Filter by category
- `location` (optional): Filter by location
- `search` (optional): Search query (searches title, description, company name)

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Senior Software Engineer",
      "description": "We are looking for...",
      "requirements": "5+ years of experience...",
      "company_id": "uuid",
      "location": "Damascus",
      "salary_min": 50000,
      "salary_max": 100000,
      "employment_type": "Full-time",
      "experience_level": "Senior",
      "category": "Technology",
      "status": "open",
      "created_at": "2024-01-01T00:00:00Z",
      "company": {
        "id": "uuid",
        "name": "Acme Corporation",
        "logo_url": "https://..."
      }
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

---

### 4.2 Get Job by ID
**Endpoint:** `GET /api/jobs/:id`  
**Auth Required:** ❌ Public

**Response (200):**
```json
{
  "id": "uuid",
  "title": "Senior Software Engineer",
  "description": "...",
  "requirements": "...",
  "company_id": "uuid",
  "location": "Damascus",
  "salary_min": 50000,
  "salary_max": 100000,
  "employment_type": "Full-time",
  "experience_level": "Senior",
  "category": "Technology",
  "status": "open",
  "created_at": "2024-01-01T00:00:00Z",
  "company": {
    "id": "uuid",
    "name": "Acme Corporation",
    "logo_url": "https://...",
    "location": "Damascus"
  }
}
```

---

### 4.3 Create Job
**Endpoint:** `POST /api/jobs`  
**Auth Required:** ✅ Required | **Role:** Company

**Request Body:**
```json
{
  "company_id": "uuid",
  "title": "Senior Software Engineer",
  "description": "We are looking for an experienced software engineer...",
  "requirements": "5+ years of experience, knowledge of TypeScript...",
  "location": "Damascus",
  "salary_min": 50000,
  "salary_max": 100000,
  "employment_type": "Full-time",
  "experience_level": "Senior",
  "category": "Technology",
  "status": "open"
}
```

**Response (201):** Created job object

---

### 4.4 Update Job
**Endpoint:** `PATCH /api/jobs/:id`  
**Auth Required:** ✅ Required (Company owner or Admin)

**Request Body:** Partial job object

**Response (200):** Updated job object

---

### 4.5 Delete Job
**Endpoint:** `DELETE /api/jobs/:id`  
**Auth Required:** ✅ Required (Company owner or Admin)

**Response (200):**
```json
{
  "message": "Job deleted successfully"
}
```

---

### 4.6 Get Jobs by Company
**Endpoint:** `GET /api/jobs/company/:companyId`  
**Auth Required:** ✅ Required

**Response (200):** Array of job objects

---

## 5. Tenders APIs

### 5.1 Get All Tenders
**Endpoint:** `GET /api/tenders`  
**Auth Required:** ❌ Public

**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (`open`, `closing-soon`, `closed`)
- `category` (optional): Filter by category
- `location` (optional): Filter by location
- `search` (optional): Search query

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Construction Project Tender",
      "description": "We are seeking contractors...",
      "requirements": "Must have 5+ years of experience...",
      "organization_id": "uuid",
      "company_id": null,
      "location": "Damascus",
      "deadline": "2024-12-31T23:59:59Z",
      "category": "Construction",
      "status": "open",
      "created_at": "2024-01-01T00:00:00Z",
      "organization": {
        "id": "uuid",
        "name": "ABC Construction Ltd",
        "logo_url": "https://..."
      }
    }
  ],
  "total": 75,
  "page": 1,
  "limit": 20
}
```

---

### 5.2 Get Tender by ID
**Endpoint:** `GET /api/tenders/:id`  
**Auth Required:** ❌ Public

**Response (200):** Tender object with organization/company details

---

### 5.3 Create Tender
**Endpoint:** `POST /api/tenders`  
**Auth Required:** ✅ Required | **Role:** Organization or Company

**Request Body:**
```json
{
  "organization_id": "uuid",
  "title": "Construction Project Tender",
  "description": "We are seeking contractors for a construction project...",
  "requirements": "Must have 5+ years of experience, valid license...",
  "location": "Damascus",
  "deadline": "2024-12-31T23:59:59Z",
  "category": "Construction",
  "status": "open"
}
```

**Response (201):** Created tender object

---

### 5.4 Update Tender
**Endpoint:** `PATCH /api/tenders/:id`  
**Auth Required:** ✅ Required (Organization/Company owner or Admin)

**Request Body:** Partial tender object

**Response (200):** Updated tender object

---

### 5.5 Delete Tender
**Endpoint:** `DELETE /api/tenders/:id`  
**Auth Required:** ✅ Required (Organization/Company owner or Admin)

**Response (200):**
```json
{
  "message": "Tender deleted successfully"
}
```

---

### 5.6 Get Tenders by Organization
**Endpoint:** `GET /api/tenders/organization/:organizationId`  
**Auth Required:** ✅ Required

**Response (200):** Array of tender objects

---

## 6. Applications APIs

### 6.1 Apply to Job
**Endpoint:** `POST /api/applications/jobs/:jobId/apply`  
**Auth Required:** ✅ Required | **Role:** User (Job Seeker)

**Request Body:**
```json
{
  "cover_letter": "I am writing to express my interest in this position...",
  "resume_url": "https://storage.example.com/resumes/resume.pdf"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "job_id": "uuid",
  "status": "pending",
  "cover_letter": "...",
  "resume_url": "https://...",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### 6.2 Apply to Tender
**Endpoint:** `POST /api/applications/tenders/:tenderId/apply`  
**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "cover_letter": "I am writing to express my interest in this tender...",
  "resume_url": "https://storage.example.com/proposals/proposal.pdf"
}
```

**Response (201):** Created application object

---

### 6.3 Get My Job Applications
**Endpoint:** `GET /api/applications/jobs/my`  
**Auth Required:** ✅ Required

**Response (200):** Array of application objects with job details

---

### 6.4 Get My Tender Applications
**Endpoint:** `GET /api/applications/tenders/my`  
**Auth Required:** ✅ Required

**Response (200):** Array of application objects with tender details

---

### 6.5 Get Job Applications for Company
**Endpoint:** `GET /api/applications/jobs/company/:companyId`  
**Auth Required:** ✅ Required | **Role:** Company

**Response (200):** Array of application objects with user details

---

### 6.6 Get Tender Applications for Organization
**Endpoint:** `GET /api/applications/tenders/organization/:organizationId`  
**Auth Required:** ✅ Required | **Role:** Organization

**Response (200):** Array of application objects with user details

---

### 6.7 Update Application Status
**Endpoint:** `PATCH /api/applications/jobs/:applicationId/status`  
**Endpoint:** `PATCH /api/applications/tenders/:applicationId/status`  
**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "status": "accepted"
}
```

**Status values:** `pending`, `accepted`, `rejected`, `withdrawn`

**Response (200):** Updated application object

---

### 6.8 Get Application by ID
**Endpoint:** `GET /api/applications/:id`  
**Auth Required:** ✅ Required

**Response (200):** Application object with related job/tender and user details

---

### 6.9 Delete Application
**Endpoint:** `DELETE /api/applications/:id`  
**Auth Required:** ✅ Required

**Response (200):**
```json
{
  "message": "Application deleted successfully"
}
```

---

## 7. Companies APIs

### 7.1 Get All Companies
**Endpoint:** `GET /api/companies`  
**Auth Required:** ❌ Public

**Response (200):** Array of company objects

---

### 7.2 Get Company by ID
**Endpoint:** `GET /api/companies/:id`  
**Auth Required:** ❌ Public

**Response (200):**
```json
{
  "id": "uuid",
  "name": "Acme Corporation",
  "description": "A leading technology company...",
  "website": "https://www.acme.com",
  "logo_url": "https://...",
  "location": "Damascus",
  "industry": "Technology",
  "size": "100-500 employees",
  "status": "approved",
  "user_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### 7.3 Create Company
**Endpoint:** `POST /api/companies`  
**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "name": "Acme Corporation",
  "description": "A leading technology company...",
  "website": "https://www.acme.com",
  "logo_url": "https://storage.example.com/logos/acme.png",
  "location": "Damascus",
  "industry": "Technology",
  "size": "100-500 employees"
}
```

**Response (201):** Created company object (status: `pending`)

---

### 7.4 Get My Companies
**Endpoint:** `GET /api/companies/my`  
**Auth Required:** ✅ Required

**Response (200):** Array of company objects

---

### 7.5 Update Company
**Endpoint:** `PATCH /api/companies/:id`  
**Auth Required:** ✅ Required (Company owner or Admin)

**Request Body:** Partial company object

**Response (200):** Updated company object

---

### 7.6 Delete Company
**Endpoint:** `DELETE /api/companies/:id`  
**Auth Required:** ✅ Required (Company owner or Admin)

**Response (200):**
```json
{
  "message": "Company deleted successfully"
}
```

---

### 7.7 Get Company Quota
**Endpoint:** `GET /api/companies/:id/quota`  
**Auth Required:** ✅ Required

**Response (200):**
```json
{
  "company_id": "uuid",
  "plan_id": "job-unlimited",
  "plan_name": "Unlimited Jobs",
  "job_quota": {
    "used": 5,
    "limit": -1,
    "unlimited": true
  },
  "tender_quota": {
    "used": 0,
    "limit": 0,
    "unlimited": false
  }
}
```

---

## 8. Organizations APIs

### 8.1 Get All Organizations
**Endpoint:** `GET /api/organizations`  
**Auth Required:** ❌ Public

**Response (200):** Array of organization objects

---

### 8.2 Get Organization by ID
**Endpoint:** `GET /api/organizations/:id`  
**Auth Required:** ❌ Public

**Response (200):**
```json
{
  "id": "uuid",
  "name": "ABC Construction Ltd",
  "description": "A leading construction company...",
  "website": "https://www.abcconstruction.com",
  "logo_url": "https://...",
  "location": "Damascus",
  "industry": "Construction",
  "license_number": "LIC-12345",
  "license_file_url": "https://storage.example.com/licenses/license.pdf",
  "work_sectors": ["Construction", "Infrastructure"],
  "status": "approved",
  "user_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### 8.3 Create Organization
**Endpoint:** `POST /api/organizations`  
**Auth Required:** ✅ Required

**Request Body:**
```json
{
  "name": "ABC Construction Ltd",
  "description": "A leading construction company...",
  "website": "https://www.abcconstruction.com",
  "logo_url": "https://storage.example.com/logos/abc.png",
  "location": "Damascus",
  "industry": "Construction",
  "license_number": "LIC-12345",
  "license_file_url": "https://storage.example.com/licenses/license.pdf",
  "work_sectors": ["Construction", "Infrastructure"]
}
```

**Response (201):** Created organization object (status: `pending`)

---

### 8.4 Get My Organizations
**Endpoint:** `GET /api/organizations/my`  
**Auth Required:** ✅ Required

**Response (200):** Array of organization objects

---

### 8.5 Update Organization
**Endpoint:** `PATCH /api/organizations/:id`  
**Auth Required:** ✅ Required (Organization owner or Admin)

**Request Body:** Partial organization object

**Response (200):** Updated organization object

---

### 8.6 Delete Organization
**Endpoint:** `DELETE /api/organizations/:id`  
**Auth Required:** ✅ Required (Organization owner or Admin)

**Response (200):**
```json
{
  "message": "Organization deleted successfully"
}
```

---

### 8.7 Get Organization Quota
**Endpoint:** `GET /api/organizations/:id/quota`  
**Auth Required:** ✅ Required

**Response (200):**
```json
{
  "organization_id": "uuid",
  "plan_id": "tender-unlimited",
  "plan_name": "Unlimited Tenders",
  "job_quota": {
    "used": 0,
    "limit": 0,
    "unlimited": false
  },
  "tender_quota": {
    "used": 3,
    "limit": -1,
    "unlimited": true
  }
}
```

---

## 9. Content Management APIs

### 9.1 Get All Content
**Endpoint:** `GET /api/content`  
**Auth Required:** ❌ Public

**Query Parameters:**
- `section` (optional): Filter by section (`home`, `footer`, `form`, `general`)
- `language` (optional): Filter by language (`en`, `ar`, default: `en`)

**Response (200):** Array of content objects

---

### 9.2 Get Content by Key
**Endpoint:** `GET /api/content/:key`  
**Auth Required:** ❌ Public

**Query Parameters:**
- `language` (optional): Content language (default: `en`)

**Response (200):** Content object

---

### 9.3 Create Content (Admin Only)
**Endpoint:** `POST /api/content`  
**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Request Body:**
```json
{
  "key": "home.hero.title",
  "section": "home",
  "language": "en",
  "value": "Welcome to RT-SYR Platform",
  "type": "text"
}
```

**Response (201):** Created content object

---

### 9.4 Update Content (Admin Only)
**Endpoint:** `PUT /api/content/:key`  
**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Query Parameters:**
- `language` (optional): Content language (default: `en`)

**Request Body:** Partial content object

**Response (200):** Updated content object

---

### 9.5 Delete Content (Admin Only)
**Endpoint:** `DELETE /api/content/:key`  
**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Query Parameters:**
- `language` (optional): Content language (default: `en`)

**Response (200):**
```json
{
  "message": "Content deleted successfully"
}
```

---

### 9.6 Get Footer Content
**Endpoint:** `GET /api/content/footer`  
**Auth Required:** ❌ Public

**Query Parameters:**
- `language` (optional): Content language (default: `en`)

**Response (200):**
```json
{
  "description": "RT-SYR Platform for Jobs and Tenders",
  "contactEmail": "contact@rtsyr.com",
  "contactLocation": "Damascus, Syria",
  "socialLinks": {
    "facebook": "https://facebook.com/example",
    "twitter": "https://twitter.com/example",
    "linkedin": "https://linkedin.com/company/example",
    "instagram": "https://instagram.com/example"
  },
  "platformLinks": [
    { "name": "About Us", "href": "/about" },
    { "name": "Contact", "href": "/contact" }
  ],
  "supportLinks": [
    { "name": "Help Center", "href": "/help" },
    { "name": "FAQ", "href": "/faq" }
  ],
  "copyright": "© 2024 RT-SYR. All rights reserved.",
  "hashtags": {
    "jobs": "#RTJobs",
    "tenders": "#RTTenders"
  }
}
```

---

### 9.7 Update Footer Content (Admin Only)
**Endpoint:** `PUT /api/content/footer`  
**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Query Parameters:**
- `language` (optional): Content language (default: `en`)

**Request Body:** Footer content object

**Response (200):**
```json
{
  "message": "Footer content updated successfully"
}
```

---

### 9.8 Get Form Configuration
**Endpoint:** `GET /api/content/form/:formType`  
**Auth Required:** ❌ Public

**Path Parameters:**
- `formType`: `registration`, `job`, or `tender`

**Query Parameters:**
- `language` (optional): Content language (default: `en`)

**Response (200):**
```json
{
  "formType": "registration",
  "title": "User Registration",
  "description": "Create your account to get started",
  "submitButtonText": "Sign Up",
  "fields": [
    {
      "id": "email",
      "name": "email",
      "label": "Email Address",
      "type": "email",
      "required": true,
      "placeholder": "Enter your email",
      "order": 1,
      "visible": true
    }
  ]
}
```

---

### 9.9 Update Form Configuration (Admin Only)
**Endpoint:** `PUT /api/content/form/:formType`  
**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Path Parameters:**
- `formType`: `registration`, `job`, or `tender`

**Query Parameters:**
- `language` (optional): Content language (default: `en`)

**Request Body:** Form configuration object

**Response (200):**
```json
{
  "message": "Form configuration updated successfully"
}
```

---

## 10. Pricing APIs

### 10.1 Get All Pricing Plans
**Endpoint:** `GET /api/pricing`  
**Auth Required:** ❌ Public

**Response (200):**
```json
[
  {
    "plan_id": "job-single",
    "name": "Single Job",
    "description": "Post one job",
    "price": 25,
    "currency": "USD",
    "period": "one-time",
    "plan_type": "job",
    "features": [
      "Post 1 job",
      "Unlimited applications",
      "Standard visibility"
    ],
    "active": true
  },
  {
    "plan_id": "tender-single",
    "name": "Single Tender",
    "description": "Post one tender",
    "price": 50,
    "currency": "USD",
    "period": "one-time",
    "plan_type": "tender",
    "features": [
      "Post 1 tender",
      "Unlimited applications",
      "Standard visibility"
    ],
    "active": true
  }
]
```

---

### 10.2 Get Pricing Plan by ID
**Endpoint:** `GET /api/pricing/plan/:planId`  
**Auth Required:** ❌ Public

**Response (200):** Pricing plan object

---

### 10.3 Calculate Price
**Endpoint:** `GET /api/pricing/calculate`  
**Auth Required:** ❌ Public

**Query Parameters:**
- `planId` (required): Pricing plan ID
- `quantity` (optional): Quantity (default: 1)

**Response (200):**
```json
{
  "planId": "job-single",
  "quantity": 2,
  "unitPrice": 25,
  "totalPrice": 50,
  "currency": "USD"
}
```

---

## 11. Admin APIs

### 11.1 Approve/Reject Entity
**Endpoint:** `POST /api/admin/approve`  
**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Request Body:**
```json
{
  "entityType": "organization",
  "entityId": "uuid",
  "approved": true
}
```

**Response (200):**
```json
{
  "message": "Entity approval status updated successfully",
  "entity": {
    "id": "uuid",
    "type": "organization",
    "status": "approved"
  }
}
```

---

### 11.2 Get Pending Approvals
**Endpoint:** `GET /api/admin/pending`  
**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Response (200):**
```json
{
  "companies": [
    {
      "id": "uuid",
      "name": "Acme Corporation",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "organizations": [
    {
      "id": "uuid",
      "name": "ABC Construction Ltd",
      "status": "pending",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

---

### 11.3 Get Analytics
**Endpoint:** `GET /api/admin/analytics`  
**Auth Required:** ✅ Required | **Role:** 🔴 Admin

**Response (200):**
```json
{
  "users": {
    "total": 5000,
    "verified": 4500,
    "new_this_month": 200
  },
  "jobs": {
    "total": 150,
    "active": 120,
    "closed": 30
  },
  "tenders": {
    "total": 75,
    "active": 60,
    "closed": 15
  },
  "companies": {
    "total": 200,
    "approved": 180,
    "pending": 20
  },
  "organizations": {
    "total": 150,
    "approved": 140,
    "pending": 10
  }
}
```

---

### 11.4 Manage Pricing Plans (Admin)
**Endpoints:**
- `GET /api/admin/pricing` - Get all pricing plans
- `GET /api/admin/pricing/:planId` - Get pricing plan by ID
- `POST /api/admin/pricing` - Create pricing plan
- `PATCH /api/admin/pricing/:planId` - Update pricing plan
- `DELETE /api/admin/pricing/:planId` - Delete pricing plan

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

---

### 11.5 Manage Users (Admin)
**Endpoints:**
- `GET /api/admin/users` - Get all users with pagination
- `GET /api/admin/users/:userId` - Get user by ID
- `PATCH /api/admin/users/:userId` - Update user
- `DELETE /api/admin/users/:userId` - Delete user
- `PATCH /api/admin/users/:userId/plan` - Update user plan

**Auth Required:** ✅ Required | **Role:** 🔴 Admin

---

## 12. File Upload APIs

### 12.1 Upload Resume
**Endpoint:** `POST /api/upload/resume`  
**Auth Required:** ✅ Required

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (required): PDF, DOC, DOCX file

**Response (201):**
```json
{
  "message": "Resume uploaded successfully",
  "url": "https://storage.example.com/resumes/user-id-timestamp.pdf"
}
```

---

### 12.2 Upload Logo
**Endpoint:** `POST /api/upload/logo`  
**Auth Required:** ✅ Required

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (required): PNG, JPG, JPEG image file

**Response (201):**
```json
{
  "message": "Logo uploaded successfully",
  "url": "https://storage.example.com/logos/user-id-timestamp.png"
}
```

---

### 12.3 Upload License File
**Endpoint:** `POST /api/upload/license`  
**Auth Required:** ✅ Required

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (required): PDF, image file

**Response (201):**
```json
{
  "message": "License uploaded successfully",
  "url": "https://storage.example.com/licenses/user-id-timestamp.pdf"
}
```

---

### 12.4 Upload Avatar
**Endpoint:** `POST /api/upload/avatar`  
**Auth Required:** ✅ Required

**Content-Type:** `multipart/form-data`

**Request Body:**
- `file` (required): PNG, JPG, JPEG image file

**Response (201):**
```json
{
  "message": "Avatar uploaded successfully",
  "url": "https://storage.example.com/avatars/user-id-timestamp.png"
}
```

**Note:** Static files should be served at `/api/storage/{path}`

---

## 13. Search API

### 13.1 Global Search
**Endpoint:** `GET /api/search`  
**Auth Required:** ❌ Public

**Query Parameters:**
- `q` (required): Search query string

**Response (200):**
```json
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Software Engineer",
      "description": "...",
      "company": {
        "id": "uuid",
        "name": "Acme Corp",
        "logo_url": "https://..."
      }
    }
  ],
  "tenders": [
    {
      "id": "uuid",
      "title": "Construction Project",
      "description": "...",
      "organization": {
        "id": "uuid",
        "name": "ABC Construction",
        "logo_url": "https://..."
      }
    }
  ]
}
```

---

## 📊 Data Models

### User
```typescript
{
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: 'user' | 'company' | 'organization' | 'admin';
  email_verified: boolean;
  avatar_url?: string;
  bio?: string;
  plan_status?: string;
  plan_id?: string;
  company_id?: string;
  organization_id?: string;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}
```

### Company
```typescript
{
  id: string;
  name: string;
  description: string;
  location: string;
  website?: string;
  logo_url?: string;
  industry?: string;
  size?: string;
  status: 'pending' | 'approved' | 'rejected';
  user_id: string;
  created_at: string;
  updated_at: string;
}
```

### Organization
```typescript
{
  id: string;
  name: string;
  description: string;
  location: string;
  website?: string;
  logo_url?: string;
  industry?: string;
  license_number?: string;
  license_file_url?: string;
  work_sectors?: string[];
  status: 'pending' | 'approved' | 'rejected';
  user_id: string;
  created_at: string;
  updated_at: string;
}
```

### Job
```typescript
{
  id: string;
  title: string;
  description: string;
  requirements?: string;
  company_id: string;
  location: string;
  salary_min?: number;
  salary_max?: number;
  employment_type?: string;
  experience_level?: string;
  category: string;
  status: 'open' | 'closed';
  created_at: string;
  updated_at: string;
}
```

### Tender
```typescript
{
  id: string;
  title: string;
  description: string;
  requirements?: string;
  organization_id?: string;
  company_id?: string;
  location: string;
  deadline: string; // ISO 8601
  category: string;
  status: 'open' | 'closing-soon' | 'closed';
  created_at: string;
  updated_at: string;
}
```

### Application
```typescript
{
  id: string;
  job_id?: string;
  tender_id?: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  cover_letter?: string;
  resume_url?: string;
  created_at: string;
  updated_at: string;
}
```

---

## 🔒 Security Requirements

1. **Authentication:**
   - All protected endpoints must verify JWT tokens
   - Tokens should expire after a reasonable time (e.g., 24 hours for access token, 7 days for refresh token)
   - Implement token refresh mechanism

2. **Authorization:**
   - Implement role-based access control (RBAC):
     - **Admin:** Full access to all endpoints
     - **Company:** Can manage own jobs, tenders, applications, and company profile
     - **Organization:** Can manage own tenders, applications, and organization profile, cretea jobs and tenders
     - **User (Job Seeker):** Can view jobs/tenders and create applications