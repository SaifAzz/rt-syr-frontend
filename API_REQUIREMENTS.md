# Backend API Requirements for RT-SYR Platform

This document lists all the APIs required from the backend to implement the RT-SYR platform.

**Base URL:** `/api` (configurable via `VITE_API_URL` environment variable)

**Authentication:** All protected endpoints should include JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## 1. Authentication APIs

### 1.1 Login
- **Endpoint:** `POST /api/auth/login`
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Response:**
  ```json
  {
    "user": {
      "id": "string",
      "email": "string",
      "name": "string",
      "type": "job_seeker" | "company" | "organization" | "admin",
      "emailVerified": boolean,
      "companyId": "string (optional)",
      "organizationId": "string (optional)",
      "createdAt": "ISO 8601 string",
      "updatedAt": "ISO 8601 string"
    },
    "token": "JWT token string"
  }
  ```

### 1.2 Signup
- **Endpoint:** `POST /api/auth/signup`
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string",
    "name": "string",
    "type": "job_seeker" | "company" | "organization" | "admin"
  }
  ```
- **Response:** Same as login

### 1.3 Verify Email
- **Endpoint:** `POST /api/auth/verify-email`
- **Request Body:**
  ```json
  {
    "userId": "string",
    "code": "string"
  }
  ```
- **Response:**
  ```json
  {
    "user": { /* UserRecord */ }
  }
  ```

### 1.4 Resend Verification Code
- **Endpoint:** `POST /api/auth/resend-verification`
- **Request Body:**
  ```json
  {
    "userId": "string"
  }
  ```
- **Response:**
  ```json
  {
    "success": boolean
  }
  ```

---

## 2. Users APIs

### 2.1 Get All Users
- **Endpoint:** `GET /api/users`
- **Headers:** Authorization required (Admin only)
- **Response:** `UserRecord[]`

### 2.2 Get User by ID
- **Endpoint:** `GET /api/users/:id`
- **Headers:** Authorization required
- **Response:** `UserRecord`

### 2.3 Update User
- **Endpoint:** `PUT /api/users/:id`
- **Headers:** Authorization required
- **Request Body:** `Partial<UserRecord>`
- **Response:** `UserRecord`

### 2.4 Delete User (Optional)
- **Endpoint:** `DELETE /api/users/:id`
- **Headers:** Authorization required (Admin only)
- **Response:** `{ success: boolean }`

---

## 3. Companies APIs

### 3.1 Get All Companies
- **Endpoint:** `GET /api/companies`
- **Response:** `CompanyRecord[]`

### 3.2 Get Company by ID
- **Endpoint:** `GET /api/companies/:id`
- **Response:** `CompanyRecord`

### 3.3 Create Company
- **Endpoint:** `POST /api/companies`
- **Headers:** Authorization required
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "location": "string",
    "website": "string (optional)",
    "logo": "string (optional)",
    "verified": boolean,
    "userId": "string"
  }
  ```
- **Response:** `CompanyRecord`

### 3.4 Update Company
- **Endpoint:** `PUT /api/companies/:id`
- **Headers:** Authorization required
- **Request Body:** `Partial<CompanyRecord>`
- **Response:** `CompanyRecord`

### 3.5 Delete Company (Optional)
- **Endpoint:** `DELETE /api/companies/:id`
- **Headers:** Authorization required (Admin only)
- **Response:** `{ success: boolean }`

---

## 4. Organizations APIs

### 4.1 Get All Organizations
- **Endpoint:** `GET /api/organizations`
- **Response:** `OrganizationRecord[]`

### 4.2 Get Organization by ID
- **Endpoint:** `GET /api/organizations/:id`
- **Response:** `OrganizationRecord`

### 4.3 Create Organization
- **Endpoint:** `POST /api/organizations`
- **Headers:** Authorization required
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string",
    "location": "string",
    "website": "string (optional)",
    "logo": "string (optional)",
    "verified": boolean,
    "userId": "string"
  }
  ```
- **Response:** `OrganizationRecord`

### 4.4 Update Organization
- **Endpoint:** `PUT /api/organizations/:id`
- **Headers:** Authorization required
- **Request Body:** `Partial<OrganizationRecord>`
- **Response:** `OrganizationRecord`

### 4.5 Delete Organization (Optional)
- **Endpoint:** `DELETE /api/organizations/:id`
- **Headers:** Authorization required (Admin only)
- **Response:** `{ success: boolean }`

---

## 5. Jobs APIs

### 5.1 Get All Jobs
- **Endpoint:** `GET /api/jobs?category=string&location=string&status=string`
- **Query Parameters:**
  - `category` (optional): Filter by category
  - `location` (optional): Filter by location
  - `status` (optional): Filter by status ('open' | 'closed')
- **Response:** `JobRecord[]`

### 5.2 Get Job by ID
- **Endpoint:** `GET /api/jobs/:id`
- **Response:** `JobRecord`

### 5.3 Create Job
- **Endpoint:** `POST /api/jobs`
- **Headers:** Authorization required (Company only)
- **Request Body:**
  ```json
  {
    "title": "string",
    "description": "string",
    "companyId": "string",
    "location": "string",
    "salary": "string (optional)",
    "type": "full-time" | "part-time" | "contract" | "remote",
    "category": "string",
    "status": "open" | "closed",
    "isVerified": boolean
  }
  ```
- **Response:** `JobRecord`

### 5.4 Update Job
- **Endpoint:** `PUT /api/jobs/:id`
- **Headers:** Authorization required
- **Request Body:** `Partial<JobRecord>`
- **Response:** `JobRecord`

### 5.5 Delete Job
- **Endpoint:** `DELETE /api/jobs/:id`
- **Headers:** Authorization required (Company owner or Admin)
- **Response:** `{ success: boolean }`

---

## 6. Tenders APIs

### 6.1 Get All Tenders
- **Endpoint:** `GET /api/tenders?category=string&location=string&status=string`
- **Query Parameters:**
  - `category` (optional): Filter by category
  - `location` (optional): Filter by location
  - `status` (optional): Filter by status ('open' | 'closing-soon' | 'closed')
- **Response:** `TenderRecord[]`

### 6.2 Get Tender by ID
- **Endpoint:** `GET /api/tenders/:id`
- **Response:** `TenderRecord`

### 6.3 Create Tender
- **Endpoint:** `POST /api/tenders`
- **Headers:** Authorization required (Organization or Company)
- **Request Body:**
  ```json
  {
    "title": "string",
    "description": "string",
    "organizationId": "string (optional)",
    "companyId": "string (optional)",
    "location": "string",
    "deadline": "ISO 8601 string",
    "category": "string",
    "status": "open" | "closing-soon" | "closed",
    "isVerified": boolean
  }
  ```
- **Response:** `TenderRecord`

### 6.4 Update Tender
- **Endpoint:** `PUT /api/tenders/:id`
- **Headers:** Authorization required
- **Request Body:** `Partial<TenderRecord>`
- **Response:** `TenderRecord`

### 6.5 Delete Tender
- **Endpoint:** `DELETE /api/tenders/:id`
- **Headers:** Authorization required (Organization/Company owner or Admin)
- **Response:** `{ success: boolean }`

---

## 7. Applications APIs

### 7.1 Get All Applications
- **Endpoint:** `GET /api/applications?userId=string&jobId=string&tenderId=string`
- **Query Parameters:**
  - `userId` (optional): Filter by user
  - `jobId` (optional): Filter by job
  - `tenderId` (optional): Filter by tender
- **Headers:** Authorization required
- **Response:** `ApplicationRecord[]`

### 7.2 Get Application by ID
- **Endpoint:** `GET /api/applications/:id`
- **Headers:** Authorization required
- **Response:** `ApplicationRecord`

### 7.3 Create Application
- **Endpoint:** `POST /api/applications`
- **Headers:** Authorization required
- **Request Body:**
  ```json
  {
    "jobId": "string (optional)",
    "tenderId": "string (optional)",
    "userId": "string",
    "status": "pending" | "reviewed" | "accepted" | "rejected",
    "coverLetter": "string (optional)",
    "resume": "string (optional, file URL or base64)"
  }
  ```
- **Response:** `ApplicationRecord`

### 7.4 Update Application
- **Endpoint:** `PUT /api/applications/:id`
- **Headers:** Authorization required
- **Request Body:** `Partial<ApplicationRecord>`
- **Response:** `ApplicationRecord`

### 7.5 Delete Application
- **Endpoint:** `DELETE /api/applications/:id`
- **Headers:** Authorization required
- **Response:** `{ success: boolean }`

---

## 8. Content Management APIs

### 8.1 Get All Content
- **Endpoint:** `GET /api/content?section=string&language=string`
- **Query Parameters:**
  - `section` (optional): Filter by section ('home', 'footer', 'form', 'general')
  - `language` (optional): Filter by language ('en', 'ar')
- **Response:** `ContentRecord[]`

### 8.2 Get Content by Key
- **Endpoint:** `GET /api/content/:key?language=string`
- **Query Parameters:**
  - `language` (default: 'en'): Content language
- **Response:** `ContentRecord`

### 8.3 Create Content
- **Endpoint:** `POST /api/content`
- **Headers:** Authorization required (Admin only)
- **Request Body:**
  ```json
  {
    "key": "string",
    "section": "home" | "footer" | "form" | "general",
    "language": "en" | "ar",
    "value": "string | object",
    "type": "text" | "html" | "json"
  }
  ```
- **Response:** `ContentRecord`

### 8.4 Update Content
- **Endpoint:** `PUT /api/content/:key?language=string`
- **Headers:** Authorization required (Admin only)
- **Request Body:** `Partial<ContentRecord>`
- **Response:** `ContentRecord`

### 8.5 Delete Content
- **Endpoint:** `DELETE /api/content/:key?language=string`
- **Headers:** Authorization required (Admin only)
- **Response:** `{ success: boolean }`

### 8.6 Get Footer Content
- **Endpoint:** `GET /api/content/footer?language=string`
- **Query Parameters:**
  - `language` (default: 'en')
- **Response:**
  ```json
  {
    "description": "string",
    "contactEmail": "string",
    "contactLocation": "string",
    "socialLinks": {
      "facebook": "string (optional)",
      "twitter": "string (optional)",
      "linkedin": "string (optional)",
      "instagram": "string (optional)"
    },
    "platformLinks": [
      { "name": "string", "href": "string" }
    ],
    "supportLinks": [
      { "name": "string", "href": "string" }
    ],
    "copyright": "string",
    "hashtags": {
      "jobs": "string",
      "tenders": "string"
    }
  }
  ```

### 8.7 Update Footer Content
- **Endpoint:** `PUT /api/content/footer?language=string`
- **Headers:** Authorization required (Admin only)
- **Request Body:** FooterContent object
- **Response:** FooterContent object

### 8.8 Get Form Configuration
- **Endpoint:** `GET /api/content/form/:formType?language=string`
- **Path Parameters:**
  - `formType`: 'registration' | 'job' | 'tender'
- **Query Parameters:**
  - `language` (default: 'en')
- **Response:**
  ```json
  {
    "formType": "registration" | "job" | "tender",
    "title": "string",
    "description": "string",
    "submitButtonText": "string",
    "fields": [
      {
        "id": "string",
        "name": "string",
        "label": "string",
        "type": "text" | "email" | "password" | "select" | "textarea" | "date" | "number" | "file",
        "required": boolean,
        "placeholder": "string (optional)",
        "options": ["string"] (optional, for select type),
        "validation": {
          "min": number (optional),
          "max": number (optional),
          "pattern": "string (optional)",
          "accept": "string (optional, for file type)"
        },
        "order": number,
        "visible": boolean
      }
    ]
  }
  ```

### 8.9 Update Form Configuration
- **Endpoint:** `PUT /api/content/form/:formType?language=string`
- **Headers:** Authorization required (Admin only)
- **Request Body:** FormConfig object
- **Response:** FormConfig object

---

## 9. Data Models

### UserRecord
```typescript
{
  id: string;
  email: string;
  name: string;
  type: 'job_seeker' | 'company' | 'organization' | 'admin';
  emailVerified: boolean;
  passwordHash: string;
  companyId?: string;
  organizationId?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### CompanyRecord
```typescript
{
  id: string;
  name: string;
  description: string;
  location: string;
  website?: string;
  logo?: string;
  verified: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
```

### OrganizationRecord
```typescript
{
  id: string;
  name: string;
  description: string;
  location: string;
  website?: string;
  logo?: string;
  verified: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}
```

### JobRecord
```typescript
{
  id: string;
  title: string;
  description: string;
  companyId: string;
  location: string;
  salary?: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
  category: string;
  status: 'open' | 'closed';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### TenderRecord
```typescript
{
  id: string;
  title: string;
  description: string;
  organizationId?: string;
  companyId?: string;
  location: string;
  deadline: string; // ISO 8601
  category: string;
  status: 'open' | 'closing-soon' | 'closed';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### ApplicationRecord
```typescript
{
  id: string;
  jobId?: string;
  tenderId?: string;
  userId: string;
  status: 'pending' | 'reviewed' | 'accepted' | 'rejected';
  coverLetter?: string;
  resume?: string; // File URL or base64
  createdAt: string;
  updatedAt: string;
}
```

### ContentRecord
```typescript
{
  id: string;
  key: string;
  section: 'home' | 'footer' | 'form' | 'general';
  language: 'en' | 'ar';
  value: string | object;
  type: 'text' | 'html' | 'json';
  createdAt: string;
  updatedAt: string;
}
```

---

## 10. Error Handling

All APIs should return appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

Error response format:
```json
{
  "message": "Error description",
  "status": 400,
  "errors": {
    "field": ["Error message"]
  }
}
```

---

## 11. Additional Requirements

### 11.1 File Upload
If file uploads are needed (for resumes, logos, etc.), consider:
- **Endpoint:** `POST /api/upload`
- **Content-Type:** `multipart/form-data`
- **Response:** `{ url: "string" }`

### 11.2 Pagination (Optional but Recommended)
For list endpoints, consider adding pagination:
- Query parameters: `?page=number&limit=number`
- Response should include:
  ```json
  {
    "data": [...],
    "pagination": {
      "page": number,
      "limit": number,
      "total": number,
      "totalPages": number
    }
  }
  ```

### 11.3 Search (Optional but Recommended)
For search functionality:
- Query parameter: `?search=string`
- Should search across relevant fields (title, description, etc.)

---

## 12. Security Considerations

1. **Authentication:** All protected endpoints must verify JWT tokens
2. **Authorization:** Implement role-based access control:
   - Admin: Full access
   - Company: Can manage own jobs, tenders, and applications
   - Organization: Can manage own tenders and applications
   - Job Seeker: Can view jobs/tenders and create applications
3. **Input Validation:** Validate all input data
4. **Rate Limiting:** Implement rate limiting for authentication endpoints
5. **CORS:** Configure CORS properly for frontend domain
6. **Password Hashing:** Use secure password hashing (bcrypt, argon2, etc.)
7. **SQL Injection:** Use parameterized queries
8. **XSS Protection:** Sanitize user inputs

---

## Summary

**Total Endpoints Required: ~45-50**

- Authentication: 4 endpoints
- Users: 3-4 endpoints
- Companies: 4-5 endpoints
- Organizations: 4-5 endpoints
- Jobs: 5 endpoints
- Tenders: 5 endpoints
- Applications: 5 endpoints
- Content Management: 9 endpoints
- File Upload: 1 endpoint (optional)

All endpoints should support:
- Proper HTTP methods (GET, POST, PUT, DELETE)
- Authentication via JWT tokens
- Error handling with appropriate status codes
- Input validation
- Response in JSON format

