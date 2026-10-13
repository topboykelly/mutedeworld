"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "@/app/admin/actions";
import { PillButton } from "../ui/Button";
import { Field, TextInput } from "../ui/fields";

export function LoginForm({ notice }: { notice?: string }) {
  const [state, action, pending] = useActionState(signIn, null);
  const [showPassword, setShowPassword] = useState(false);
  const error = state?.error ?? notice;

  return (
    <form action={action} className="flex flex-col gap-4">
      <Field id="email" label="Email">
        <TextInput id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field id="password" label="Password">
        <div className="relative">
          <TextInput
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className="pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </Field>
      {error && (
        <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
      <PillButton type="submit" variant="dark" disabled={pending} className="mt-2 w-full">
        {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {pending ? "Signing in…" : "Sign in"}
      </PillButton>
    </form>
  );
}
