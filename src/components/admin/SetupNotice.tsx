import { Database } from "lucide-react";
import { Card } from "./ui";

const steps = [
  <>
    Create a free project at{" "}
    <a href="https://supabase.com" target="_blank" rel="noreferrer" className="font-medium text-accent underline">
      supabase.com
    </a>
    .
  </>,
  <>
    In the project, open <b>SQL Editor</b>, paste the whole of <code>supabase/schema.sql</code> from this website&apos;s
    code and click <b>Run</b>.
  </>,
  <>
    Go to <b>Authentication → Users → Add user</b> and create your admin login. Then, under{" "}
    <b>Sign In / Providers</b>, turn off <b>Allow new users to sign up</b>.
  </>,
  <>
    Make that login an admin by running this in the SQL Editor (with your email):
    <pre className="mt-2 overflow-x-auto rounded-2xl bg-night p-4 text-xs text-white">
      {`insert into public.admins (user_id)
select id from auth.users where email = 'you@example.com';`}
    </pre>
  </>,
  <>
    Copy <code>.env.example</code> to <code>.env.local</code> and paste in the values from{" "}
    <b>Project Settings → API</b>. Restart the site (and add the same variables on your host when you deploy).
  </>,
  <>
    Sign in here and click <b>Import starter products</b> to load the current catalogue, then add real photos.
  </>,
];

export function SetupNotice() {
  return (
    <Card className="max-w-3xl">
      <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent">
        <Database className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-2xl font-semibold">Connect the shop database</h2>
      <p className="mt-2 text-muted">
        The store is running in demo mode on the built-in starter products, and orders aren&apos;t saved. Follow these
        steps once to switch on the admin portal.
      </p>
      <ol className="mt-6 flex flex-col gap-4">
        {steps.map((step, i) => (
          <li key={i} className="flex gap-4">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-night text-sm font-semibold text-white dark:bg-accent">
              {i + 1}
            </span>
            <div className="min-w-0 pt-0.5 text-sm leading-relaxed">{step}</div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
