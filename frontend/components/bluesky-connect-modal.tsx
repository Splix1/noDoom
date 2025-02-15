'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface BlueskyConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConnect: () => void;
}

export function BlueskyConnectModal({ isOpen, onClose, onConnect }: BlueskyConnectModalProps) {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Connect Bluesky Account</DialogTitle>
                    <DialogDescription className="space-y-3 pt-3">
                        <p>
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
                        </p>
                        
                        <p className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                            ⚠️ Do not use your main Bluesky account password. Only use the App Password.
                        </p>
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
                    <Button onClick={onConnect}>
                        Connect
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
} 