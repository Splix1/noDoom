import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { BlueskyCard } from "@/components/connection-cards/bluesky-card";
import { RedditCard } from "@/components/connection-cards/reddit-card";

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

  // Create a mapped object of connections
  const connectionMap = Object.fromEntries(
    new Map(connections.map(conn => [conn.platform, conn.handle || true]))
  );
  


  return (
    <div className="flex-1 w-full flex flex-col gap-4 px-4">
      <h1 className="text-2xl font-semibold">Connections</h1>
      
      {/* Info message about connections - only show if no connections */}
      {Object.keys(connectionMap).length === 0 && (
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-2 text-sm">
          <p>You need to connect a Bluesky or Reddit account to view your timeline.</p>
        </div>
      )}
      
      {/* Connections Section */}
      <div className="flex flex-col gap-4">
        <BlueskyCard 
          isConnected={'bluesky' in connectionMap} 
          handle={typeof connectionMap.bluesky === 'string' ? connectionMap.bluesky : null} 
        />
        <RedditCard isConnected={'reddit' in connectionMap} />

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
    </div>
  );
}