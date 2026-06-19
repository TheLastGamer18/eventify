import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getOrganizerAnalytics } from "@/lib/db";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/login");
    }

    const data = await getOrganizerAnalytics(session.user.id);

    return <DashboardClient data={data} user={session.user} />;
}
