'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { API_URL } from "@/utils/config";

interface BlueskyConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: (handle: string) => void;
}

export function BlueskyConnectModal({ isOpen, onClose, onConnect }: BlueskyConnectModalProps) {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const supabase = createClient();

    const handleConnect = async () => {
        try {
            setIsLoading(true);
            
            // Get the session and user data
            const { data: { session } } = await supabase.auth.getSession();
            const { data: { user } } = await supabase.auth.getUser();

            if (!session || !user) {
                throw new Error('Not authenticated');
            }

            const requestBody = {
                UserId: user.id.toLowerCase(),
                Username: identifier,
                AppPassword: password
            };
            
            console.log('Request body:', requestBody);
            console.log('Auth token:', session.access_token);

            // Make the POST request to connect Bluesky
            const response = await fetch(`${API_URL}/api/bluesky/connect`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(requestBody)
            });

            console.log('Response status:', response.status);
            const responseText = await response.text();
            console.log('Response body:', responseText);

            if (!response.ok) {
                throw new Error(responseText || 'Failed to connect Bluesky account');
            }

            onConnect(identifier);
            onClose();
        } catch (error) {
            console.error('Error connecting Bluesky:', error);
            alert(error instanceof Error ? error.message : 'Failed to connect Bluesky account');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Connect Bluesky Account</DialogTitle>
                    <DialogDescription>
                        <div className="space-y-3 pt-3">
                            <div>
                                To connect your Bluesky account, you'll need to{' '}
                                <a 
                                    href="https://bsky.app/settings/app-passwords" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    create an App Password
                                </a>
                                . Name it "noDoom".
                            </div>
                            
                            <div className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                                ⚠️ Do not use your main Bluesky account password. Only use the App Password.
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label htmlFor="identifier" className="text-sm font-medium">
                            Bluesky Handle
                        </label>
                        <Input
                            id="identifier"
                            placeholder="username.bsky.social"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="app-password" className="text-sm font-medium">
                            App Password
                        </label>
                        <Input
                            id="app-password"
                            type="password"
                            placeholder="Enter your App Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleConnect} 
                        disabled={isLoading}
                    >
                        {isLoading ? 'Connecting...' : 'Connect'}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 