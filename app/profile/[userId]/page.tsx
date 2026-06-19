import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getUserCreatedEventsSummary, getUserPublicProfile } from "@/lib/db";
import PublicProfileClient from "./PublicProfileClient";
import { ProfileSkeleton } from "@/components/Skeletons";

export default async function PublicProfilePage({ params }: { params: { userId: string } }) {
    return (
        <Suspense fallback={<ProfileSkeleton />}>
            <PublicProfileContent userId={params.userId} />
        </Suspense>
    );
}

async function PublicProfileContent({ userId }: { userId: string }) {
    const session = await auth.api.getSession({ headers: await headers() });

    const [profile, createdEvents] = await Promise.all([
        getUserPublicProfile(userId),
        getUserCreatedEventsSummary(userId),
    ]);

    if (!profile) notFound();

    const isOwner = session?.user?.id === userId;

    return (
        <PublicProfileClient
            user={profile}
            createdEvents={createdEvents}
            isOwner={isOwner}
        />
    );
}
