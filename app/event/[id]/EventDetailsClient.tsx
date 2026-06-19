"use client";

import { useState, useEffect, useOptimistic, useTransition } from "react";
import Link from "next/link";
import { CalendarDays, Clock, MapPin, Users, ArrowLeft, Loader2, Edit, Trash2, ChevronDown, Copy, CalendarPlus, XCircle, Download } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerAction, unregisterAction, deleteEventAction, approveRegistrationAction, rejectRegistrationAction, getEventRegistrationsAction, cancelEventAction } from "@/actions/events";
import { useRouter } from "next/navigation";
import type { Event } from "@/lib/db";
import { ScrollArea } from "@/components/ui/scroll-area";

// Dynamically import the download button to isolate @react-pdf/renderer from SSR
const CertificateDownloadButton = dynamic(
    () => import("@/components/CertificateDownloadButton"),
    {
        ssr: false,
        loading: () => <button disabled className="brutal-border brutal-shadow brutal-hover flex items-center gap-2 rounded-md bg-brutal-yellow px-6 py-3 text-base font-black text-black opacity-50">Loading...</button>,
    }
);

function loadScript(src: string) {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
}

const colorMap: Record<string, string> = {
    "brutal-pink": "bg-brutal-pink",
    "brutal-cyan": "bg-brutal-cyan",
    "brutal-yellow": "bg-brutal-yellow",
    "brutal-lime": "bg-brutal-lime",
    "brutal-orange": "bg-brutal-orange",
};

interface EventDetailProps {
    event: Event;
    user: { id: string; name: string; email: string } | null;
    registrationStatus: string | null;
    isOrganizer: boolean;
}

const EventDetailClient = ({ event, user, registrationStatus, isOrganizer }: EventDetailProps) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [optimisticStatus, setOptimisticStatus] = useOptimistic(
        registrationStatus,
        (state, newStatus: string | null) => newStatus
    );

    const [deleting, setDeleting] = useState(false);
    const [open, setOpen] = useState(false); // Register dialog
    const [registrations, setRegistrations] = useState<{ id: string; userId: string; userName: string; userEmail: string; status: string; createdAt: string }[]>([]);
    const [hoverPending, setHoverPending] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        if (isOrganizer) {
            getEventRegistrationsAction(event.id).then((res) => setRegistrations(res as any));
        }
    }, [isOrganizer, event.id]);

    const isEventEnded = (date: string, endTime: string) => {
        const eventEnd = new Date(`${date}T${endTime}`);
        return eventEnd < new Date();
    };

    const isEventHappening = (date: string, startTime: string, endTime: string) => {
        const now = new Date();
        const start = new Date(`${date}T${startTime}`);
        const end = new Date(`${date}T${endTime}`);
        return now >= start && now < end;
    };

    const ended = isEventEnded(event.date, event.endTime);
    const happening = isEventHappening(event.date, event.startTime, event.endTime);
    const bannerBg = colorMap[event.bannerColor] || "bg-brutal-pink";

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        const expectedStatus = event.requireApproval ? 'pending' : 'confirmed';

        if (event.isFree !== false || event.price === 0) {
            startTransition(async () => {
                setOptimisticStatus(expectedStatus);
                setOpen(false); // Close dialog immediately for better UX

                try {
                    const res = await registerAction(event.id);
                    if (res.success) {
                        toast.success("Registration Successful!", {
                            description: event.requireApproval
                                ? "Your request has been sent to the organizer."
                                : `You are now registered for ${event.name}.`
                        });
                    } else {
                        toast.error("Registration Failed", {
                            description: res.error || "Could not complete registration."
                        });
                    }
                } catch (err) {
                    toast.error("Error", { description: "Something went wrong." });
                }
            });
        } else {
            // PAID EVENT LOGIC
            setOpen(false); 
            const toastId = toast.loading("Initializing secure payment...");
            
            const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
            if (!res) {
                toast.error("Razorpay SDK failed to load", { id: toastId });
                return;
            }

            try {
                // 1. Create order
                const response = await fetch('/api/create-order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventId: event.id })
                });

                const order = await response.json();

                if (!response.ok) {
                    toast.error("Error", { id: toastId, description: order.error || "Failed to create order" });
                    return;
                }

                toast.dismiss(toastId);

                // 2. Open Razorpay Checkout
                const options = {
                    key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
                    amount: order.amount.toString(),
                    currency: order.currency,
                    name: "Eventify",
                    description: `Registration for ${event.name}`,
                    order_id: order.id,
                    handler: async function (res: any) {
                        const verifyingToast = toast.loading("Verifying payment...");
                        
                        // 3. Verify Payment
                        const verifyRes = await fetch('/api/verify-payment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_payment_id: res.razorpay_payment_id,
                                razorpay_order_id: res.razorpay_order_id,
                                razorpay_signature: res.razorpay_signature,
                                eventId: event.id
                            })
                        });

                        const verifyData = await verifyRes.json();
                        
                        if (verifyRes.ok && verifyData.success) {
                            startTransition(() => {
                                setOptimisticStatus(expectedStatus);
                                toast.success("Payment Successful!", { 
                                    id: verifyingToast,
                                    description: `Your registration for ${event.name} is complete.` 
                                });
                                router.refresh();
                            });
                        } else {
                            toast.error("Payment Verification Failed", { 
                                id: verifyingToast,
                                description: verifyData.error || "We could not verify your payment." 
                            });
                        }
                    },
                    prefill: {
                        name: user?.name,
                        email: user?.email,
                    },
                    theme: {
                        color: "#000000" // Brutalist black
                    },
                };

                const rzp = new (window as any).Razorpay(options);
                rzp.on('payment.failed', function (response: any) {
                    toast.error("Payment Failed", { description: response.error.description });
                });
                rzp.open();

            } catch (err) {
                toast.error("Error", { id: toastId, description: "Something went wrong initializing payment." });
            }
        }
    };


    const handleUnregister = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!confirm("Are you sure you want to unregister?")) return;

        startTransition(async () => {
            setOptimisticStatus(null);

            try {
                const res = await unregisterAction(event.id);
                if (res.success) {
                    toast.success("Unregistered", { description: `You have unregistered from ${event.name}.` });
                } else {
                    toast.error("Error", { description: res.error || "Failed to unregister." });
                }
            } catch (err) {
                toast.error("Error", { description: "Something went wrong." });
            }
        });
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

        setDeleting(true);
        try {
            const res = await deleteEventAction(event.id);
            if (res.success) {
                toast.success("Event Deleted", { description: "The event has been permanently deleted." });
                router.push("/profile");
            } else {
                toast.error("Error", { description: res.error || "Failed to delete event." });
            }
        } catch (err) {
            toast.error("Error", { description: "Something went wrong." });
        } finally {
            setDeleting(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm("Are you sure you want to cancel this event? Attendees will still be able to view it, but registration will be disabled. This cannot be undone.")) return;

        try {
            const res = await cancelEventAction(event.id);
            if (res.success) {
                toast.success("Event Cancelled", { description: "The event has been marked as cancelled." });
                router.refresh();
            } else {
                toast.error("Error", { description: res.error || "Failed to cancel event." });
            }
        } catch (err) {
            toast.error("Error", { description: "Something went wrong." });
        }
    };

    const handleAddToCalendar = () => {
        try {
            const startDT = `${event.date.replace(/-/g, "")}T${event.startTime.replace(":", "")}00`;
            const endDT = event.endTime
                ? `${event.date.replace(/-/g, "")}T${event.endTime.replace(":", "")}00`
                : startDT;
            const location = event.mode === "offline" && event.address ? encodeURIComponent(event.address) : "Online";
            const details = encodeURIComponent(event.description);
            const title = encodeURIComponent(event.name);
            const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDT}/${endDT}&details=${details}&location=${location}`;
            window.open(url, "_blank");
            toast.success("Opening Google Calendar", { description: "Add the event to your calendar." });
        } catch {
            toast.error("Error", { description: "Could not open Google Calendar." });
        }
    };

    const handleCopyLink = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url).then(() => {
            toast.success("Link Copied!", { description: "Event link copied to clipboard." });
        }).catch(() => {
            toast.error("Error", { description: "Could not copy link." });
        });
    };

    const handleExportCSV = () => {
        const confirmed = registrations.filter(r => r.status === "confirmed");
        if (confirmed.length === 0) {
            toast.info("No attendees", { description: "There are no confirmed attendees to export." });
            return;
        }
        const header = ["Name", "Email", "Registered On"];
        const rows = confirmed.map(r => [
            `"${r.userName}"`,
            `"${r.userEmail}"`,
            `"${new Date(r.createdAt).toLocaleDateString()}"`
        ]);
        const csv = [header, ...rows].map(r => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${event.name.replace(/\s+/g, "_")}_attendees.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
        toast.success("CSV Downloaded", { description: `${confirmed.length} attendee(s) exported.` });
    };

    return (
        <main className="mx-auto max-w-site px-6 py-12">
            <Link href="/" className="brutal-border brutal-shadow-sm brutal-hover mb-6 inline-flex items-center gap-2 rounded-md bg-card px-4 py-2 text-sm font-bold">
                <ArrowLeft size={16} /> Back
            </Link>

            {/* Banner */}
            <div className={`brutal-border brutal-shadow relative mb-10 flex h-48 items-end rounded-lg ${bannerBg} p-6 md:h-56 overflow-hidden`}>
                {event.bannerUrl && (
                    <img src={event.bannerUrl} alt="Banner" className="absolute inset-0 w-full h-full object-cover z-0" />
                )}
                {event.bannerUrl && <div className="absolute inset-0 bg-black/20 z-0 pointer-events-none" />}

                {/* Logo — bottom-left */}
                <div className="relative z-10 flex items-end w-full">
                    <div className="brutal-border brutal-shadow-sm flex h-24 w-24 md:h-32 md:w-32 items-center justify-center rounded-lg bg-card text-4xl font-black overflow-hidden relative">
                        {event.logoUrl ? (
                            <img src={event.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                        ) : (
                            event.name.charAt(0)
                        )}
                    </div>
                </div>

                {/* Organizer Controls — absolute top-right, never collides with logo */}
                {isOrganizer && (
                    <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2">
                        {/* Split Edit Button */}
                        <div className="flex items-stretch brutal-border brutal-shadow-sm brutal-hover rounded-md overflow-hidden">
                            <Link href={`/event/${event.id}/edit`} className="flex">
                                <button className="flex items-center gap-2 bg-white px-3 py-2 text-sm font-bold border-r border-black">
                                    <Edit size={16} /> Edit
                                </button>
                            </Link>
                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center bg-white px-2 py-2 font-bold self-stretch">
                                    <ChevronDown size={16} />
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="brutal-border brutal-shadow-sm w-48">
                                    <DropdownMenuItem asChild>
                                        <Link href={`/event/${event.id}/edit`} className="flex items-center gap-2 font-semibold cursor-pointer">
                                            <Edit size={14} /> Edit Event
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleAddToCalendar} className="flex items-center gap-2 font-semibold cursor-pointer">
                                        <CalendarPlus size={14} /> Add to Calendar
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleCopyLink} className="flex items-center gap-2 font-semibold cursor-pointer">
                                        <Copy size={14} /> Copy Event Link
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={handleCancel}
                                        disabled={!!event.cancelled || ended}
                                        className="flex items-center gap-2 font-semibold text-orange-600 focus:text-orange-600 cursor-pointer"
                                    >
                                        <XCircle size={14} /> {event.cancelled ? "Cancelled" : "Cancel Event"}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/* Delete Button */}
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="brutal-border brutal-shadow-sm brutal-hover flex items-center gap-2 rounded-md bg-red-100 px-3 py-2 text-sm font-bold text-red-600 disabled:opacity-70"
                        >
                            {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            Delete
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="mt-8 grid gap-8 md:grid-cols-[1.5fr_1fr]">
                {/* Left — Details */}
                <div className="brutal-border brutal-shadow rounded-lg bg-card p-8">
                    <h1 className="mb-4 text-3xl font-black">{event.name}</h1>
                    <p className="mb-6 leading-relaxed text-muted-foreground whitespace-pre-wrap">{event.description}</p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-lg">
                            <CalendarDays size={24} className="text-brutal-pink" />
                            <span className="font-bold">{new Date(event.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                        </div>
                        <div className="flex items-center gap-3 text-lg">
                            <Clock size={24} className="text-brutal-cyan" />
                            <span className="font-bold">{event.startTime} — {event.endTime}</span>
                        </div>
                        {event.mode === "offline" && event.address && (
                            <div className="flex items-center gap-3 text-lg">
                                <MapPin size={24} className="text-brutal-orange" />
                                <span className="font-bold">{event.address}</span>
                            </div>
                        )}
                        {event.mode === "online" && (
                            <div className="flex items-center gap-3 text-lg">
                                <MapPin size={24} className="text-brutal-orange" />
                                <span className="font-bold">Online Event</span>
                            </div>
                        )}
                        {event.cancelled && (
                            <div className="mt-4">
                                <span className="inline-block brutal-border brutal-shadow-sm rounded-md bg-red-100 text-red-700 px-3 py-1 text-xs font-bold border-2 border-red-400">
                                    Event Cancelled
                                </span>
                            </div>
                        )}
                        {happening && !ended && (
                            <div className="mt-4">
                                <span className="inline-block brutal-border brutal-shadow-sm rounded-md bg-brutal-yellow px-3 py-1 text-xs font-bold text-black border-2 border-black animate-pulse">
                                    Event in Progress
                                </span>
                            </div>
                        )}

                        {!happening && !ended && event.requireApproval && (
                            <div className="mt-4">
                                <span className="inline-block brutal-border brutal-shadow-sm rounded-md bg-brutal-orange px-3 py-1 text-xs font-bold">
                                    Requires Approval
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Certificate Button — only for ended events AND confirmed attendees AND if enabled */}
                    {ended && registrationStatus === 'confirmed' && isClient && event.enableCertificate && (
                        <div className="mt-8">
                            <CertificateDownloadButton
                                userName={user?.name || "Attendee"}
                                eventName={event.name}
                                date={event.date}
                                organizerName={event.organizerName}
                                templateName={event.certificateTemplate}
                            />
                        </div>
                    )}
                </div>

                {/* Right — Registration */}
                <div className="space-y-6">
                    <div className="brutal-border brutal-shadow rounded-lg bg-card p-8">
                        <h2 className="mb-4 text-lg font-extrabold">Registration</h2>

                        {event.isFree ? (
                            <div className="mb-4 text-xl font-black text-green-600">Free</div>
                        ) : (
                            <div className="mb-4 text-xl font-black">₹{event.price?.toFixed(2)}</div>
                        )}

                        <div className="mb-4 flex items-center gap-3">
                            <Users size={18} className="text-brutal-lime" />
                            {event.maxOccupancy > 0 ? (
                                <span className="font-semibold">{event.attendees} / {event.maxOccupancy} attendees</span>
                            ) : (
                                <span className="font-semibold">{event.attendees} attendees</span>
                            )}
                        </div>
                        {event.maxOccupancy > 0 && (
                            <div className="mb-6 h-3 w-full overflow-hidden rounded-full brutal-border">
                                <div
                                    className="h-full bg-brutal-lime transition-all"
                                    style={{ width: `${Math.min(100, (event.attendees / event.maxOccupancy) * 100)}%` }}
                                />
                            </div>
                        )}

                        {event.cancelled ? (
                            <span className="brutal-border brutal-shadow-sm inline-block w-full text-center rounded-md bg-red-100 px-5 py-3 text-sm font-bold text-red-700">
                                Registration Closed — Event Cancelled
                            </span>
                        ) : ended ? (
                            <span className="brutal-border brutal-shadow-sm inline-block w-full text-center rounded-md bg-muted px-5 py-3 text-sm font-bold text-muted-foreground">
                                Event Ended
                            </span>
                        ) : happening ? (
                            <button
                                disabled
                                className="brutal-border brutal-shadow-sm w-full rounded-md bg-brutal-yellow py-3 text-base font-black text-black opacity-80 cursor-not-allowed"
                            >
                                Event in Progress
                            </button>
                        ) : optimisticStatus === 'confirmed' ? (
                            // Fully Registered
                            <div className="space-y-2">
                                <button
                                    onClick={handleUnregister}
                                    disabled={isPending}
                                    className="brutal-border brutal-shadow brutal-hover w-full rounded-md bg-red-100 py-3 text-base font-black text-red-800 disabled:opacity-70"
                                >
                                    {isPending ? "Processing..." : "Unregister"}
                                </button>
                            </div>
                        ) : optimisticStatus === 'pending' ? (
                            // Pending Approval
                            <div className="space-y-3">
                                <button
                                    onMouseEnter={() => setHoverPending(true)}
                                    onMouseLeave={() => setHoverPending(false)}
                                    onClick={hoverPending ? handleUnregister : undefined}
                                    className={`brutal-border w-full rounded-md py-3 text-base font-black transition-colors duration-200 ${hoverPending
                                        ? "bg-red-100 text-red-800 brutal-shadow brutal-hover cursor-pointer"
                                        : "bg-yellow-100 text-yellow-800 opacity-80 cursor-not-allowed"
                                        }`}
                                >
                                    {hoverPending ? "Unregister" : "Pending Approval"}
                                </button>
                                {/* Mobile-only Unregister Button */}
                                <button
                                    onClick={handleUnregister}
                                    className="sm:hidden brutal-border brutal-shadow brutal-hover w-full rounded-md bg-red-100 py-3 text-base font-black text-red-800"
                                >
                                    Unregister
                                </button>
                            </div>
                        ) : (
                            // Not registered
                            isOrganizer ? (
                                <button disabled className="brutal-border w-full rounded-md bg-brutal-pink py-3 text-base font-black text-foreground opacity-50 cursor-not-allowed">
                                    Register Now
                                </button>
                            ) : (
                                <Dialog open={open} onOpenChange={setOpen}>
                                    <DialogTrigger asChild>
                                        <button
                                            onClick={(e) => {
                                                if (!user) {
                                                    e.preventDefault();
                                                    toast.error("Authentication Required", {
                                                        description: "Please sign in to register for events.",
                                                    });
                                                    router.push("/login");
                                                    return;
                                                }
                                            }}
                                            className="brutal-border brutal-shadow brutal-hover w-full rounded-md bg-brutal-pink py-3 text-base font-black text-foreground"
                                        >
                                            {event.requireApproval ? "Request to Join" : "Register Now"}
                                        </button>
                                    </DialogTrigger>
                                    <DialogContent className="brutal-border bg-card">
                                        <DialogHeader>
                                            <DialogTitle className="text-xl font-black">Register for {event.name}</DialogTitle>
                                            <DialogDescription>
                                                {event.requireApproval
                                                    ? "This event requires approval. Your request will be sent to the organizer."
                                                    : "Fill in your details to secure your spot."}
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleRegister} className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Full Name</Label>
                                                <Input id="name" defaultValue={user?.name} disabled required className="brutal-border bg-muted" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email Address</Label>
                                                <Input id="email" type="email" defaultValue={user?.email} disabled required className="brutal-border bg-muted" />
                                            </div>

                                            <DialogFooter>
                                                <button
                                                    type="submit"
                                                    disabled={isPending}
                                                    className="brutal-border brutal-shadow brutal-hover w-full rounded-md bg-brutal-pink py-2 text-base font-black text-foreground disabled:opacity-70"
                                                >
                                                    {isPending ? (
                                                        <span className="flex items-center justify-center gap-2">
                                                            <Loader2 size={16} className="animate-spin" /> {event.requireApproval ? "Requesting..." : "Registering..."}
                                                        </span>
                                                    ) : (event.requireApproval ? "Send Request" : "Confirm Registration")}
                                                </button>
                                            </DialogFooter>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            ))}
                    </div>

                    <div className="brutal-border brutal-shadow rounded-lg bg-card p-8">
                        <h2 className="mb-2 text-lg font-extrabold">Organizer</h2>
                        <Link
                            href={`/profile/${event.organizerId}`}
                            className="font-semibold text-muted-foreground hover:text-foreground hover:underline transition-colors"
                        >
                            {event.organizerName}
                        </Link>
                    </div>

                </div>
            </div>

            {/* Organizer Sections - Full Width Below Main Content */}
            {isOrganizer && (
                <div className="mt-8 space-y-8">
                    {/* Pending Approvals */}
                    {event.requireApproval && (
                        <div className="brutal-border brutal-shadow rounded-lg bg-card p-8">
                            <h2 className="mb-4 text-lg font-extrabold">Pending Approvals</h2>
                            {registrations.filter(r => r.status === 'pending').length === 0 ? (
                                <p className="text-muted-foreground text-sm">No pending requests.</p>
                            ) : (
                                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                                    <div className="space-y-4">
                                        {registrations.filter(r => r.status === 'pending').map((req) => (
                                            <div key={req.userId} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg border bg-muted/50">
                                                <div>
                                                    <p className="font-bold">{req.userName}</p>
                                                    <p className="text-sm text-muted-foreground">{req.userEmail}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">Requested: {new Date(req.status === 'pending' ? Date.now() : 0).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={async () => {
                                                            await approveRegistrationAction(event.id, req.userId);
                                                            // Refresh local list
                                                            setRegistrations(prev => prev.map(p => p.userId === req.userId ? { ...p, status: 'confirmed' } : p));
                                                            toast.success("Approved", { description: `${req.userName} has been approved.` });
                                                        }}
                                                        className="px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-md hover:bg-green-600 transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            await rejectRegistrationAction(event.id, req.userId);
                                                            setRegistrations(prev => prev.filter(p => p.userId !== req.userId));
                                                            toast.info("Denied", { description: `${req.userName} has been denied.` });
                                                        }}
                                                        className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-md hover:bg-red-600 transition-colors"
                                                    >
                                                        Deny
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>
                            )}
                        </div>
                    )}

                    {/* Registered Users */}
                    <div className="brutal-border brutal-shadow rounded-lg bg-card p-8">
                        <div className="mb-4 flex items-center justify-between gap-2">
                            <h2 className="text-lg font-extrabold flex items-center gap-2">
                                <Users size={20} /> Registered Users
                            </h2>
                            <button
                                onClick={handleExportCSV}
                                className="brutal-border brutal-shadow-sm brutal-hover flex items-center gap-1.5 rounded-md bg-brutal-lime px-3 py-1.5 text-xs font-bold text-black"
                            >
                                <Download size={14} /> Export CSV
                            </button>
                        </div>
                        {registrations.filter(r => r.status === 'confirmed').length === 0 ? (
                            <p className="text-muted-foreground text-sm">No registered users yet.</p>
                        ) : (
                            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                                <div className="space-y-3">
                                    {registrations.filter(r => r.status === 'confirmed').map((reg, i) => (
                                        <div key={reg.userId} className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/40 transition-colors">
                                            {/* Avatar */}
                                            <div className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-brutal-cyan text-sm font-black text-black border-2 border-black">
                                                {reg.userName?.charAt(0)?.toUpperCase() ?? "?"}
                                            </div>
                                            {/* Info + meta stacked on mobile, side-by-side on sm+ */}
                                            <div className="flex flex-1 min-w-0 flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                                                <div className="min-w-0">
                                                    <p className="font-bold text-sm truncate">{reg.userName}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{reg.userEmail}</p>
                                                </div>
                                                <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-bold border border-green-200 whitespace-nowrap">
                                                        ✓ Confirmed
                                                    </span>
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {new Date(reg.createdAt || Date.now()).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>
                </div>
            )}
        </main>
    );
};

export default EventDetailClient;
