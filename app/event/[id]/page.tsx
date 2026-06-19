import { Suspense } from "react";
import { EventContent } from "@/components/EventContent";
import { EventDetailsSkeleton } from "@/components/Skeletons";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <Suspense fallback={<EventDetailsSkeleton />}>
      <EventContent id={id} />
    </Suspense>
  );
}

