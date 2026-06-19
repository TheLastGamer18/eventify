"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, ArrowRight, Users } from "lucide-react";
import { type EventSummary } from "@/lib/db";

const colorMap: Record<string, string> = {
    "brutal-pink": "bg-brutal-pink",
    "brutal-cyan": "bg-brutal-cyan",
    "brutal-yellow": "bg-brutal-yellow",
    "brutal-lime": "bg-brutal-lime",
    "brutal-orange": "bg-brutal-orange",
};

interface PublicProfileClientProps {
    user: { id: string; name: string; image: string | null };
    createdEvents: EventSummary[];
    isOwner: boolean;
}

const PublicProfileClient = ({ user, createdEvents, isOwner }: PublicProfileClientProps) => {
    const avatarInitials = user.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2)
        : "??";

    const now = new Date();
    const upcomingEvents = createdEvents.filter(event => new Date(`${event.date}T${event.endTime || '23:59'}`) >= now);
    const pastEvents = createdEvents.filter(event => new Date(`${event.date}T${event.endTime || '23:59'}`) < now);

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
            </div>
        </Link>
    );

    return (
        <main className="mx-auto max-w-site px-6 py-12">
            {/* User Card */}
            <div className="brutal-border brutal-shadow mb-10 flex flex-col items-center gap-4 rounded-lg bg-card p-8 sm:flex-row sm:items-start">
                <div className="brutal-border brutal-shadow-sm flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-brutal-cyan text-2xl font-black overflow-hidden relative">
                    {user.image ? (
                        <img src={user.image} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                        avatarInitials
                    )}
                </div>
                <div>
                    <h1 className="text-2xl font-black">{user.name}</h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Users size={13} />
                        {createdEvents.length} event{createdEvents.length !== 1 ? "s" : ""} created
                    </p>
                    {isOwner && (
                        <div className="mt-3 flex gap-2">
                            <Link
                                href="/profile"
                                className="text-xs font-bold brutal-border brutal-shadow-sm brutal-hover px-3 py-1.5 rounded-md bg-card"
                            >
                                View My Full Profile →
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Created Events */}
            <div>
                <h2 className="mb-6 text-2xl font-black">Created Events</h2>
                {createdEvents.length === 0 ? (
                    <div className="brutal-border brutal-shadow flex flex-col items-center rounded-lg bg-card py-16 text-center">
                        <FileText size={40} className="mb-3 text-muted-foreground" />
                        <p className="text-lg font-bold">No events created yet</p>
                        <p className="text-sm text-muted-foreground">This organizer hasn&apos;t published any events.</p>
                        <Link href="/explore" className="mt-4 inline-flex items-center gap-2 rounded-md bg-brutal-lime px-4 py-2 text-sm font-bold brutal-border brutal-shadow-sm brutal-hover">
                            Explore Events <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col gap-8">
                        {upcomingEvents.length > 0 && (
                            <section>
                                <h3 className="mb-4 text-xl font-black">Upcoming Events</h3>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {upcomingEvents.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            </section>
                        )}
                        
                        {pastEvents.length > 0 && (
                            <section>
                                <h3 className={`mb-4 text-xl font-black text-muted-foreground ${upcomingEvents.length > 0 ? "border-t-2 border-border pt-6" : ""}`}>Past Events</h3>
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 opacity-80">
                                    {pastEvents.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
};

export default PublicProfileClient;
