import { Suspense } from "react";
import { ProfileContent } from "@/components/ProfileContent";
import { ProfileSkeleton } from "@/components/Skeletons";

export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </Suspense>
  );
}
