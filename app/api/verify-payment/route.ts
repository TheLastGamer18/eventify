import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import * as db from "@/lib/db";
import crypto from "crypto";
import { sendPushNotification } from "@/lib/onesignal";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, eventId } = body;

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !eventId) {
            return NextResponse.json({ error: "Missing required payment details" }, { status: 400 });
        }

        const event = await db.getEvent(eventId);

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Verify Signature
        const generatedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || "")
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generatedSignature !== razorpay_signature) {
            return NextResponse.json({ error: "Payment verification failed: Invalid signature" }, { status: 400 });
        }

        // Signature logic matches, payment is authentic. 
        // We now register the user for the event.
        const status = event.requireApproval ? 'pending' : 'confirmed';

        const success = await db.registerForEvent(
            eventId, 
            {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email,
            }, 
            status,
            { paymentId: razorpay_payment_id, orderId: razorpay_order_id }
        );

        if (!success) {
            return NextResponse.json({ error: "You are already registered for this event" }, { status: 400 });
        }

        // Notify the organizer via OneSignal
        await sendPushNotification(
            `${session.user.name} just paid & registered for "${event.name}".`,
            "New Paid Attendee! 🎉💸",
            [event.organizerId],
            `/event/${eventId}`
        );

        // Notify the attendee with a payment confirmation
        if (status === 'confirmed') {
            await sendPushNotification(
                `Payment confirmed! You're in for "${event.name}" 🎟️`,
                "Booking Confirmed ✅",
                [session.user.id],
                `/event/${eventId}`
            );
        } else {
            await sendPushNotification(
                `Payment received for "${event.name}". Pending approval.`,
                "Payment Received ⏳",
                [session.user.id],
                `/event/${eventId}`
            );
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error verifying payment:", error);
        return NextResponse.json({ error: error.message || "Failed to verify payment" }, { status: 500 });
    }
}
