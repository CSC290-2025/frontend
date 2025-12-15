# Frontend Development Checklist

Use this checklist when adding new features or API integrations to the frontend. Follow the flow and don't skip steps.

## React Query Guide ( !! Required for hooks)

Read this if you are new to React Query — it is required for implementing hooks:
https://gist.github.com/Mykal-Steele/453b9dbddcfd99b6e5b5920f028ac100

## Quick Development Checklist

Follow this order when building a new feature:

### 1. TYPES (`types/`)

- [ ] **Create type file** - Match backend response structure
- [ ] **Define interfaces** - Export all types
- [ ] **Use proper types** - No `any`, use union types for enums
- [ ] **Add null for nullable** - Use `null` not `undefined`

### 2. API CALLS (`api/`)

- [ ] **Create API file** - Add comment header
- [ ] **Import apiClient** - `from '@/lib/apiClient'`
- [ ] **Create functions** - One per endpoint
- [ ] **Use correct HTTP method** - GET/POST/PUT/DELETE
- [ ] **Type parameters** - Add types to all params
- [ ] **Export functions** - Export all API calls

### 3. HOOKS (`hooks/`)

- [ ] **Create hook file** - Add comment header
- [ ] **Import dependencies** - React Query + API functions
- [ ] **Use `useQuery` for GET** - With proper query key
- [ ] **Use `useMutation` for POST/PUT/DELETE** - With invalidation
- [ ] **Add `enabled` option** - Conditional fetching
- [ ] **Export hook** - Export the function

### 4. COMPONENTS (`components/`)

- [ ] **Create component file** - Add comment header
- [ ] **Define props interface** - Type all props
- [ ] **Use Tailwind** - No inline chat
- [ ] **Handle states** - Loading, error, empty
- [ ] **Export default** - Default export only

### 5. PAGES (`pages/`)

- [ ] **Create page file** - Add comment header
- [ ] **Import dependencies** - Hooks, components, types
- [ ] **Use hooks** - Call custom hooks
- [ ] **Handle all states** - Loading, error, empty, success
- [ ] **Compose components** - Build UI from components
- [ ] **Export default** - Default export only

### 6. ROUTING (`src/pages/`)

- [ ] **Create route file** - e.g., `src/pages/financial/index.tsx`
- [ ] **Re-export page** - `export { default } from '@/features/...'`
- [ ] **Test route** - Visit URL in browser

### 7. EXPORTS (`index.ts`)

- [ ] **Update index.ts** - Export public components/hooks
- [ ] **Add comment** - Explain exports
- [ ] **Follow conventions** - Consistent naming

### 8. TESTING

- [ ] **Start dev server** - `pnpm run dev`
- [ ] **Test in browser** - All states work
- [ ] **Check Network tab** - API calls correct
- [ ] **Check console** - No errors
- [ ] **Run lint** - `pnpm run lint:fix`
- [ ] **Format code** - `pnpm run format`

---

## Detailed Development Guide

### 1. TYPES (`types/`)

**Tips:** Match backend schema exactly • Use union types for enums • Use `string` for dates • Use `null` not `undefined` for nullable

```typescript
export interface Wallet {
  id: number;
  owner_id: number;
  wallet_type: 'individual' | 'organization';
  organization_type: string | null;
  balance: number;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}
```

---

### 2. API CALLS (`api/`)

**Patterns:** GET `apiClient.get(url)` • POST `apiClient.post(url, data)` • PUT `apiClient.put(url, data)` • DELETE `apiClient.delete(url)`

```typescript
//api calls for Financial feature
import { apiClient } from '@/lib/apiClient';

export const fetchUserWallets = (userId: number) => {
  return apiClient.get(`/wallets/user/${userId}`);
};

export const createWallet = (data: CreateWalletData) => {
  return apiClient.post('/wallets', data);
};
```

---

### 3. HOOKS (`hooks/`)

Read this if you are new to React Query — it is required for implementing hooks:
https://gist.github.com/Mykal-Steele/453b9dbddcfd99b6e5b5920f028ac100

**useQuery (GET):** Returns `data`, `error`, `isLoading`, `isFetching`, `refetch()` • Use `enabled` for conditional fetching

**useMutation (POST/PUT/DELETE):** Returns `mutate(data)`, `mutateAsync(data)`, `isLoading`, `isError`, `data` • Use `onSuccess` to invalidate queries

**Query Keys:** Single `['wallet', id]` • List `['wallets', userId]` • Filtered `['wallets', userId, { status: 'active' }]`

```typescript
//hook for fetching user wallets
import { useQuery } from '@tanstack/react-query';
import { fetchUserWallets } from '@/features/Financial/api/financial.api';

export function useUserWallets(userId: number) {
  return useQuery({
    queryKey: ['wallets', userId],
    queryFn: () => fetchUserWallets(userId),
    enabled: !!userId,
  });
}
```

```typescript
//hook for creating wallet
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createWallet } from '@/features/Financial/api/financial.api';

export function useCreateWallet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}
```

---

### 4. COMPONENTS (`components/`)

**Guidelines:** Small & focused • Props interface first • Semantic HTML • Tailwind only • Handle loading/error/empty states

```typescript
// component to display wallet information
import type { Wallet } from '@/features/Financial/types/wallet';

interface WalletCardProps {
  wallet: Wallet;
}

export default function WalletCard({ wallet }: WalletCardProps) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow">
      <p className="text-2xl font-bold">${wallet.balance.toFixed(2)}</p>
      <span className="text-sm text-green-600">{wallet.status}</span>
    </div>
  );
}
```

---

### 5. PAGES (`pages/`)

**Response Structure:** Axios wraps in `data` → Backend: `{ success: true, data: { wallets: [...] } }` → Access: `data?.data?.data?.wallets`

```typescript
// main page for Financial feature
import { useUserWallets } from '@/features/Financial/contexts/useUserWallets';
import WalletCard from '@/features/Financial/components/WalletCard';
import type { Wallet } from '@/features/Financial/types/wallet';

export default function FinancialPage() {
  const userId = 6; // use useParams in real app
  const { data, isLoading, error } = useUserWallets(userId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;
  if (!data) return <div>No data found</div>;

  const wallets = data?.data?.data?.wallets || [];

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">Financial</h1>
      <div className="mt-6 space-y-4">
        {wallets.length === 0 ? (
          <p>No wallets found</p>
        ) : (
          wallets.map((wallet: Wallet) => (
            <WalletCard key={wallet.id} wallet={wallet} />
          ))
        )}
      </div>
    </main>
  );
}
```

---

### 6. ROUTING (`src/pages/`)

**File-based Routing:** `pages/financial/index.tsx` → `/financial` • `pages/financial/[id].tsx` → `/financial/:id`

```typescript
// src/pages/financial/index.tsx
export { default } from '@/features/Financial/pages/FinancialPage';
```

**File-based Routing:**

- `pages/financial/index.tsx` → `/financial`
- `pages/financial/[id].tsx` → `/financial/:id`
- `pages/financial/new.tsx` → `/financial/new`

---

### 7. EXPORTS (`index.ts`)

```typescript
// re-exporting parts that other features might use
export { default as FinancialPage } from './pages/FinancialPage';
export { default as WalletCard } from './components/WalletCard';
export { useUserWallets } from './contexts/useUserWallets';
```

---

## Code Quality & Testing

**TypeScript:** No `any` types • Fix all errors • Use `@/` imports • Export interfaces

**React:** Follow Rules of Hooks • Add `key` props • Handle all states • Remove console.logs • Use memoization when needed

**Styling:** Tailwind only • Responsive classes • Use `@/components/ui/` components

**Testing:** Test all states (loading/error/empty/success) • Check Network tab • No console errors • Works on mobile

**Commands:** `pnpm run lint:fix` • `pnpm run format`

---

## Reference

### UI Components (`@/components/ui/`)

Button • Card • Input • Label • Select • Dialog • Tabs • Form • Badge • Separator • Tooltip

```tsx
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

<Card className="p-6">
  <Button variant="default">Add Funds</Button>
</Card>;
```

### Common Patterns

**Fetching:** `useQuery({ queryKey: ['resource', id], queryFn: () => fetchResource(id), enabled: !!id })`

**Mutation:** `useMutation({ mutationFn: createResource, onSuccess: () => { queryClient.invalidateQueries() } })`

**Form:** Use React Hook Form + Zod for validation

**Conditional:** Always handle loading → error → empty → success states

### Tailwind Quick Reference

**Layout:** `container mx-auto p-6` • `grid grid-cols-1 md:grid-cols-3 gap-4` • `flex items-center justify-between`

**Card:** `rounded-lg border bg-white p-4 shadow`

**Typography:** `text-3xl font-bold` • `text-sm text-gray-600`

**Colors:** `text-green-600 bg-green-100` (success) • `text-red-600 bg-red-100` (error) • `text-gray-600` (default)

**Responsive:** `w-full md:w-1/2 lg:w-1/3`

---

## Commands & Resources

```bash
pnpm run dev          # Start dev server
pnpm run lint:fix     # Fix linting
pnpm run format       # Format code
```

**Help:** Check `src/features/_example/` • See `src/components/ui/` • Use React Query DevTools • Read backend docs
