"use server";

import { sendPushNotification } from "@/lib/onesignal";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import * as db from "@/lib/db";
import { revalidatePath } from "next/cache";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
const STORAGE_BUCKET = "event-images";

/**
 * Extracts the storage object path from a Supabase public URL.
 * Returns null if the URL doesn't belong to our Supabase project
 * (e.g. external URLs like Unsplash should not be deleted).
 */
function extractStoragePath(url: string | undefined | null): string | null {
    if (!url || !SUPABASE_URL) return null;
    // Supabase public URL pattern:
    // <SUPABASE_URL>/storage/v1/object/public/<bucket>/<path>
    const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return null;
    return url.slice(idx + marker.length);
}

/**
 * Deletes one or more files from Supabase Storage.
 * Silently ignores paths that are null or empty.
 */
async function deleteStorageFiles(paths: (string | null)[]): Promise<void> {
    const validPaths = paths.filter((p): p is string => Boolean(p));
    if (validPaths.length === 0) return;
    try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
        const { error } = await supabase.storage
            .from(STORAGE_BUCKET)
            .remove(validPaths);
        if (error) {
            console.error("[Storage] Failed to delete files:", error.message);
        }
    } catch (err) {
        console.error("[Storage] Unexpected error deleting files:", err);
    }
}

async function processRazorpayRefund(paymentId?: string | null) {
    if (!paymentId) return;
    try {
        const rzp = new Razorpay({
            key_id: "rzp_test_bmAIujfHxGMYoe",
            key_secret: "nW2B6ZGESl8rusGUEuHsdmbl",
        });
        await rzp.payments.refund(paymentId, { speed: "normal" });
    } catch (e: any) {
        console.error(`Refund failed for payment ${paymentId}:`, e.message);
    }
}

export async function createEventAction(formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const address = formData.get("address") as string;
    const maxOccupancyRaw = formData.get("maxOccupancy") as string;
    const maxOccupancy = maxOccupancyRaw && maxOccupancyRaw.trim() !== "" ? parseInt(maxOccupancyRaw, 10) : 0;
    const requireApproval = formData.get("requireApproval") === "true";
    const mode = formData.get("mode") as "online" | "offline";
    const category = formData.get("category") as string;
    const ticketType = formData.get("ticketType") as string;
    const isFree = ticketType === "free";
    const priceRaw = formData.get("price") as string;
    const price = isFree ? 0 : (priceRaw && priceRaw.trim() !== "" ? parseFloat(priceRaw) : 0);
    const bannerUrl = formData.get("bannerUrl") as string;
    const logoUrl = formData.get("logoUrl") as string;
    const certificateTemplate = (formData.get("certificateTemplate") as string) || "default";
    const enableCertificate = formData.get("enableCertificate") === "true";
    const certificateTextOffset = Math.max(-150, Math.min(200, parseInt((formData.get("certificateTextOffset") as string) || "0", 10) || 0));

    // Basic validation
    if (!name || !description || !date || !startTime || !category) {
        throw new Error("Missing required fields");
    }

    const eventDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (eventDate < today) {
        throw new Error("Cannot create event in the past");
    }

    if (maxOccupancy > 100000) {
        throw new Error("Max occupancy cannot exceed 100,000");
    }

    if (price > 100000) {
        throw new Error("Price cannot exceed 100,000");
    }

    const newEvent = await db.createEvent({
        name,
        description,
        date,
        startTime,
        endTime,
        address: mode === "offline" ? address : undefined,
        maxOccupancy,
        requireApproval,
        organizerId: session.user.id,
        organizerName: session.user.name,
        bannerColor: "brutal-pink", // Default for now
        bannerUrl: bannerUrl || undefined,
        logoUrl: logoUrl || undefined,
        mode,
        category,
        isFree,
        price,
        certificateTemplate,
        certificateTextOffset,
        enableCertificate,
    });

    revalidatePath("/");
    revalidatePath("/explore");
    revalidatePath("/profile");

    // Return the ID so client can redirect
    return { success: true, eventId: newEvent.id };
}

export async function updateEventAction(eventId: string, formData: FormData) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    // Verify organizer (omitted for speed, but good practice invovles checking organizerId)
    const existingEvent = await db.getEvent(eventId);
    if (!existingEvent || existingEvent.organizerId !== session.user.id) {
        throw new Error("Unauthorized");
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const startTime = formData.get("startTime") as string;
    const endTime = formData.get("endTime") as string;
    const address = formData.get("address") as string;
    const maxOccupancyRaw = formData.get("maxOccupancy") as string;
    const maxOccupancy = maxOccupancyRaw && maxOccupancyRaw.trim() !== "" ? parseInt(maxOccupancyRaw, 10) : 0;
    const requireApproval = formData.get("requireApproval") === "true";
    const mode = formData.get("mode") as "online" | "offline";
    const category = formData.get("category") as string;
    const ticketType = formData.get("ticketType") as string;
    const isFree = ticketType === "free";
    const priceRaw = formData.get("price") as string;
    const price = isFree ? 0 : (priceRaw && priceRaw.trim() !== "" ? parseFloat(priceRaw) : 0);
    const bannerUrl = formData.get("bannerUrl") as string;
    const logoUrl = formData.get("logoUrl") as string;
    const certificateTemplate = (formData.get("certificateTemplate") as string) || "default";
    const certificateTextOffset = Math.max(-150, Math.min(200, parseInt((formData.get("certificateTextOffset") as string) || "0", 10) || 0));

    if (maxOccupancy > 100000) {
        throw new Error("Max occupancy cannot exceed 100,000");
    }

    if (price > 100000) {
        throw new Error("Price cannot exceed 100,000");
    }

    const updates: any = {
        name,
        description,
        date,
        startTime,
        endTime,
        maxOccupancy,
        requireApproval,
        mode,
        category,
        isFree,
        price,
        bannerUrl: bannerUrl || null,
        logoUrl: logoUrl || null,
        certificateTemplate,
        certificateTextOffset,
        enableCertificate: formData.get("enableCertificate") === "true",
    };

    if (mode === "offline") updates.address = address;

    try {
        await db.updateEvent(eventId, updates);
    } catch (dbErr: any) {
        const msg = dbErr?.message ?? String(dbErr);
        console.error("[updateEventAction] db.updateEvent failed:", msg);
        return { success: false, error: `DB error: ${msg}` };
    }

    // Notify registered attendees about event updates
    if (existingEvent) {
        const registrations = await db.getEventRegistrations(eventId);
        const attendeeIds = registrations.map(r => r.userId);
        if (attendeeIds.length > 0) {
            await sendPushNotification(
                `"${existingEvent.name}" was just updated — tap to see what changed.`,
                "Event Updated 📣",
                attendeeIds,
                `/event/${eventId}`
            );
        }
    }

    revalidatePath(`/event/${eventId}`);
    revalidatePath("/profile");

    return { success: true };
}


export async function deleteEventAction(eventId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const event = await db.getEvent(eventId);
    if (event && event.organizerId === session.user.id) {
        const registrations = await db.getEventRegistrations(eventId);

        // 1. Process bulk refunds for paid events before anything is deleted
        if (!event.isFree) {
            for (const reg of registrations) {
                if (reg.razorpayPaymentId) {
                    await processRazorpayRefund(reg.razorpayPaymentId);
                }
            }
        }

        const attendeeIds = registrations.map(r => r.userId);

        // 2. Capture storage paths BEFORE deleting the event row
        const bannerPath = extractStoragePath(event.bannerUrl);
        const logoPath = extractStoragePath(event.logoUrl);

        // 3. Explicitly delete all registration rows for this event.
        //    This is safe even if the DB has ON DELETE CASCADE — it's a no-op in that case.
        await db.deleteEventRegistrations(eventId);

        // 4. Delete the event row itself
        await db.deleteEvent(eventId);

        // 5. Clean up uploaded images from Supabase Storage (fire-and-forget style,
        //    errors are logged but don't fail the action)
        await deleteStorageFiles([bannerPath, logoPath]);

        // 6. Notify attendees
        if (attendeeIds.length > 0) {
            await sendPushNotification(
                `"${event.name}" has been deleted by the organizer.`,
                "Event Deleted ❌",
                attendeeIds
            );
        }

        revalidatePath("/");
        revalidatePath("/explore");
        revalidatePath("/profile");
        return { success: true };
    }

    return { success: false, error: "Unauthorized" };
}

export async function cancelEventAction(eventId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    const event = await db.getEvent(eventId);
    if (event && event.organizerId === session.user.id) {
        await db.cancelEvent(eventId);

        const registrations = await db.getEventRegistrations(eventId);

        // Process bulk refunds if paid
        if (!event.isFree) {
            for (const reg of registrations) {
                if (reg.razorpayPaymentId) {
                    await processRazorpayRefund(reg.razorpayPaymentId);
                }
            }
        }

        const attendeeIds = registrations.map(r => r.userId);
        if (attendeeIds.length > 0) {
            await sendPushNotification(
                `"${event.name}" has been cancelled by the organizer.`,
                "Event Cancelled 🚫",
                attendeeIds,
                `/event/${eventId}`
            );
        }

        revalidatePath(`/event/${eventId}`);
        revalidatePath("/");
        revalidatePath("/explore");
        revalidatePath("/profile");
        return { success: true };
    }

    return { success: false, error: "Unauthorized" };
}


export async function registerAction(eventId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    try {
        const event = await db.getEvent(eventId);
        if (!event) throw new Error("Event not found");

        // Check if event has ended
        const eventEnd = new Date(`${event.date}T${event.endTime}`);
        if (eventEnd < new Date()) {
            return { success: false, error: "Registration closed: Event has ended" };
        }

        // Check occupancy (maxOccupancy === 0 means limitless)
        if (event.maxOccupancy > 0 && event.attendees >= event.maxOccupancy) {
            return { success: false, error: "Event is fully booked" };
        }

        const status = event.requireApproval ? 'pending' : 'confirmed';

        const success = await db.registerForEvent(eventId, {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
        }, status);

        if (!success) {
            return { success: false, error: "You are already registered for this event" };
        }

        // Notify the organizer
        await sendPushNotification(
            `${session.user.name} just registered for "${event.name}".`,
            "New Attendee! 🎉",
            [event.organizerId],
            `/event/${eventId}`
        );

        // Notify the attendee with a confirmation
        if (status === 'confirmed') {
            await sendPushNotification(
                `You're in for "${event.name}"! See you there 🎟️`,
                "Registration Confirmed ✅",
                [session.user.id],
                `/event/${eventId}`
            );
        } else {
            await sendPushNotification(
                `Your spot at "${event.name}" is pending approval.`,
                "Registration Pending ⏳",
                [session.user.id],
                `/event/${eventId}`
            );
        }

        revalidatePath(`/event/${eventId}`);
        revalidatePath("/profile");
        return { success: true };
    } catch (e) {
        console.error("Registration error:", e);
        return { success: false, error: "An unexpected error occurred during registration" };
    }
}

export async function unregisterAction(eventId: string) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized");
    }

    try {
        const event = await db.getEvent(eventId);
        if (event && !event.isFree) {
            const reg = await db.getRegistration(eventId, session.user.id);
            if (reg?.razorpayPaymentId) {
                await processRazorpayRefund(reg.razorpayPaymentId);
            }
        }

        await db.unregisterFromEvent(eventId, session.user.id);
        revalidatePath(`/event/${eventId}`);
        revalidatePath("/profile");
        return { success: true };
    } catch (e) {
        return { success: false, error: "Unregistration failed" };
    }
}

export async function approveRegistrationAction(eventId: string, userId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");

    const event = await db.getEvent(eventId);
    if (!event || event.organizerId !== session.user.id) throw new Error("Unauthorized");

    await db.updateRegistrationStatus(eventId, userId, 'confirmed');

    // Notify the user
    await sendPushNotification(
        `Your spot at "${event.name}" has been approved! 🎉`,
        "Registration Approved ✅",
        [userId],
        `/event/${eventId}`
    );
    revalidatePath(`/event/${eventId}`);
    return { success: true };
}

export async function rejectRegistrationAction(eventId: string, userId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");

    const event = await db.getEvent(eventId);
    if (!event || event.organizerId !== session.user.id) throw new Error("Unauthorized");

    if (!event.isFree) {
        const reg = await db.getRegistration(eventId, userId);
        if (reg?.razorpayPaymentId) {
            await processRazorpayRefund(reg.razorpayPaymentId);
        }
    }

    await db.unregisterFromEvent(eventId, userId); // Rejecting essentially removes them

    // Notify the user
    await sendPushNotification(
        `Your registration for "${event.name}" was declined.`,
        "Registration Declined ❌",
        [userId]
    );
    revalidatePath(`/event/${eventId}`);
    return { success: true };
}

export async function getEventRegistrationsAction(eventId: string) {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) throw new Error("Unauthorized");

    const event = await db.getEvent(eventId);
    if (!event || event.organizerId !== session.user.id) throw new Error("Unauthorized");

    return await db.getEventRegistrations(eventId);
}
