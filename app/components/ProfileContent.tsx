import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUserCreatedEventsSummary, getUserRegisteredEventsSummary } from "@/lib/db";
import ProfileClient from "../profile/ProfileClient";

export async function ProfileContent() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    const [createdEvents, registeredEvents] = await Promise.all([
        getUserCreatedEventsSummary(session.user.id),
        getUserRegisteredEventsSummary(session.user.id),
    ]);

    return (
        <ProfileClient
            user={{
                name: session.user.name,
                email: session.user.email,
                image: session.user.image,
            }}
            createdEvents={createdEvents}
            registeredEvents={registeredEvents}
        />
    );
}
