"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarDays, Users, Search } from "lucide-react";
import type { Event } from "@/lib/db";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const colorMap: Record<string, string> = {
    "brutal-pink": "bg-brutal-pink",
    "brutal-cyan": "bg-brutal-cyan",
    "brutal-yellow": "bg-brutal-yellow",
    "brutal-lime": "bg-brutal-lime",
    "brutal-orange": "bg-brutal-orange",
};

interface ExploreClientProps {
    events: Event[];
}

const ExploreClient = ({ events }: ExploreClientProps) => {
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [modeFilter, setModeFilter] = useState("all");
    const [priceFilter, setPriceFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFilter, setDateFilter] = useState<"all" | "week" | "month">("all");

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const filteredEvents = events.filter((event) => {
        if (categoryFilter !== "all" && event.category !== categoryFilter) return false;
        if (modeFilter !== "all" && event.mode !== modeFilter) return false;
        if (priceFilter === "free" && !event.isFree) return false;
        if (priceFilter === "paid" && event.isFree) return false;
        if (searchQuery.trim() && !event.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        if (dateFilter !== "all") {
            const d = new Date(event.date);
            if (dateFilter === "week" && (d < startOfWeek || d > endOfWeek)) return false;
            if (dateFilter === "month" && (d < startOfMonth || d > endOfMonth)) return false;
        }
        return true;
    });

    const upcomingEvents = filteredEvents.filter(event => new Date(`${event.date}T${event.endTime || '23:59'}`) >= now);
    const pastEvents = filteredEvents.filter(event => new Date(`${event.date}T${event.endTime || '23:59'}`) < now);

    const EventCard = ({ event }: { event: Event }) => (
        <Link
            href={`/event/${event.id}`}
            className="brutal-border brutal-shadow brutal-hover overflow-hidden rounded-lg bg-card flex flex-col h-full"
        >
            <div className={`h-28 relative shrink-0 ${colorMap[event.bannerColor] || "bg-brutal-pink"}`}>
                {event.bannerUrl && <img src={event.bannerUrl} alt={event.name} className="absolute inset-0 w-full h-full object-cover" />}
            </div>
            <div className="p-5 flex flex-col flex-1">
                <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="text-lg font-extrabold line-clamp-2">{event.name}</h3>
                    {event.isFree ? (
                        <span className="shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">Free</span>
                    ) : (
                        <span className="shrink-0 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-800">₹{event.price}</span>
                    )}
                </div>

                <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {event.description}
                </p>
                <div className="mt-auto flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                    <span className="flex items-center gap-1">
                        <CalendarDays size={14} />
                        {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users size={14} />
                        {event.attendees}/{event.maxOccupancy || '∞'}
                    </span>
                </div>
            </div>
        </Link>
    );

    return (
        <main className="mx-auto max-w-site px-6 py-12">
            <h1 className="mb-2 text-4xl font-black">Explore Events</h1>
            <p className="mb-10 text-muted-foreground">Browse all upcoming and past events in the community.</p>

            {/* Filters + Search */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end">
                <div className="w-full sm:w-[200px]">
                    <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</Label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="brutal-border bg-card">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="tech">Tech</SelectItem>
                            <SelectItem value="cultural">Cultural</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="arts">Arts</SelectItem>
                            <SelectItem value="sports">Sports</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="health">Health &amp; Wellness</SelectItem>
                            <SelectItem value="community">Community</SelectItem>
                            <SelectItem value="entertainment">Entertainment</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full sm:w-[200px]">
                    <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Mode</Label>
                    <Select value={modeFilter} onValueChange={setModeFilter}>
                        <SelectTrigger className="brutal-border bg-card">
                            <SelectValue placeholder="All Modes" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Modes</SelectItem>
                            <SelectItem value="online">Online</SelectItem>
                            <SelectItem value="offline">In-Person</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="w-full sm:w-[200px]">
                    <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Price</Label>
                    <Select value={priceFilter} onValueChange={setPriceFilter}>
                        <SelectTrigger className="brutal-border bg-card">
                            <SelectValue placeholder="Any Price" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any Price</SelectItem>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Search — pushed to the far right */}
                <div className="w-full sm:ml-auto sm:w-[260px]">
                    <Label className="mb-2 block text-xs font-bold uppercase tracking-wider text-muted-foreground">Search</Label>
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search events..."
                            className="brutal-border bg-card pl-9"
                        />
                    </div>
                </div>
            </div>

            {/* Date Range Pills */}
            <div className="mb-8 flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mr-1">When:</span>
                {(["all", "week", "month"] as const).map((d) => (
                    <button
                        key={d}
                        onClick={() => setDateFilter(d)}
                        className={`brutal-border px-4 py-1.5 rounded-full text-sm font-bold transition-all ${dateFilter === d
                                ? "bg-brutal-pink text-foreground brutal-shadow-sm"
                                : "bg-card text-muted-foreground hover:bg-secondary"
                            }`}
                    >
                        {d === "all" ? "All Time" : d === "week" ? "This Week" : "This Month"}
                    </button>
                ))}
            </div>

            <div>
                {filteredEvents.length > 0 ? (
                    <div className="flex flex-col gap-12">
                        {upcomingEvents.length > 0 && (
                            <section>
                                <h2 className="mb-6 text-2xl font-black">Upcoming Events</h2>
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                    {upcomingEvents.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            </section>
                        )}
                        
                        {pastEvents.length > 0 && (
                            <section>
                                <h2 className="mb-6 text-2xl font-black text-muted-foreground border-t-2 border-border pt-8">Past Events</h2>
                                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 opacity-80">
                                    {pastEvents.map((event) => (
                                        <EventCard key={event.id} event={event} />
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                ) : (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        <p className="text-lg font-medium">No events found matching your filters.</p>
                        <button
                            onClick={() => {
                                setCategoryFilter("all");
                                setModeFilter("all");
                                setPriceFilter("all");
                                setSearchQuery("");
                                setDateFilter("all");
                            }}
                            className="mt-4 text-sm font-bold text-brutal-pink hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </main>
    );
};

export default ExploreClient;
