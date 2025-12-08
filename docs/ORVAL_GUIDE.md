# How to Use Orval

## Generate API Code

```bash
pnpm api:generate
```

This generates type-safe React Query hooks from OpenAPI spec.

## What Gets Generated

After running `pnpm api:generate`, you'll get:

```
src/api/generated/
├── model/
│   ├── index.ts                    # All type exports
│   ├── postUsersBody.ts           # Request body types
│   ├── getUsers200.ts             # Response types
│   ├── getUsers200Data.ts         # Nested response data types
│   └── ...                        # All other API types
└── users.ts                       # React Query hooks for users endpoints
```

**Generated hooks for each endpoint:**

- `useGetUsers()` - Fetch all users
- `useGetUsersId()` - Fetch single user by ID
- `usePostUsers()` - Create new user
- `usePutUsersId()` - Update user by ID
- `useDeleteUsersId()` - Delete user by ID

**Generated types:**

- `PostUsersBody` - User creation data
- `GetUsers200` - API response structure
- All response/request types with full TypeScript support

## How Hooks Map to Backend Routes

Orval generates hooks based on OpenAPI spec.
It auto creates a direct mapping between frontend hooks and backend endpoints,

| Frontend Hook        | HTTP Method | Backend Route | Purpose              |
| -------------------- | ----------- | ------------- | -------------------- |
| `useGetUsers()`      | GET         | `/users`      | Fetch all users      |
| `useGetUsersId(id)`  | GET         | `/users/{id}` | Fetch single user    |
| `usePostUsers()`     | POST        | `/users`      | Create new user      |
| `usePutUsersId()`    | PUT         | `/users/{id}` | Update existing user |
| `useDeleteUsersId()` | DELETE      | `/users/{id}` | Delete user          |

**Example mapping:**

```typescript
// This hook...
const { data } = useGetUsers();

// ...automatically calls this endpoint
// GET http://localhost:3000/users

// This mutation...
deleteUserMutation.mutate({ id: '123' });

// ...automatically calls this endpoint
// DELETE http://localhost:3000/users/123
```

The hooks handle all the HTTP details (URL construction, headers, req/res parsing).
So we just focus on our React logic.

## Using Generated Hooks

### Import what is needed

```typescript
import {
  useDeleteUsersId,
  useGetUsers,
  usePostUsers,
} from '@/api/generated/users';
import type { PostUsersBody } from '@/api/generated/model';
```

### Fetch data (GET)

```typescript
const { data: usersResponse, isLoading, error, refetch } = useGetUsers();

// looks painful I know, it is what it is
const users = usersResponse?.data?.data?.users || [];
```

### Create data (POST)

```typescript
const createUserMutation = usePostUsers({
  mutation: {
    onSuccess: () => {
      refetch(); // refresh data
    },
    onError: (error) => {
      console.error('Failed:', error);
    },
  },
});

// in form handler
const handleCreate = (e: React.FormEvent) => {
  e.preventDefault();
  createUserMutation.mutate({ data: formData });
};
```

### Delete data (DELETE)

```typescript
const deleteUserMutation = useDeleteUsersId({
  mutation: {
    onSuccess: () => {
      refetch();
    },
  },
});

const handleDelete = (id: string) => {
  deleteUserMutation.mutate({ id });
};
```

## Example Component

See `src/pages/users/index.tsx` for a complete working example that:

- Fetches users with `useGetUsers()`
- Creates users with `usePostUsers()`
- Deletes users with `useDeleteUsersId()`
- Handles loading states and errors
- Maintains type safety throughout
