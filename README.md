# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- React Router (routing)
- TanStack Query (data fetching)
- React i18next (internationalization)
- Lovable Cloud (database)

## Features

### Authentication System
- **Login/Signup Pages**: Separate authentication flows for job seekers, companies, and organizations
- **Email Verification**: Secure email verification with code-based system
- **Protected Routes**: Route protection based on authentication status and user type
- **User Management**: Support for multiple user types (job seeker, company, organization, admin)

### Internationalization (i18n)
- **Bilingual Support**: Full English and Arabic language support
- **RTL Support**: Right-to-left layout for Arabic language
- **Language Toggle**: Easy language switching via navbar
- **Dynamic Content**: All UI text is translatable

### Dashboards
- **User Dashboard**: For job seekers to manage applications and saved jobs
- **Company Dashboard**: For companies to manage job postings and applications
- **Admin Dashboard**: For administrators to manage all platform entities

### Database Integration
- **Lovable Cloud**: Integrated with Lovable Cloud for data persistence
- **API Layer**: Comprehensive API functions for all entities (users, jobs, tenders, applications)
- **Type Safety**: Full TypeScript support for database records

See [DATABASE_SETUP.md](./DATABASE_SETUP.md) for detailed database setup instructions.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
