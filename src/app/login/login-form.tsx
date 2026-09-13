"use client";

import { useFormStatus } from "react-dom";
import { signInAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Signing in…" : "Sign in"}
    </Button>
  );
}

export function LoginForm({ nextPath }: { nextPath?: string }) {
  return (
    <form action={signInAction} className="grid gap-4">
      <input type="hidden" name="next" value={nextPath || "/app"} />
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue="admin@demo.shopcal.test"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          defaultValue="DemoAdmin!2026"
        />
      </div>
      <SubmitButton />
    </form>
  );
}
