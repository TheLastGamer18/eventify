"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Users } from "lucide-react";
import type { EventSummary } from "@/lib/db";

const colorMap: Record<string, string> = {
    "brutal-pink": "bg-brutal-pink",
    "brutal-cyan": "bg-brutal-cyan",
    "brutal-yellow": "bg-brutal-yellow",
    "brutal-lime": "bg-brutal-lime",
    "brutal-orange": "bg-brutal-orange",
};

interface EventSliderProps {
    events: EventSummary[];
}

export const EventSlider = ({ events }: EventSliderProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    return (
        <section>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-2xl font-black">Trending Events</h2>
                <Link href="/explore" className="flex items-center gap-1 text-sm font-bold text-brutal-pink hover:underline">
                    View all <ArrowRight size={14} />
                </Link>
            </div>
            <div className="flex gap-5 overflow-x-auto p-4 scrollbar-none" style={{ scrollbarWidth: "none" }}>
                {events.map((event) => (
                    <Link
                        key={event.id}
                        href={`/event/${event.id}`}
                        className="brutal-border brutal-shadow brutal-hover min-w-[260px] max-w-[280px] shrink-0 overflow-hidden rounded-lg bg-card"
                    >
                        <div className={`h-24 relative ${colorMap[event.bannerColor] || "bg-brutal-pink"}`}>
                            {event.bannerUrl && <img src={event.bannerUrl} alt={event.name} className="absolute inset-0 w-full h-full object-cover" />}
                        </div>
                        <div className="p-4">
                            <h3 className="mb-1 text-base font-extrabold line-clamp-1">{event.name}</h3>
                            <div className="flex items-center gap-3 text-xs font-semibold text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <CalendarDays size={12} />
                                    {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users size={12} />
                                    {event.attendees}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}

                {/* View All Card */}
                <Link
                    href="/explore"
                    className="brutal-border brutal-shadow brutal-hover flex min-w-[200px] shrink-0 flex-col items-center justify-center rounded-lg bg-brutal-lime p-6"
                >
                    <ArrowRight size={32} className="mb-2 text-foreground" />
                    <span className="text-base font-black text-foreground">View All</span>
                </Link>
            </div>
        </section>
    );
};
