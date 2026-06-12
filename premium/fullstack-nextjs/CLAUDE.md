# CLAUDE.md — Fullstack Next.js App

## Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict)
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: Auth.js v5 (NextAuth)
- **Styling**: Tailwind CSS v4
- **UI**: shadcn/ui (Radix primitives)
- **Validation**: Zod (shared between client and server)
- **Forms**: React Hook Form + Zod resolver
- **State**: TanStack Query (server), Zustand (client)
- **Testing**: Vitest + Testing Library + Playwright (E2E)
- **Package manager**: npm

## Commands
```bash
npm run dev          # Next.js dev server (turbo mode)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest unit/integration
npm run test:e2e     # Playwright E2E
npm run db:push      # Push schema to dev DB
npm run db:studio    # Prisma Studio
npm run db:seed      # Seed database
```

## Architecture

### Project Structure
```
src/
├── app/               # Next.js App Router pages & API routes
├── components/        # React components (feature-based)
│   ├── ui/            # shadcn/ui primitives
│   ├── forms/         # Form components
│   └── features/      # Feature-specific components
├── lib/               # Core utilities
│   ├── db.ts          # Prisma client singleton
│   ├── auth.ts        # Auth.js config
│   ├── validation.ts  # Shared Zod schemas
│   └── utils.ts       # General utilities
├── hooks/             # Custom React hooks
├── server/            # Server-only logic
│   ├── actions/       # Server Actions
│   ├── services/      # Business logic services
│   └── repositories/  # Data access layer
└── styles/            # Global styles
```

### Server Actions vs API Routes
| Pattern | Use Case |
|---------|----------|
| Server Actions | Mutations triggered by user interaction (forms, buttons) |
| API Routes | External consumers, webhooks, public API |
| Route Handlers | GET requests that need `route.ts` handling |

- Server Actions run sequentially. If you need parallel mutations, use API routes.
- Always validate in Server Actions — they're public endpoints.
- Use `revalidatePath()` / `revalidateTag()` after mutations, not router.refresh().

### Data Fetching
```typescript
// Server Components — fetch directly, no client-side state
async function UserList() {
  const users = await db.user.findMany()
  return <div>...</div>
}

// Client Components — TanStack Query
function UserProfile({ userId }: { userId: string }) {
  const { data } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json())
  })
}
```

- **Never fetch in both server and client for the same data.**
- Use `React.cache()` to deduplicate fetch calls in Server Components.
- Prefetch data in `generateMetadata` when possible.

### Auth Patterns
```typescript
// Server Component / Server Action — auth() from Auth.js
import { auth } from '@/lib/auth'
const session = await auth()
if (!session?.user) redirect('/login')

// Client Component — useSession hook
import { useSession } from 'next-auth/react'
const { data: session } = useSession()

// Middleware protection
export { auth as middleware } from '@/lib/auth'
export const config = { matcher: ['/dashboard/:path*', '/api/protected/:path*'] }
```

### Database Rules
- **Use Prisma transactions for multi-table writes.**
  ```typescript
  await db.$transaction([
    db.order.create({ data: orderData }),
    db.inventory.update({ where: { id }, data: { quantity: { decrement: 1 } } })
  ])
  ```
- **Never use `$queryRaw` for user-input queries** — SQL injection risk.
- **Add indexes for frequently queried columns.** Check query performance with `db:studio`.

### Security (CRITICAL)
- **Never expose Prisma models directly to the client.** Map through a DTO.
- **Server Actions must validate input** even if the form has client-side validation.
- **Never send sensitive data to the client.** Use `select` to pick only needed fields.
- **Rate limit login and signup endpoints.**
- **CSP headers** must be configured in `next.config.ts`.

### Error Handling
```typescript
// Server Actions — return errors, don't throw
async function createUser(formData: FormData) {
  const parsed = userSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.flatten() }
  try {
    await db.user.create({ data: parsed.data })
    revalidatePath('/users')
    return { success: true }
  } catch (error) {
    if (error.code === 'P2002') return { error: 'Email already exists' }
    throw error // unexpected errors bubble to error boundary
  }
}
```

## Definition of Done
- [ ] Build passes (`npm run build`)
- [ ] Lint clean (`npm run lint`)
- [ ] Types check (no `any`, no type errors)
- [ ] Auth works for protected routes
- [ ] Forms validated both client and server side
- [ ] No sensitive data leaked to client
- [ ] Database migrations generated (`prisma migrate dev`)
- [ ] E2E tests pass for critical flows
