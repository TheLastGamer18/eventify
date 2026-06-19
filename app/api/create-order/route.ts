import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import * as db from "@/lib/db";
import Razorpay from "razorpay";

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { eventId } = body;

        if (!eventId) {
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        const event = await db.getEvent(eventId);

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        if (event.isFree || !event.price) {
            return NextResponse.json({ error: "Event is free, no payment required" }, { status: 400 });
        }

        const instance = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
            key_secret: process.env.RAZORPAY_KEY_SECRET as string,
        });

        // Razorpay accepts amount in subunits (paise for INR)
        const amountInSubunits = Math.round(event.price * 100);

        const options = {
            amount: amountInSubunits,
            currency: "INR",
            receipt: `rcpt_${event.id}_${session.user.id}`.substring(0, 40),
            notes: {
                eventId,
                userId: session.user.id
            }
        };

        const order = await instance.orders.create(options);

        return NextResponse.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency
        });

    } catch (error: any) {
        console.error("Error creating Razorpay order:", error);
        return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 });
    }
}
