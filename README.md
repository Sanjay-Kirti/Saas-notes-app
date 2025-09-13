# Multi-Tenant SaaS Notes Application

A production-ready multi-tenant notes application built with Next.js 14, TypeScript, PostgreSQL, and Prisma ORM.

## Features

- 🔐 JWT-based authentication
- 🏢 Multi-tenant architecture with strict data isolation
- 📝 Full CRUD operations for notes
- 💳 Tiered pricing (Free/Pro plans)
- 🎨 Modern UI with Tailwind CSS
- 🚀 Ready for Vercel deployment

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Supabase/Neon compatible)
- **ORM**: Prisma
- **Authentication**: JWT
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (local or cloud)
- npm or yarn

### Installation

1. Clone the repository:
```bash
cd saas-notes-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/saas_notes_db"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

4. Set up the database:
```bash
npm run db:push
npm run db:generate
```

5. Seed the database with test data:
```bash
npm run seed
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Test Accounts

All test accounts use password: `password`

### Acme Corporation
- **Admin**: admin@acme.test (can upgrade plan)
- **Member**: user@acme.test

### Globex Corporation
- **Admin**: admin@globex.test (can upgrade plan)
- **Member**: user@globex.test

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password

### Notes
- `GET /api/notes` - List all notes for tenant
- `POST /api/notes` - Create new note (Free: max 3 notes)
- `GET /api/notes/[id]` - Get specific note
- `PUT /api/notes/[id]` - Update note
- `DELETE /api/notes/[id]` - Delete note

### Tenant Management
- `POST /api/tenants/[slug]/upgrade` - Upgrade to Pro (admin only)

### Health Check
- `GET /api/health` - Returns `{ "status": "ok" }`

## Database Schema

The application uses a shared schema approach with tenant isolation:

- **Tenant**: Organization/company
- **User**: Individual users within a tenant
- **Note**: Notes created by users

All queries are automatically filtered by `tenantId` to ensure data isolation.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `DATABASE_URL` (use Supabase, Neon, or other PostgreSQL provider)
   - `JWT_SECRET` (generate a secure random string)
   - `NEXT_PUBLIC_API_URL` (your Vercel URL)
4. Deploy!

### Database Setup for Production

For production, use a managed PostgreSQL service:
- **Supabase**: Free tier available, great for development
- **Neon**: Serverless PostgreSQL, scales to zero
- **PlanetScale**: MySQL-compatible, serverless

## Security Features

- JWT tokens with expiration
- Password hashing with bcrypt
- Tenant isolation at database level
- Role-based access control (Admin/Member)
- Input validation on all endpoints

## Plan Limits

### Free Plan
- Maximum 3 notes
- All CRUD operations
- Multi-user support

### Pro Plan
- Unlimited notes
- All Free features
- Priority support (future feature)

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run seed` - Seed database with test data
- `npm run db:push` - Push schema to database
- `npm run db:migrate` - Run migrations
- `npm run db:generate` - Generate Prisma client

## Testing Checklist

✅ Health endpoint returns 200  
✅ All 4 test accounts can login  
✅ Users see only their tenant's notes  
✅ Members cannot access upgrade endpoint  
✅ Free plan enforces 3-note limit  
✅ After upgrade, note limit is removed  
✅ All CRUD operations work  
✅ Frontend is accessible and functional  

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
