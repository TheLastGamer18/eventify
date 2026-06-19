import Link from "next/link";
import { CalendarPlus, UserCheck, History } from "lucide-react";
import { Suspense } from "react";
import { TrendingEvents } from "@/components/TrendingEvents";
import { EventSliderSkeleton } from "@/components/Skeletons";

const features = [
  {
    title: "Create Events",
    description: "Design and publish your own events with full control over details, branding, and attendee management.",
    icon: CalendarPlus,
    color: "bg-brutal-pink",
    href: "/create",
    cta: "Start Creating",
  },
  {
    title: "Register for Events",
    description: "Browse upcoming events and secure your spot instantly. Stay informed with real-time availability.",
    icon: UserCheck,
    color: "bg-brutal-cyan",
    href: "/explore",
    cta: "Explore Events",
  },
  {
    title: "View Event History",
    description: "Track your past events, download certificates, and revisit the experiences that shaped your journey.",
    icon: History,
    color: "bg-brutal-yellow",
    href: "/profile?tab=registered",
    cta: "View History",
  },
];

export const revalidate = 60;

export default function Index() {
  return (
    <main className="mx-auto max-w-site px-6 py-16">
      {/* Hero */}
      <section className="mb-16 text-center">
        <h1 className="mb-4 text-5xl font-black leading-tight tracking-tight md:text-6xl">
          Discover{" "}
          <span className="brutal-border brutal-shadow-sm inline-block rounded-md bg-brutal-pink px-3 py-1 text-primary-foreground">
            events
          </span>{" "}
          near you
        </h1>
        <p className="mx-auto max-w-xl text-lg text-muted-foreground">
          Create, join, and celebrate events with a community that moves fast and builds bold.
        </p>
      </section>

      {/* Feature Cards */}
      <section className="mb-16 grid gap-8 md:grid-cols-3">
        {features.map((f) => (
          <Link
            key={f.title}
            href={f.href}
            className="brutal-border brutal-shadow brutal-hover flex flex-col items-start rounded-lg bg-card p-8"
          >
            <div className={`brutal-border brutal-shadow-sm mb-5 rounded-md ${f.color} p-3`}>
              <f.icon size={28} className=" text-black" />
            </div>
            <h2 className="mb-2 text-xl font-extrabold">{f.title}</h2>
            <p className="mb-6 flex-1 text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            <span className="brutal-border brutal-shadow-sm rounded-md bg-primary px-5 py-2 text-sm font-bold text-primary-foreground">
              {f.cta}
            </span>
          </Link>
        ))}
      </section>

      {/* Event Slider */}
      <Suspense fallback={<EventSliderSkeleton />}>
        <TrendingEvents />
      </Suspense>
    </main>
  );
}

