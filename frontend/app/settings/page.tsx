import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Switch } from "@/components/ui/switch";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  // Add connection states
  const blueskyConnected = false; // TODO: Get actual connection state
  const redditConnected = false;  // TODO: Get actual connection state

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-4 px-4">
      <h1 className="text-2xl font-semibold">Connections</h1>
      
      <div className="flex flex-col gap-4">
        {/* Bluesky Connection */}
        <div className="flex items-center p-4 bg-card rounded-lg border w-[600px]">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-2xl">🦋</div>
            <span className="text-sm text-muted-foreground">Not Connected</span>
          </div>
          <div className="flex items-center gap-4">
            <Switch checked={blueskyConnected} />
            <button 
              className={`px-3 py-1 rounded-md text-sm ${
                blueskyConnected 
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {blueskyConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>

        {/* Reddit Connection */}
        <div className="flex items-center p-4 bg-card rounded-lg border w-[600px]">
          <div className="flex items-center gap-3 flex-1">
            <div className="text-2xl">🤖</div>
            <span className="text-sm text-muted-foreground">Not Connected</span>
          </div>
          <div className="flex items-center gap-4">
            <Switch checked={redditConnected} />
            <button 
              className={`px-3 py-1 rounded-md text-sm ${
                redditConnected 
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              {redditConnected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-semibold">User Settings</h1>
        {/* Show posts only from following */}
        <div className="flex items-center p-4 bg-card rounded-lg border w-[600px]">
          <span className="text-sm flex-1">Show posts only from following</span>
          <div className="ml-8">
            <Switch />
          </div>
        </div>
      </div>
    </div>
  );
}
