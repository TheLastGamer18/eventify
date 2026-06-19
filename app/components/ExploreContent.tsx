import { getExploreEvents } from "@/lib/db";
import ExploreClient from "../explore/ExploreClient";

export async function ExploreContent() {
    const events = await getExploreEvents();
    return <ExploreClient events={events} />;
}
