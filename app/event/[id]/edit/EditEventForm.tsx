"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateEventAction } from "@/actions/events";
import { useRouter } from "next/navigation";
import type { Event } from "@/lib/db";
import { ImageUploadField } from "@/components/ImageUploadField";

interface EditEventFormProps {
    event: Event;
}

export const EditEventForm = ({ event }: EditEventFormProps) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [requireApproval, setRequireApproval] = useState(event.requireApproval);
    const [mode, setMode] = useState<"online" | "offline">(event.mode);
    const [category, setCategory] = useState<string>(event.category);
    const [ticketType, setTicketType] = useState<"free" | "paid">(event.isFree ? "free" : "paid");
    const [price, setPrice] = useState(event.price ? String(event.price) : "");
    const [bannerUrl, setBannerUrl] = useState(event.bannerUrl || "");
    const [logoUrl, setLogoUrl] = useState(event.logoUrl || "");
    const [certificateTemplate, setCertificateTemplate] = useState(event.certificateTemplate || "default");
    const [enableCertificate, setEnableCertificate] = useState(event.enableCertificate !== undefined ? event.enableCertificate : true);

    const templates = ["default", "template1", "template2", "template3"];

    // Check if event has ended
    const isEventEnded = event.date ? (() => {
        const endDateTimeString = `${event.date}T${event.endTime || "23:59"}`;
        return new Date() > new Date(endDateTimeString);
    })() : false;


    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        // If event ended, input fields are disabled and won't be in formData.
        // We must manually reinject existing values for non-state-controlled fields.
        if (isEventEnded) {
            formData.set("name", event.name);
            formData.set("description", event.description);
            formData.set("date", event.date);
            formData.set("startTime", event.startTime);
            if (event.endTime) formData.set("endTime", event.endTime);
            if (event.address) formData.set("address", event.address);
            if (event.maxOccupancy) formData.set("maxOccupancy", String(event.maxOccupancy));
            if (event.price) formData.set("price", String(event.price));
        }

        formData.set("requireApproval", String(requireApproval));
        formData.set("mode", mode);
        formData.set("category", category);
        formData.set("ticketType", ticketType);
        if (bannerUrl) formData.set("bannerUrl", bannerUrl);
        if (logoUrl) formData.set("logoUrl", logoUrl);
        formData.set("certificateTemplate", certificateTemplate);
        formData.set("enableCertificate", String(enableCertificate));

        try {
            const result = await updateEventAction(event.id, formData);
            if (result.success) {
                toast.success("Event Updated!", { description: "Your event details have been updated." });
                router.push(`/event/${event.id}`);
                router.refresh();
            } else {
                toast.error("Error", { description: "Failed to update event." });
            }
        } catch (error) {
            toast.error("Error", { description: "Something went wrong." });
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "brutal-border bg-card text-card-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-brutal-pink";

    return (
        <>
            <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-[1fr_1.5fr]">
                {/* Left — Image fields */}
                <div className="space-y-6">
                    <ImageUploadField
                        label="Event Banner"
                        imageType="banner"
                        value={bannerUrl}
                        onChange={setBannerUrl}
                        disabled={isEventEnded}
                        variant="banner"
                    />
                    <ImageUploadField
                        label="Event Logo"
                        imageType="logo"
                        value={logoUrl}
                        onChange={setLogoUrl}
                        disabled={isEventEnded}
                        variant="logo"
                    />
                </div>

                {/* Right — Form */}
                <div className="brutal-border brutal-shadow rounded-lg bg-card p-8 space-y-6">
                    <div>
                        <Label htmlFor="name" className="mb-2 block font-bold">Event Name <span className="text-red-500">*</span></Label>
                        <Input name="name" id="name" defaultValue={event.name} required className={inputClass} disabled={isEventEnded} />
                    </div>

                    <div>
                        <Label htmlFor="description" className="mb-2 block font-bold">Description <span className="text-red-500">*</span></Label>
                        <Textarea name="description" id="description" defaultValue={event.description} rows={4} required className={inputClass} disabled={isEventEnded} />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="mode" className="mb-2 block font-bold">Event Mode <span className="text-red-500">*</span></Label>
                            <Select value={mode} onValueChange={(v) => setMode(v as "online" | "offline")} disabled={isEventEnded}>
                                <SelectTrigger className={inputClass}>
                                    <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="offline">In-Person</SelectItem>
                                    <SelectItem value="online">Online</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="category" className="mb-2 block font-bold">Category <span className="text-red-500">*</span></Label>
                            <Select value={category} onValueChange={setCategory} required disabled={isEventEnded}>
                                <SelectTrigger className={inputClass}>
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="tech">Tech</SelectItem>
                                    <SelectItem value="cultural">Cultural</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                    <SelectItem value="arts">Arts</SelectItem>
                                    <SelectItem value="sports">Sports</SelectItem>
                                    <SelectItem value="education">Education</SelectItem>
                                    <SelectItem value="health">Health &amp; Wellness</SelectItem>
                                    <SelectItem value="community">Community</SelectItem>
                                    <SelectItem value="entertainment">Entertainment</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <Label htmlFor="date" className="mb-2 block font-bold">Date <span className="text-red-500">*</span></Label>
                            <Input
                                name="date"
                                id="date"
                                type="date"
                                defaultValue={event.date}
                                min={new Date().toISOString().split("T")[0]}
                                required
                                className={inputClass}
                                disabled={isEventEnded}
                            />
                        </div>
                        <div>
                            <Label htmlFor="startTime" className="mb-2 block font-bold">Start Time <span className="text-red-500">*</span></Label>
                            <Input name="startTime" id="startTime" type="time" defaultValue={event.startTime} required className={inputClass} disabled={isEventEnded} />
                        </div>
                        <div>
                            <Label htmlFor="endTime" className="mb-2 block font-bold">End Time</Label>
                            <Input name="endTime" id="endTime" type="time" defaultValue={event.endTime} className={inputClass} disabled={isEventEnded} />
                        </div>
                    </div>

                    {mode === "offline" && (
                        <div>
                            <Label htmlFor="address" className="mb-2 block font-bold">Address <span className="text-red-500">*</span></Label>
                            <Input name="address" id="address" defaultValue={event.address} placeholder="123 Event Street, City" required className={inputClass} disabled={isEventEnded} />
                        </div>
                    )}

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label className="mb-2 block font-bold">Ticket Type <span className="text-red-500">*</span></Label>
                            <Select value={ticketType} onValueChange={(v) => setTicketType(v as "free" | "paid")} disabled={isEventEnded}>
                                <SelectTrigger className={inputClass}>
                                    <SelectValue placeholder="Select ticket type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="free">Free</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {ticketType === "paid" && (
                            <div className="flex flex-col items-end">
                                <div className="w-full sm:w-2/3">
                                    <Label htmlFor="price" className="mb-2 block font-bold">Ticket Price (₹) <span className="text-red-500">*</span></Label>
                                    <Input
                                        name="price"
                                        id="price"
                                        type="number"
                                        min="0"
                                        max="100000"
                                        placeholder="0.00"
                                        step="0.01"
                                        required
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className={inputClass}
                                        disabled={isEventEnded}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <Label htmlFor="maxOccupancy" className="mb-2 block font-bold">Max Occupancy</Label>
                            <Input name="maxOccupancy" id="maxOccupancy" type="number" min="0" max="100000" defaultValue={event.maxOccupancy} placeholder="100" className={inputClass} disabled={isEventEnded} />
                        </div>
                        <div className="sm:col-span-2">
                            <Label className="mb-2 block font-bold opacity-0">Options</Label>
                            <div className="flex flex-col gap-3 sm:h-10 sm:flex-row sm:items-center sm:gap-6">
                                <div className="flex items-center gap-3">
                                    <Switch checked={requireApproval} onCheckedChange={setRequireApproval} id="approval" disabled={isEventEnded} />
                                    <Label htmlFor="approval" className="font-bold text-sm sm:text-base">Require Approval</Label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Switch
                                        checked={enableCertificate}
                                        onCheckedChange={setEnableCertificate}
                                        id="certificate"
                                        disabled={isEventEnded}
                                    />
                                    <Label htmlFor="certificate" className="font-bold text-sm sm:text-base">Generate Certificates</Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="brutal-border brutal-shadow brutal-hover w-full rounded-md bg-brutal-pink py-3 text-base font-black text-foreground disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        {loading ? "Updating..." : "Update Event"}
                    </button>
                </div>
            </form>

            {/* Certificate Templates Section */}
            {enableCertificate && (
                <div className="mt-12 brutal-border brutal-shadow rounded-lg bg-card p-8">
                    <h2 className="mb-2 text-2xl font-black">Choose Certificate Design</h2>
                    <p className="mb-6 text-sm text-muted-foreground">The style selected will be used to generate a participation certificate upon event completion.</p>
                    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-4">
                        {templates.map((template) => (
                            <div
                                key={template}
                                className={`cursor-pointer rounded-lg p-2 transition-all overflow-hidden ${certificateTemplate === template
                                    ? "ring-4 ring-brutal-pink scale-105"
                                    : "brutal-border hover:opacity-80 opacity-60"
                                    }`}
                                onClick={() => setCertificateTemplate(template)}
                            >
                                <div className="aspect-[1.414] w-full overflow-hidden rounded-md bg-secondary relative">
                                    <img
                                        src={`/certificates/${template}.png`}
                                        alt={`${template} preview`}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = "https://placehold.co/600x400?text=Template+Preview";
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};
