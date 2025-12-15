# Architecture Guide

## ARCHITECTURE PATTERN

### 1. FOLDER STRUCTURE

## We have 2 main folder for frontend `feature` and `page` folder folder project structure cleanness.

### `feature` folder is used for making pages and all of frontend stuffs for each feature (UI,api logics,components,pages) in that folder.

### `page` is used for routing only used for entering pages.

`feature` structure

```tree
Substitute [feature] with specific names.

[features]/
├── api/
│   ├── [feature].api.tsx
│   └── index.ts (export * from './[feature].api')
├── components/
│   ├── [componentName].tsx
├── hooks/ (fetching,caching data,etc)
│   ├── [hookName].tsx
├── pages/
│   ├── [pageName].tsx
└── index.ts (export everything (default as pages,hooks) you can see in _example/index.ts)
```

# React Query Guide

if you are new to **React Query** you can read this for understanding `hooks` folder and structure : https://tanstack.com/query/v4/docs/framework/react/overview

# Generouted File-Based Routing Guide

for `page` structure we use **file-based routing** by **generouted**

this means that if you create an folder in `/src/pages` it will automatically set route for you but you need to have `index.tsx` file
in that folder first and **it must be named `index.tsx` only**

for example : i have `/src/pages/weather` and inside `pages/weather` I have `index.tsx` that shows and the weather UI
this mean if I go to `www.smartcityhub.com/weather` it will shows all the weather pages automatically without touching `router.ts` or `main.tsx` file.

you can check it here for more detail : https://github.com/CSC290-2025/generouted-vite-example

`page` structure

```tree
Substitute [pages] with specific names.

[pages]/
├── [nested-pages-name]/ **Optional**
│   └── index.tsx (re-export from the pages folder in features/pages)
├── [id.tsx]/ (in case you have dynamic routes e.g /user/[id]) **Optional**
└── index.tsx (re-export from the pages folder in features/pages)
```

### 2. CODE PATTERN

#### **2.1 `/src/feature`** Code Pattern

#### APIs PATTERN

```typescript
import { apiClient } from '@/lib/apiClient';

export const fetchUserById = (id: number) => {
  apiClient.get(`/user/${id}`);
};
```

#### COMPONENTS PATTERN

```typescript
import { useUser } from '../contexts/useUser';
import type { User } from '@/types/user';

interface UserCardProps {
  id: number;
}

export default function UserCard({ id }: UserCardProps) {
  const { data, isLoading, error } = useUser(id);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {(error as Error).message}</div>;
  if (!data) return <div>No user found.</div>;

  const user = data as User;

  return <div>{user.username}</div>;
}

```

#### HOOKS PATTERN

```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchUserById } from '../api/feature.api';

export function useUser(id: number) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUserById(id),
    enabled: !!id,
  });
}
```

#### PAGES PATTERN

```typescript
export default function UserHomePage() {
  return (
    <main className="">
      <h1 className="text-3xl font-bold">Welcome to Smart City Hub</h1>
      <p className="mt-2">
        Navigate to <a href="/example/1">User 1</a>
      </p>
    </main>
  );
}
```

**another user page**

```typescript
import UserCard from '../components/UserCard';
export default function UserPage() {
  const id = 1; // example only in real website might use useParams instaed
  if (!id) {
    return <div> no user id provided</div>;
  }
  return (
    <div>
      <h1>User Page</h1>
      <h2>Welcome</h2>
      <UserCard id={1} />
    </div>
  );
}
```

#### INDEX FILES PATTERN

```typescript
export { default as UserCard } from './components/UserCard';
export { default as UserPage } from './pages/UserPage';
export { useUser } from './contexts/useUser';
```

#### **2.2 `/src/pages`** Code Pattern

#### INDEX.TSX PATTERN (Do it all like this for all of files in `/src/pages` folder)

```typescript
export { default } from '@/features/_example/pages/UserHomepage';
```
