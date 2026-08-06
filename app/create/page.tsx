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
import { createEventAction } from "@/actions/events";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { ImageUploadField } from "@/components/ImageUploadField";
import { CertificateTemplatePicker } from "@/components/CertificateTemplatePicker";

const CreateEvent = () => {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [loading, setLoading] = useState(false);

  const [requireApproval, setRequireApproval] = useState(false);
  const [mode, setMode] = useState<"online" | "offline">("offline");
  const [category, setCategory] = useState<string>("");
  const [ticketType, setTicketType] = useState<"free" | "paid">("free");
  const [bannerUrl, setBannerUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [certificateTemplate, setCertificateTemplate] = useState("default");
  const [certificateTextOffset, setCertificateTextOffset] = useState(0);
  const [enableCertificate, setEnableCertificate] = useState(true);

  const templates = ["default", "template1", "template2", "template3"];

  if (isPending) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={48} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Sign in to Create Event</h1>
        <p className="text-muted-foreground">You need an account to publish events.</p>
        <Link href="/login" className="brutal-border brutal-shadow brutal-hover rounded-md bg-brutal-pink px-6 py-3 text-base font-bold text-foreground">
          Sign In / Sign Up
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("requireApproval", String(requireApproval));
    formData.set("mode", mode);
    formData.set("category", category);
    formData.set("ticketType", ticketType);
    if (bannerUrl) formData.set("bannerUrl", bannerUrl);
    if (logoUrl) formData.set("logoUrl", logoUrl);
    formData.set("certificateTemplate", certificateTemplate);
    formData.set("certificateTextOffset", String(certificateTextOffset));
    formData.set("enableCertificate", String(enableCertificate));

    try {
      const result = await createEventAction(formData);
      if (result.success && result.eventId) {
        toast.success("Event Created!", { description: "Your event has been published successfully." });
        router.push(`/event/${result.eventId}`);
      } else {
        toast.error("Error", { description: "Failed to create event." });
      }
    } catch (error) {
      toast.error("Error", { description: "Something went wrong." });
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "brutal-border bg-card text-card-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-brutal-pink";

  return (
    <main className="mx-auto max-w-site px-6 py-12">
      <h1 className="mb-8 text-3xl font-black">Create New Event</h1>

      <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-[1fr_1.5fr]">
        {/* Left — Image fields */}
        <div className="space-y-6">
          <ImageUploadField
            label="Event Banner"
            imageType="banner"
            value={bannerUrl}
            onChange={setBannerUrl}
            variant="banner"
          />
          <ImageUploadField
            label="Event Logo"
            imageType="logo"
            value={logoUrl}
            onChange={setLogoUrl}
            variant="logo"
          />
        </div>

        {/* Right — Form */}
        <div className="brutal-border brutal-shadow rounded-lg bg-card p-8 space-y-6">
          <div>
            <Label htmlFor="name" className="mb-2 block font-bold">Event Name <span className="text-red-500">*</span></Label>
            <Input name="name" id="name" placeholder="My Awesome Event" required className={inputClass} />
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block font-bold">Description <span className="text-red-500">*</span></Label>
            <Textarea name="description" id="description" placeholder="Tell people what your event is about..." rows={4} required className={inputClass} />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <Label htmlFor="mode" className="mb-2 block font-bold">Event Mode <span className="text-red-500">*</span></Label>
              <Select value={mode} onValueChange={(v) => setMode(v as "online" | "offline")}>
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
              <Select value={category} onValueChange={setCategory} required>
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
                min={new Date().toISOString().split("T")[0]}
                required
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="startTime" className="mb-2 block font-bold">Start Time <span className="text-red-500">*</span></Label>
              <Input name="startTime" id="startTime" type="time" defaultValue="06:00" required className={inputClass} />
            </div>
            <div>
              <Label htmlFor="endTime" className="mb-2 block font-bold">End Time</Label>
              <Input name="endTime" id="endTime" type="time" defaultValue="06:00" className={inputClass} />
            </div>
          </div>

          {mode === "offline" && (
            <div>
              <Label htmlFor="address" className="mb-2 block font-bold">Address <span className="text-red-500">*</span></Label>
              <Input name="address" id="address" placeholder="123 Event Street, City" required className={inputClass} />
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label className="mb-2 block font-bold">Ticket Type <span className="text-red-500">*</span></Label>
              <Select value={ticketType} onValueChange={(v) => setTicketType(v as "free" | "paid")}>
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
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="maxOccupancy" className="mb-2 block font-bold">Max Occupancy</Label>
              <Input name="maxOccupancy" id="maxOccupancy" type="number" min="0" max="100000" placeholder="100" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-2 block font-bold opacity-0">Options</Label>
              <div className="flex flex-col gap-3 sm:h-10 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-3">
                  <Switch checked={requireApproval} onCheckedChange={setRequireApproval} id="approval" />
                  <Label htmlFor="approval" className="font-bold text-sm sm:text-base">Require Approval</Label>
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={enableCertificate}
                    onCheckedChange={setEnableCertificate}
                    id="certificate"
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
            {loading ? "Publishing..." : "Publish Event"}
          </button>
        </div>
      </form>

      {/* Certificate Templates Section - Full Width */}
      {enableCertificate && (
        <div className="mt-12 brutal-border brutal-shadow rounded-lg bg-card p-8">
          <h2 className="mb-2 text-2xl font-black">Choose Certificate Design</h2>
          <p className="mb-6 text-sm text-muted-foreground">The style selected will be used to generate a participation certificate upon event completion.</p>
          <CertificateTemplatePicker
            value={certificateTemplate}
            onChange={setCertificateTemplate}
            textOffset={certificateTextOffset}
            onTextOffsetChange={setCertificateTextOffset}
          />
        </div>
      )}
    </main>
  );
};

export default CreateEvent;
