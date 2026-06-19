import { Suspense } from "react";
import { ExploreContent } from "@/components/ExploreContent";
import { ExploreSkeleton } from "@/components/Skeletons";

export const revalidate = 60;

export default function ExplorePage() {
  return (
    <Suspense fallback={<ExploreSkeleton />}>
      <ExploreContent />
    </Suspense>
  );
}
