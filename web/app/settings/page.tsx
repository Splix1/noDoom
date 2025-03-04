import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { ConnectionsSection } from "@/components/connections-section";

interface Connection {
  platform: string;
  handle?: string | null;
}

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }

  // Get access token for API call
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token;

  // Get connection states from API
  const response = await fetch(`http://localhost:5115/api/connections`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  
  const connections = await response.json() as Connection[];

  return (
    <div className="flex-1 w-full flex flex-col gap-4 px-4">
      <h1 className="text-2xl font-semibold">Connections</h1>
      
      <ConnectionsSection initialConnections={connections} />

      <h1 className="text-2xl font-semibold">User Settings</h1>
      
      {/* Show posts only from following */}
      <div className="flex items-center p-4 bg-card rounded-lg border w-[600px]">
        <span className="text-sm flex-1">Show posts only from following</span>
        <div className="ml-8">
          <Switch />
        </div>
      </div>

      {/* Theme Switcher */}
      <div className="flex items-center p-4 bg-card rounded-lg border w-[600px]">
        <span className="text-sm flex-1">Theme</span>
        <div className="ml-8">
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
}