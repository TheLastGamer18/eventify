"use client";

import { PDFDownloadLink } from "@react-pdf/renderer";
import CertificateTemplate from "@/components/CertificateTemplate";
import { Award } from "lucide-react";

interface CertificateDownloadButtonProps {
    userName: string;
    eventName: string;
    date: string;
    organizerName: string;
    templateName?: string;
}

const CertificateDownloadButton = ({ userName, eventName, date, organizerName, templateName }: CertificateDownloadButtonProps) => {
    return (
        <PDFDownloadLink
            document={
                <CertificateTemplate
                    userName={userName}
                    eventName={eventName}
                    date={date}
                    organizerName={organizerName}
                    templateName={templateName}
                />
            }
            fileName={`${eventName.replace(/\s+/g, '_')}_Certificate.pdf`}
        >
            {({ blob, url, loading, error }) => (
                <button
                    disabled={loading}
                    className="brutal-border brutal-shadow brutal-hover flex items-center gap-2 rounded-md bg-brutal-yellow px-6 py-3 text-base font-black text-black disabled:opacity-50"
                >
                    <Award size={20} className="text-black" />
                    {loading ? "Preparing Certificate..." : "Download Certificate"}
                </button>
            )}
        </PDFDownloadLink>
    );
};

export default CertificateDownloadButton;
