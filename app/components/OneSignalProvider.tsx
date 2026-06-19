"use client";

import { useEffect, useState } from "react";
import OneSignal from "react-onesignal";
import { useSession } from "@/lib/auth-client";

let oneSignalInitRequested = false;

export default function OneSignalProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        // Run this only on the client side
        async function runOneSignal() {
            if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
                console.warn("OneSignal APP ID is not set in environment variables");
                return;
            }

            try {
                // Prevent double initialization in React Strict Mode
                if (oneSignalInitRequested) {
                    setIsInitialized(true);
                    return;
                }
                oneSignalInitRequested = true;

                await OneSignal.init({
                    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
                    // @ts-ignore - necessary because react-onesignal types might not include welcomeNotification
                    welcomeNotification: {
                        disable: false,
                        title: "Welcome to Eventify! 🎉",
                        message: "You're all set! We'll notify you about your upcoming events, ticket drops, and critical updates."
                    },
                    promptOptions: {
                        slidedown: {
                            prompts: [
                                {
                                    type: "push",
                                    autoPrompt: true,
                                    text: {
                                        actionMessage: "Enable notifications to stay instantly updated on your event registrations, updates, and cancellations!",
                                        acceptButton: "Subscribe",
                                        cancelButton: "Later"
                                    },
                                    delay: {
                                        pageViews: 1,
                                        timeDelay: 3
                                    }
                                }
                            ]
                        }
                    }
                });

                setIsInitialized(true);

                // Show prompt automatically
                await OneSignal.Slidedown.promptPush();

            } catch (error) {
                console.error("Error initializing OneSignal:", error);
            }
        }

        runOneSignal();
    }, []);

    // Effect to handle user login for targeted notifications
    useEffect(() => {
        async function loginUserToOneSignal() {
            if (!isInitialized) return;

            if (session?.user?.id) {
                try {
                    await OneSignal.login(session.user.id);
                } catch (error) {
                    console.error("Error logging in to OneSignal:", error);
                }
            } else {
                try {
                    await OneSignal.logout();
                } catch (error) {
                    console.error("Error logging out of OneSignal:", error);
                }
            }
        }
        
        loginUserToOneSignal();
    }, [session?.user?.id, isInitialized]);

    // Force "Later" button to cancel/hide the UI natively, and override cached dashboard UI
    useEffect(() => {
        // Mutation Observer to instantly change the text and icon when OneSignal injects its UI
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.addedNodes.length) {
                    const container = document.getElementById('onesignal-slidedown-container');
                    if (container) {
                        // 1. Override the text
                        const messageEl = container.querySelector('.slidedown-body-message');
                        if (messageEl && !messageEl.hasAttribute('data-customized')) {
                            messageEl.textContent = "Enable notifications to stay instantly updated on your event registrations, updates, and cancellations!";
                            messageEl.setAttribute('data-customized', 'true');
                        }

                        // 2. Override the button text just in case
                        const subscribeBtn = container.querySelector('#onesignal-slidedown-allow-button');
                        if (subscribeBtn && !subscribeBtn.hasAttribute('data-customized')) {
                            subscribeBtn.textContent = "Subscribe";
                            subscribeBtn.setAttribute('data-customized', 'true');
                        }

                        // 3. Override the Bell Icon
                        const iconContainer = container.querySelector('.slidedown-body-icon');
                        if (iconContainer && !iconContainer.hasAttribute('data-customized')) {
                            const img = document.createElement('img');
                            img.src = '/favicon.ico';
                            img.style.width = '45px';
                            img.style.height = '45px';
                            img.style.objectFit = 'contain';
                            iconContainer.innerHTML = ''; // Clear the generic SVG bell
                            iconContainer.appendChild(img);
                            iconContainer.setAttribute('data-customized', 'true');
                        }
                    }
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        // Global click listener to fix the "Later" and "Subscribe" buttons
        const handlePopupClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isCancel = target.id === "onesignal-slidedown-cancel-button" || target.closest('#onesignal-slidedown-cancel-button');
            const isSubscribe = target.id === "onesignal-slidedown-allow-button" || target.closest('#onesignal-slidedown-allow-button');
            
            if (isCancel || isSubscribe) {
                const container = document.getElementById('onesignal-slidedown-container');
                if (container) {
                    // Visually hide it immediately
                    container.style.display = 'none';
                    container.style.opacity = '0';
                    container.style.pointerEvents = 'none';
                }
            }
        };

        document.addEventListener("click", handlePopupClick);
        
        return () => {
            document.removeEventListener("click", handlePopupClick);
            observer.disconnect();
        };
    }, []);

    return <>{children}</>;
}
