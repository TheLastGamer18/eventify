import { getEvent } from "@/lib/db";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { EditEventForm } from "./EditEventForm";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const event = await getEvent(id);

    if (!event) {
        notFound();
    }

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user || session.user.id !== event.organizerId) {
        redirect("/");
    }

    return (
        <main className="mx-auto max-w-site px-6 py-12">
            <h1 className="mb-8 text-3xl font-black">Edit Event</h1>
            <EditEventForm event={event} />
        </main>
    );
}
