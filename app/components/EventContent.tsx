import { getEvent, getUserRegistrationStatus } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import EventDetailClient from "../event/[id]/EventDetailsClient";

export async function EventContent({ id }: { id: string }) {
    const event = await getEvent(id);

    if (!event) {
        notFound();
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const user = session?.user || null;
    const registrationStatus = user ? await getUserRegistrationStatus(id, user.id) : null;
    const isOrganizer = user?.id === event.organizerId;

    return (
        <EventDetailClient
            event={event}
            user={user ? { id: user.id, name: user.name, email: user.email } : null}
            registrationStatus={registrationStatus}
            isOrganizer={isOrganizer}
        />
    );
}
