import { getTrendingEvents } from "@/lib/db";
import { EventSlider } from "./EventSlider";
import Link from "next/link";
import { FileText, ArrowRight } from "lucide-react";

export async function TrendingEvents() {
    const trendingEvents = await getTrendingEvents();

    if (trendingEvents.length === 0) {
        return (
            <section>
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-black">Trending Events</h2>
                </div>
                <div className="brutal-border brutal-shadow flex flex-col items-center rounded-lg bg-card py-16 px-6 text-center w-full mb-8">
                    <FileText size={40} className="mb-3 text-muted-foreground" />
                    <p className="text-xl font-bold mb-2">No trending events yet</p>
                    <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                        Be the first to create an amazing event and get it trending!
                    </p>
                    <Link href="/create" className="inline-flex items-center gap-2 rounded-md bg-brutal-pink px-4 py-2 text-sm font-bold text-black brutal-border brutal-shadow-sm brutal-hover">
                        Create Event <ArrowRight size={16} />
                    </Link>
                </div>
            </section>
        );
    }

    return <EventSlider events={trendingEvents} />;
}
