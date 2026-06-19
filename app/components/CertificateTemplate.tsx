import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Standard fonts like Times-Roman are built-in for PDF, so no need to register external fonts.
// This prevents any potential global side effects on the website's styles.

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
    },
    background: {
        position: 'absolute',
        minWidth: '100%',
        minHeight: '100%',
        height: '100%',
        width: '100%',
        top: 0,
        left: 0,
    },
    contentAPI: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 80, // Adjust based on template clear area
        paddingTop: 20,
    },
    header: {
        fontSize: 48,
        fontFamily: 'Times-Roman',
        color: '#2a2a2a',
        marginBottom: 10,
        textAlign: 'center',
    },
    subHeader: {
        fontSize: 12,
        fontFamily: 'Times-Roman',
        textTransform: 'uppercase',
        letterSpacing: 2,
        color: '#555555',
        marginBottom: 20,
        textAlign: 'center',
    },
    name: {
        fontSize: 42,
        fontFamily: 'Times-Bold',
        color: '#1a1a1a',
        marginBottom: 15,
        textAlign: 'center',
        paddingBottom: 5,
        borderBottom: '1px solid #999',
        width: '80%',
    },
    bodyText: {
        fontSize: 14,
        fontFamily: 'Times-Roman',
        color: '#444',
        marginBottom: 10,
        textAlign: 'center',
        marginTop: 20,
    },
    eventName: {
        fontSize: 28,
        fontFamily: 'Times-Bold',
        color: '#2a2a2a',
        marginBottom: 20,
        textAlign: 'center',
    },
    footerConfig: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 20,
        paddingHorizontal: 40,
        alignItems: 'flex-end',
    },
    footerItem: {
        flexDirection: 'column',
        alignItems: 'center',
        width: 150,
    },
    footerLine: {
        borderTop: '1px solid #444',
        width: '100%',
        marginBottom: 5,
    },
    footerLabel: {
        fontSize: 12,
        fontFamily: 'Times-Roman',
        color: '#444',
    },
    seal: {
        width: 60,
        height: 60,
        // If we have a seal image, we'd use it. For now, empty or use a placeholder shape if needed.
        // Assuming the background might have a seal spot, or we overlay one.
        // Let's assume the user provided template acts as the border and we just place text.
    }
});

interface CertificateProps {
    userName: string;
    eventName: string;
    date: string;
    organizerName: string;
    templateName?: string;
}

const CertificateTemplate = ({ userName, eventName, date, organizerName, templateName = "default" }: CertificateProps) => {

    // Ensure we have a valid template name
    const bgImage = `/certificates/${templateName}.png`;

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                {/* Background Image Layer */}
                <Image
                    src={bgImage}
                    style={styles.background}
                    fixed
                />

                {/* Content Overlay */}
                <View style={styles.contentAPI}>
                    {/* Spacing from top to align with typical certificate borders */}
                    <View style={{ height: 30 }} />

                    <Text style={styles.header}>Certificate of Participation</Text>
                    <Text style={styles.subHeader}>The following award is given to</Text>

                    <Text style={styles.name}>{userName}</Text>

                    <Text style={styles.bodyText}>For successfully attending and actively participating in</Text>
                    <Text style={styles.eventName}>{eventName}</Text>

                    {/* Footer Section: Date | Seal Space | Organizer */}
                    <View style={styles.footerConfig}>
                        <View style={styles.footerItem}>
                            <Text style={{ fontSize: 14, fontFamily: 'Times-Roman', marginBottom: 5 }}>
                                {new Date(date).toLocaleDateString()}
                            </Text>
                            <View style={styles.footerLine} />
                            <Text style={styles.footerLabel}>Date</Text>
                        </View>

                        {/* Optional Seal Space - Empty View for spacing */}
                        <View style={{ width: 60 }} />

                        <View style={styles.footerItem}>
                            <Text style={{ fontSize: 14, fontFamily: 'Times-Roman', marginBottom: 5 }}>
                                {organizerName}
                            </Text>
                            <View style={styles.footerLine} />
                            <Text style={styles.footerLabel}>Organizer</Text>
                        </View>
                    </View>

                </View>
            </Page>
        </Document>
    );
};

export default CertificateTemplate;
