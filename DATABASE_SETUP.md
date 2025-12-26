# Database Setup Guide

This application uses Lovable Cloud for database storage. Follow these steps to set up your database.

## Database Schema

### Users Table
- `id` (string, primary key)
- `email` (string, unique, required)
- `name` (string, required)
- `type` (enum: 'job_seeker', 'company', 'organization', 'admin', required)
- `emailVerified` (boolean, default: false)
- `passwordHash` (string, required)
- `companyId` (string, optional, foreign key to companies)
- `organizationId` (string, optional, foreign key to organizations)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Companies Table
- `id` (string, primary key)
- `name` (string, required)
- `description` (text)
- `location` (string)
- `website` (string, optional)
- `logo` (string, optional, URL)
- `verified` (boolean, default: false)
- `userId` (string, required, foreign key to users)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Organizations Table
- `id` (string, primary key)
- `name` (string, required)
- `description` (text)
- `location` (string)
- `website` (string, optional)
- `logo` (string, optional, URL)
- `verified` (boolean, default: false)
- `userId` (string, required, foreign key to users)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Jobs Table
- `id` (string, primary key)
- `title` (string, required)
- `description` (text, required)
- `companyId` (string, required, foreign key to companies)
- `location` (string, required)
- `salary` (string, optional)
- `type` (enum: 'full-time', 'part-time', 'contract', 'remote', required)
- `category` (string, required)
- `status` (enum: 'open', 'closed', default: 'open')
- `isVerified` (boolean, default: false)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Tenders Table
- `id` (string, primary key)
- `title` (string, required)
- `description` (text, required)
- `organizationId` (string, required, foreign key to organizations)
- `location` (string, required)
- `deadline` (string, required, ISO date)
- `category` (string, required)
- `status` (enum: 'open', 'closing-soon', 'closed', default: 'open')
- `isVerified` (boolean, default: false)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Applications Table
- `id` (string, primary key)
- `jobId` (string, optional, foreign key to jobs)
- `tenderId` (string, optional, foreign key to tenders)
- `userId` (string, required, foreign key to users)
- `status` (enum: 'pending', 'reviewed', 'accepted', 'rejected', default: 'pending')
- `coverLetter` (text, optional)
- `resume` (string, optional, URL)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

## Setting Up Lovable Cloud

1. **Enable Lovable Cloud in your project**
   - Go to your Lovable project settings
   - Navigate to "Database" or "Cloud" section
   - Enable the database feature

2. **Create the tables**
   - Use the Lovable Cloud interface to create tables matching the schema above
   - Set up proper relationships and foreign keys
   - Configure indexes on frequently queried fields (email, userId, companyId, etc.)

3. **Configure API endpoints**
   - The application expects API endpoints at `/api/*`
   - Set up the following endpoints:
     - `POST /api/auth/login`
     - `POST /api/auth/signup`
     - `POST /api/auth/verify-email`
     - `POST /api/auth/resend-verification`
     - `GET /api/users`
     - `GET /api/users/:id`
     - `PUT /api/users/:id`
     - `GET /api/companies`
     - `GET /api/companies/:id`
     - `POST /api/companies`
     - `PUT /api/companies/:id`
     - `GET /api/organizations`
     - `GET /api/organizations/:id`
     - `POST /api/organizations`
     - `PUT /api/organizations/:id`
     - `GET /api/jobs`
     - `GET /api/jobs/:id`
     - `POST /api/jobs`
     - `PUT /api/jobs/:id`
     - `DELETE /api/jobs/:id`
     - `GET /api/tenders`
     - `GET /api/tenders/:id`
     - `POST /api/tenders`
     - `PUT /api/tenders/:id`
     - `DELETE /api/tenders/:id`
     - `GET /api/applications`
     - `GET /api/applications/:id`
     - `POST /api/applications`
     - `PUT /api/applications/:id`
     - `DELETE /api/applications/:id`

4. **Environment Variables**
   - Set `VITE_API_URL` in your `.env` file if your API is hosted separately
   - Default is `/api` which assumes same-origin requests

## Authentication Flow

1. User signs up → Creates user record with `emailVerified: false`
2. System sends verification email with code
3. User enters code → Updates user record with `emailVerified: true`
4. User can now access protected routes

## Security Notes

- Passwords should be hashed using bcrypt or similar before storage
- Implement rate limiting on authentication endpoints
- Use JWT tokens for session management (not implemented in current mock)
- Validate email format and enforce strong passwords
- Implement CSRF protection for state-changing operations



