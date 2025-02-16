import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { BlueskyCard } from "@/components/connection-cards/bluesky-card";
import { RedditCard } from "@/components/connection-cards/reddit-card";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  if (!user) {
    return redirect("/sign-in");
  }

  // Get connection states from database
  const { data: connections } = await supabase
    .from('Connections')
    .select('platform, handle')
    .eq('user_id', user.id);

  const blueskyConnected = connections?.some(c => c.platform === 'bluesky') ?? false;
  const blueskyHandle = connections?.find(c => c.platform === 'bluesky' && c.handle !== null)?.handle;
  const redditConnected = connections?.some(c => c.platform === 'reddit') ?? false;

  return (
    <div className="flex-1 w-full flex flex-col gap-4 px-4">
      <h1 className="text-2xl font-semibold">Connections</h1>
      
      <div className="flex flex-col gap-4">
        <BlueskyCard isConnected={blueskyConnected} handle={blueskyHandle} />
        <RedditCard isConnected={redditConnected} />

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