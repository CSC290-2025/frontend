# shadcn/ui Usage Guide

This project already has **shadcn/ui** installed and configured.  
You can start using the existing components right away.

---

## How to Use

1. You can import any component that already exists in `components/ui`.
2. Use them directly in your React files like normal JSX components.
3. TailwindCSS is already integrated, so you can customize chat with classes.

Example:

- `components/ui/button.tsx` → use `<Button />`
- `components/ui/card.tsx` → use `<Card />`

---

## How to Add More Components

If you want to install more components from shadcn:

```bash
pnpm dlx shadcn@latest add <component-name>

```

also if you want to see all available components name you can see it from this link : https://ui.shadcn.com/docs/components

## CODE EXAMPLE

```typescript

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function ExampleCard() {
  return (
    <Card className="w-[300px]">
      <CardHeader>
        <CardTitle>Hello World</CardTitle>
      </CardHeader>
      <CardContent>shadcn/ui in action 🚀</CardContent>
    </Card>
  );
}

```
