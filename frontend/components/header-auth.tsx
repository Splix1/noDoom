import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!hasEnvVars) {
    return (
      <>
        <div className="flex gap-4 items-center">
          <div>
            <Badge
              variant={"default"}
              className="font-normal pointer-events-none"
            >
              Please update .env.local file with anon key and url
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              asChild
              size="sm"
              variant={"outline"}
              disabled
              className="opacity-75 cursor-none pointer-events-none"
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant={"default"}
              disabled
              className="opacity-75 cursor-none pointer-events-none"
            >
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }
  return user ? (
    <div className="flex items-center gap-2">
      <form action={signOutAction} className="flex-shrink-0">
        <Button type="submit" variant={"outline"} size="sm" className="w-[80px]">
          Sign out
        </Button>
      </form>
      <div className="flex-shrink-0">
        <Button variant={"outline"} size="sm" className="w-[80px]">
          <Link href="/settings">Settings</Link>
        </Button>
      </div>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <div className="flex-shrink-0">
        <Button asChild size="sm" variant={"outline"} className="w-[80px]">
          <Link href="/sign-in">Sign in</Link>
        </Button>
      </div>
      <div className="flex-shrink-0">
        <Button asChild size="sm" variant={"default"} className="w-[80px]">
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </div>
    </div>
  );
}
