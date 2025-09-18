# Vidto

A video gallery where users can create new videos, list videos, filter and search for them.

## Tech Stack

**Frontend:** Next.js App Router, React 19, TanStack Query  
**Backend:** tRPC, Drizzle ORM with SQLite  
**Testing:** Vitest with Testing Library  
**Styling:** Tailwind CSS with Radix UI components  
**Language:** TypeScript with strict configuration  

I used the create-t3-app to bootstrap the application:
```bash
pnpm create t3-app@latest
```

The T3 stack gives us end-to-end type safety from database to UI, which makes development much smoother and catches errors early.

## Setup Instructions

### Prerequisites
Make sure you have Node.js 18+ and your preferred package manager installed.

### Installation
Install with your preferred node package manager:

**pnpm** (recommended)
```bash
pnpm install
```

**npm**
```bash
npm i
```

**yarn**
```bash
yarn 
```

### Database Setup
Make sure you have a `DATABASE_URL` in your .env file. However, it will default to a local SQLite database if one is not provided.

**Pre-startup steps:**
```bash
pnpm install
pnpm db:generate
pnpm db:migrate
```

**To seed the database with initial data:**
```bash
pnpm db:seed
```

**Start the development server:**
```bash
pnpm dev
```

And voila! Your video gallery should be running on http://localhost:3000.

## Testing

Mostly unit testing for now. Can be run via:
```bash
pnpm test           # Run once
pnpm test:watch     # Watch mode
```

## Future Improvements

If I had more time, here's what I'd polish and implement differently:

### Testing Strategy
- **Component testing** and **E2E testing** for the app - right now we only have unit tests
- **Visual regression testing** to catch UI changes
- **API contract testing** to ensure frontend/backend compatibility

### Performance & UX
- **Improve the pagination logic** - the "load more" UX isn't as smooth as I'd like. Would implement virtual scrolling or cursor-based pagination
- **Better image loading** - using skeleton loaders before loading images would enhance the user experience
- **Enhanced error handling** with proper error boundaries and user-friendly error messages

### Code Quality & Architecture
- **Better decoupling** of the query client from the React code - more custom hooks and cleaner separation
- **Componentize the new-video page** - it's currently one big component that could be broken down
- **Design system** - establish consistent spacing, typography, and component patterns
- **Form validation** - implement react-hook-form for better form handling and validation

### Infrastructure & Monitoring
- **Add verbose logging** to better debug and troubleshoot the app
- **Performance monitoring** - APM integration to track real user metrics
- **Database optimization** - connection pooling and query optimization for production
- **CI/CD pipeline** - automated testing and deployment workflows

### Security & Production Readiness
- **Authentication & authorization** - proper user management system
- **Input sanitization** and XSS protection
- **Rate limiting** for API endpoints
- **Environment-specific configurations** for different deployment stages

The app works great for the current scope, but these improvements would make it more robust and production-ready!

---