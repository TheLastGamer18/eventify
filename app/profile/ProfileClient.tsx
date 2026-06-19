"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, FileText, ArrowRight, LayoutDashboard } from "lucide-react";
import { type EventSummary } from "@/lib/db";

type Tab = "created" | "registered";

interface ProfileClientProps {
    user: {
        name: string;
        email: string;
        image?: string | null;
    };
    createdEvents: EventSummary[];
    registeredEvents: EventSummary[];
}

const colorMap: Record<string, string> = {
    "brutal-pink": "bg-brutal-pink",
    "brutal-cyan": "bg-brutal-cyan",
    "brutal-yellow": "bg-brutal-yellow",
    "brutal-lime": "bg-brutal-lime",
    "brutal-orange": "bg-brutal-orange",
};

const ProfileClient = ({ user, createdEvents, registeredEvents }: ProfileClientProps) => {
    const searchParams = useSearchParams();
    const initialTab = searchParams.get("tab") === "registered" ? "registered" : "created";
    const [tab, setTab] = useState<Tab>(initialTab);

    const avatarInitials = user.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
        : "??";

    const events = tab === "created" ? createdEvents : registeredEvents;

    const now = new Date();
    const upcomingEvents = events.filter(event => new Date(`${event.date}T${event.endTime || '23:59'}`) >= now);
    const pastEvents = events.filter(event => new Date(`${event.date}T${event.endTime || '23:59'}`) < now);

    const EventCard = ({ event }: { event: EventSummary }) => (
        <Link
            href={`/event/${event.id}`}
            className="brutal-border brutal-shadow brutal-hover flex flex-col rounded-lg bg-card overflow-hidden h-full"
        >
            <div className={`h-32 relative ${colorMap[event.bannerColor] || "bg-brutal-pink"}`}>
                {event.bannerUrl && <img src={event.bannerUrl} className="absolute inset-0 w-full h-full object-cover" alt={event.name} />}
            </div>
            <div className="p-5 flex flex-col flex-1">
                <h3 className="mb-1 text-base font-extrabold line-clamp-1">{event.name}</h3>
                <p className="text-xs text-muted-foreground mb-3">
                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    {" · "}{event.attendees} attendees
                    {" · "}{event.isFree ? "Free" : `₹${event.price}`}
                </p>
                <div className="mt-auto pt-2 flex gap-2">
                    {tab === "created" && (
                        <span className="text-xs font-bold bg-secondary px-2 py-1 rounded border border-border">Owner</span>
                    )}
                    {tab === "registered" && (
                        <>
                            {event.registrationStatus === 'pending' ? (
                                <span className="text-xs font-bold bg-yellow-100 text-yellow-800 px-2 py-1 rounded border border-yellow-200">Pending Approval</span>
                            ) : (
                                <span className="text-xs font-bold bg-green-100 text-green-800 px-2 py-1 rounded border border-green-200">Registered</span>
                            )}
                        </>
                    )}
                </div>
            </div>
        </Link>
    );

    return (
        <main className="mx-auto max-w-site px-6 py-12">
            {/* User Card */}
            <div className="brutal-border brutal-shadow mb-10 flex flex-col items-center justify-between gap-4 rounded-lg bg-card p-8 sm:flex-row sm:items-center">
                <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                    <div className="brutal-border brutal-shadow-sm flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-brutal-cyan text-2xl font-black overflow-hidden relative">
                        {user.image ? (
                            <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                        ) : (
                            avatarInitials
                        )}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black">{user.name}</h1>
                        <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail size={14} /> {user.email}
                        </div>
                    </div>
                </div>

                <div className="flex mt-4 sm:mt-0">
                    <Link
                        href="/dashboard"
                        className="brutal-border brutal-shadow-sm brutal-hover flex items-center gap-2 rounded-md bg-brutal-yellow px-4 py-2 text-sm font-bold text-black"
                    >
                        <LayoutDashboard size={16} /> View Dashboard
                    </Link>
                </div>
            </div>

            {/* Tabs + Events */}
            <div className="grid gap-8 md:grid-cols-[240px_1fr]">
                {/* Tab Switcher */}
                <div className="flex flex-row gap-2 md:flex-col">
                    {(["created", "registered"] as Tab[]).map((t) => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`brutal-border brutal-shadow-sm brutal-hover rounded-md px-5 py-3 text-left text-sm font-bold capitalize ${tab === t
                                ? "bg-primary text-primary-foreground"
                                : "bg-card text-card-foreground"
                                }`}
                        >
                            {t === "created" ? "Created Events" : "Registered Events"}
                        </button>
                    ))}
                </div>

                {/* Event Cards */}
                <div>
                    {events.length === 0 ? (
                        <div className="brutal-border brutal-shadow flex flex-col items-center rounded-lg bg-card py-16 text-center">
                            <FileText size={40} className="mb-3 text-muted-foreground" />
                            <p className="text-lg font-bold">No events here yet</p>
                            <p className="text-sm text-muted-foreground">
                                {tab === "created" ? "Create your first event to see it here." : "Register for events to see them here."}
                            </p>
                            {tab === "created" && (
                                <Link href="/create" className="mt-4 inline-flex items-center gap-2 rounded-md bg-brutal-pink px-4 py-2 text-sm font-bold brutal-border brutal-shadow-sm brutal-hover">
                                    Create Event <ArrowRight size={16} />
                                </Link>
                            )}
                            {tab === "registered" && (
                                <Link href="/explore" className="mt-4 inline-flex items-center gap-2 rounded-md bg-brutal-lime px-4 py-2 text-sm font-bold brutal-border brutal-shadow-sm brutal-hover">
                                    Explore Events <ArrowRight size={16} />
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-8">
                            {upcomingEvents.length > 0 && (
                                <section>
                                    <h2 className="mb-4 text-xl font-black">Upcoming Events</h2>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        {upcomingEvents.map((event) => (
                                            <EventCard key={event.id} event={event} />
                                        ))}
                                    </div>
                                </section>
                            )}
                            
                            {pastEvents.length > 0 && (
                                <section>
                                    <h2 className={`mb-4 text-xl font-black text-muted-foreground ${upcomingEvents.length > 0 ? "border-t-2 border-border pt-6" : ""}`}>Past Events</h2>
                                    <div className="grid gap-4 sm:grid-cols-2 opacity-80">
                                        {pastEvents.map((event) => (
                                            <EventCard key={event.id} event={event} />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
};

export default ProfileClient;
