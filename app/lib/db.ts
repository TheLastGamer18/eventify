import { Pool } from "pg";
import { revalidatePath } from "next/cache";

export const pool = new Pool({
    connectionString: process.env.EVENT_DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: {
        rejectUnauthorized: false,
    },
});

export type Event = {
    id: string;
    name: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    address?: string;
    maxOccupancy: number;
    attendees: number;
    requireApproval: boolean;
    organizerId: string;
    organizerName: string;
    bannerColor: string;
    bannerUrl?: string; // We'll store this but UI might use colorMap fallback
    logoUrl?: string;
    mode: "online" | "offline";
    category: string;
    isFree?: boolean; // DB has default true
    price?: number;
    registrationStatus?: string; // "pending", "confirmed", etc.
    certificateTemplate?: string;
    enableCertificate: boolean;
    cancelled?: boolean;
};

// ... Events ...

export type EventSummary = Pick<Event, "id" | "name" | "date" | "endTime" | "bannerColor" | "bannerUrl" | "attendees" | "isFree" | "price" | "registrationStatus" | "maxOccupancy" | "organizerId" | "requireApproval">;

export async function createEvent(eventData: Omit<Event, "id" | "attendees">) {
    const client = await pool.connect();
    try {
        const query = `
      INSERT INTO events (
        name, description, date, start_time, end_time, address, max_occupancy, 
        require_approval, organizer_id, organizer_name, banner_color, mode, category, 
        is_free, price, banner_url, logo_url, certificate_template, enable_certificate
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING id
    `;
        const values = [
            eventData.name,
            eventData.description,
            eventData.date,
            eventData.startTime,
            eventData.endTime,
            eventData.address,
            eventData.maxOccupancy,
            eventData.requireApproval,
            eventData.organizerId,
            eventData.organizerName,
            eventData.bannerColor,
            eventData.mode,
            eventData.category,
            eventData.isFree,
            eventData.price,
            eventData.bannerUrl,
            eventData.logoUrl,
            eventData.certificateTemplate || 'default',
            eventData.enableCertificate !== undefined ? eventData.enableCertificate : true,
        ];
        const res = await client.query(query, values);
        return res.rows[0];
    } finally {
        client.release();
    }
}

export async function getEvents(limit: number = 50, offset: number = 0) {
    const res = await pool.query(`SELECT * FROM events ORDER BY created_at DESC LIMIT $1 OFFSET $2`, [limit, offset]);
    return res.rows.map(mapDbEvent);
}

export async function getTrendingEvents(): Promise<EventSummary[]> {
    const res = await pool.query(`
        SELECT id, name, date, end_time, banner_color, banner_url, attendees, is_free, price, max_occupancy, organizer_id, require_approval
        FROM events 
        WHERE date >= TO_CHAR(CURRENT_DATE, 'YYYY-MM-DD')
        ORDER BY attendees DESC, created_at DESC 
        LIMIT 20
    `);
    
    const now = new Date();
    const upcomingEvents = res.rows.filter(row => {
        try {
            const eventEnd = new Date(`${row.date}T${row.end_time || '23:59'}`);
            return eventEnd >= now;
        } catch (e) {
            return true;
        }
    }).slice(0, 5);

    return upcomingEvents.map(row => ({
        id: row.id,
        name: row.name,
        date: row.date,
        endTime: row.end_time,
        bannerColor: row.banner_color,
        bannerUrl: row.banner_url,
        attendees: row.attendees,
        isFree: row.is_free,
        price: row.price,
        maxOccupancy: row.max_occupancy,
        organizerId: row.organizer_id,
        requireApproval: row.require_approval
    }));
}

export async function getEvent(id: string) {
    const res = await pool.query(`SELECT * FROM events WHERE id = $1`, [id]);
    return res.rows[0] ? mapDbEvent(res.rows[0]) : null;
}

export async function getUserCreatedEvents(userId: string) {
    const res = await pool.query(`SELECT * FROM events WHERE organizer_id = $1 ORDER BY created_at DESC`, [userId]);
    return res.rows.map(mapDbEvent);
}

export async function getUserCreatedEventsSummary(userId: string): Promise<EventSummary[]> {
    const res = await pool.query(`
        SELECT id, name, date, end_time, banner_color, banner_url, attendees, is_free, price, max_occupancy, organizer_id, require_approval
        FROM events 
        WHERE organizer_id = $1 
        ORDER BY created_at DESC
    `, [userId]);
    return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        date: row.date,
        endTime: row.end_time,
        bannerColor: row.banner_color,
        bannerUrl: row.banner_url,
        attendees: row.attendees,
        isFree: row.is_free,
        price: row.price,
        maxOccupancy: row.max_occupancy,
        organizerId: row.organizer_id,
        requireApproval: row.require_approval
    }));
}

export async function updateEvent(id: string, updates: Partial<Event>) {
    // Construct dynamic update query
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    Object.entries(updates).forEach(([key, value]) => {
        // skip undefined or restricted fields
        if (value === undefined || key === "id" || key === "organizerId") return;

        // Map camelCase to snake_case
        const dbKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        fields.push(`${dbKey} = $${idx}`);
        values.push(value);
        idx++;
    });

    if (fields.length === 0) return null;

    values.push(id);
    const query = `UPDATE events SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`;

    const res = await pool.query(query, values);
    return res.rows[0] ? mapDbEvent(res.rows[0]) : null;
}

export async function deleteEvent(id: string) {
    await pool.query(`DELETE FROM events WHERE id = $1`, [id]);
}

export async function cancelEvent(id: string) {
    await pool.query(`UPDATE events SET cancelled = true WHERE id = $1`, [id]);
}

export async function getUserPublicProfile(userId: string): Promise<{ id: string; name: string; image: string | null } | null> {
    const res = await pool.query(`SELECT id, name, image FROM "user" WHERE id = $1`, [userId]);
    return res.rows[0] ?? null;
}

// --- Registrations ---

export async function registerForEvent(
    eventId: string, 
    user: { id: string; name: string; email: string }, 
    status: string = 'confirmed',
    razorpayData?: { paymentId: string; orderId: string }
) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Check if already registered
        const existing = await client.query(
            `SELECT 1 FROM registrations WHERE event_id = $1 AND user_id = $2`,
            [eventId, user.id]
        );
        if (existing.rowCount && existing.rowCount > 0) {
            await client.query("ROLLBACK");
            return false; // Already registered
        }

        // Insert registration
        await client.query(
            `INSERT INTO registrations (event_id, user_id, user_name, user_email, status, razorpay_payment_id, razorpay_order_id) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [eventId, user.id, user.name, user.email, status, razorpayData?.paymentId || null, razorpayData?.orderId || null]
        );

        // Increment attendees ONLY if confirmed
        if (status === 'confirmed') {
            await client.query(`UPDATE events SET attendees = attendees + 1 WHERE id = $1`, [eventId]);
        }

        await client.query("COMMIT");
        return true;
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
}

export async function getEventRegistrations(eventId: string) {
    const res = await pool.query(`SELECT * FROM registrations WHERE event_id = $1 ORDER BY created_at DESC`, [eventId]);
    return res.rows.map(row => ({
        id: row.id,
        eventId: row.event_id,
        userId: row.user_id,
        userName: row.user_name,
        userEmail: row.user_email,
        status: row.status,
        createdAt: row.created_at,
        razorpayPaymentId: row.razorpay_payment_id,
        razorpayOrderId: row.razorpay_order_id,
    }));
}

export async function getRegistration(eventId: string, userId: string) {
    const res = await pool.query(`SELECT * FROM registrations WHERE event_id = $1 AND user_id = $2`, [eventId, userId]);
    if (res.rows.length === 0) return null;
    const row = res.rows[0];
    return {
        id: row.id,
        eventId: row.event_id,
        userId: row.user_id,
        userName: row.user_name,
        userEmail: row.user_email,
        status: row.status,
        createdAt: row.created_at,
        razorpayPaymentId: row.razorpay_payment_id,
        razorpayOrderId: row.razorpay_order_id,
    };
}

export async function getExploreEvents() {
    const res = await pool.query(`
        SELECT id, name, description, date, start_time, end_time, banner_color, banner_url, attendees, max_occupancy, is_free, price, category, mode 
        FROM events 
        ORDER BY created_at DESC
    `);
    return res.rows.map(mapDbEvent);
}

export async function updateRegistrationStatus(eventId: string, userId: string, status: string) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const currentRes = await client.query(
            `SELECT status FROM registrations WHERE event_id = $1 AND user_id = $2`,
            [eventId, userId]
        );

        if (currentRes.rowCount === 0) {
            await client.query("ROLLBACK");
            return false;
        }

        const currentStatus = currentRes.rows[0].status;

        // Update status
        await client.query(
            `UPDATE registrations SET status = $1 WHERE event_id = $2 AND user_id = $3`,
            [status, eventId, userId]
        );

        // Adjust attendee count based on status change
        if (currentStatus !== 'confirmed' && status === 'confirmed') {
            await client.query(`UPDATE events SET attendees = attendees + 1 WHERE id = $1`, [eventId]);
        } else if (currentStatus === 'confirmed' && status !== 'confirmed') {
            await client.query(`UPDATE events SET attendees = GREATEST(0, attendees - 1) WHERE id = $1`, [eventId]);
        }

        await client.query("COMMIT");
        return true;
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
}

export async function unregisterFromEvent(eventId: string, userId: string) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Get current status before deleting
        const currentRes = await client.query(
            `SELECT status FROM registrations WHERE event_id = $1 AND user_id = $2`,
            [eventId, userId]
        );

        if (currentRes.rowCount === 0) {
            await client.query("ROLLBACK");
            return false;
        }

        const currentStatus = currentRes.rows[0].status;

        // Delete registration
        await client.query(
            `DELETE FROM registrations WHERE event_id = $1 AND user_id = $2`,
            [eventId, userId]
        );

        if (currentStatus === 'confirmed') {
            // Decrement attendees
            await client.query(`UPDATE events SET attendees = GREATEST(0, attendees - 1) WHERE id = $1`, [eventId]);
        }

        await client.query("COMMIT");
        return true;
    } catch (e) {
        await client.query("ROLLBACK");
        throw e;
    } finally {
        client.release();
    }
}

export async function getUserRegistrationStatus(eventId: string, userId: string) {
    const res = await pool.query(
        `SELECT status FROM registrations WHERE event_id = $1 AND user_id = $2`,
        [eventId, userId]
    );
    return res.rows[0]?.status || null;
}

export async function getUserRegisteredEvents(userId: string) {
    // Join registrations with events
    const query = `
    SELECT e.*, r.status as registration_status
    FROM registrations r
    JOIN events e ON r.event_id = e.id
    WHERE r.user_id = $1
    ORDER BY r.created_at DESC
  `;
    const res = await pool.query(query, [userId]);
    return res.rows.map(mapDbEvent);
}

export async function getUserRegisteredEventsSummary(userId: string): Promise<EventSummary[]> {
    // Join registrations with events, fetch only summary fields
    const query = `
    SELECT e.id, e.name, e.date, e.end_time, e.banner_color, e.banner_url, e.attendees, e.is_free, e.price, e.max_occupancy, e.organizer_id, e.require_approval, r.status as registration_status
    FROM registrations r
    JOIN events e ON r.event_id = e.id
    WHERE r.user_id = $1
    ORDER BY r.created_at DESC
  `;
    const res = await pool.query(query, [userId]);
    return res.rows.map(row => ({
        id: row.id,
        name: row.name,
        date: row.date,
        endTime: row.end_time,
        bannerColor: row.banner_color,
        bannerUrl: row.banner_url,
        attendees: row.attendees,
        isFree: row.is_free,
        price: row.price,
        maxOccupancy: row.max_occupancy,
        organizerId: row.organizer_id,
        requireApproval: row.require_approval,
        registrationStatus: row.registration_status,
    }));
}

// Helper to map DB columns (snake_case) to Event object (camelCase)
function mapDbEvent(row: any): Event {
    return {
        id: row.id,
        name: row.name,
        description: row.description,
        date: row.date,
        startTime: row.start_time,
        endTime: row.end_time,
        address: row.address,
        maxOccupancy: row.max_occupancy,
        attendees: row.attendees,
        requireApproval: row.require_approval,
        organizerId: row.organizer_id,
        organizerName: row.organizer_name,
        bannerColor: row.banner_color,
        bannerUrl: row.banner_url,
        logoUrl: row.logo_url,
        mode: row.mode,
        category: row.category,
        isFree: row.is_free,
        price: row.price,
        registrationStatus: row.registration_status,
        certificateTemplate: row.certificate_template,
        enableCertificate: row.enable_certificate,
        cancelled: row.cancelled ?? false,
    };
}

export type OrganizerAnalytics = {
    totalEvents: number;
    totalAttendees: number;
    totalRevenue: number;
    timeline: { date: string; registrations: number }[];
    topEvents: { name: string; attendees: number; maxOccupancy: number }[];
    recentRegistrations: {
        id: string;
        userName: string;
        userEmail: string;
        eventName: string;
        status: string;
        createdAt: string;
    }[];
};

export async function getOrganizerAnalytics(userId: string): Promise<OrganizerAnalytics> {
    const client = await pool.connect();
    try {
        // 1. Basic aggregates: total events, total attendees, total revenue
        // We calculate revenue directly from events where we sum (attendees * price) for paid events.
        // Or alternatively, from registrations joined with events. It's safer from registrations:
        const aggregatesQuery = `
            SELECT 
                COUNT(DISTINCT e.id) as total_events,
                COUNT(DISTINCT r.id) FILTER (WHERE r.status = 'confirmed') as total_attendees,
                SUM(e.price) FILTER (WHERE r.status = 'confirmed' AND e.is_free = false) as total_revenue
            FROM events e
            LEFT JOIN registrations r ON e.id = r.event_id
            WHERE e.organizer_id = $1
        `;
        const aggRes = await client.query(aggregatesQuery, [userId]);
        const totalEvents = parseInt(aggRes.rows[0]?.total_events || '0', 10);
        const totalAttendees = parseInt(aggRes.rows[0]?.total_attendees || '0', 10);
        const totalRevenue = parseFloat(aggRes.rows[0]?.total_revenue || '0');

        // 2. Timeline (Registrations per day for the last 30 days)
        const timelineQuery = `
            SELECT 
                DATE(r.created_at) as date,
                COUNT(r.id) as registrations
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            WHERE e.organizer_id = $1
              AND r.created_at >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(r.created_at)
            ORDER BY DATE(r.created_at) ASC
        `;
        const timelineRes = await client.query(timelineQuery, [userId]);

        // Format timeline to ensure string dates
        const rawTimeline = timelineRes.rows.map(r => ({
            date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            registrations: parseInt(r.registrations, 10)
        }));

        // Fill in missing days for the last 30 days to make chart look continuous
        const timeline = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const existing = rawTimeline.find(t => t.date === dateStr);
            timeline.push({
                date: dateStr,
                registrations: existing ? existing.registrations : 0
            });
        }

        // 3. Top events (for bar chart)
        const topEventsQuery = `
            SELECT name, attendees, max_occupancy
            FROM events
            WHERE organizer_id = $1
            ORDER BY attendees DESC
            LIMIT 5
        `;
        const topEventsRes = await client.query(topEventsQuery, [userId]);
        const topEvents = topEventsRes.rows.map(r => ({
            name: r.name,
            attendees: r.attendees,
            maxOccupancy: r.max_occupancy,
        }));

        // 4. Recent registrations
        const recentRegsQuery = `
            SELECT 
                r.id, r.user_name, r.user_email, r.status, r.created_at, e.name as event_name
            FROM registrations r
            JOIN events e ON r.event_id = e.id
            WHERE e.organizer_id = $1
            ORDER BY r.created_at DESC
            LIMIT 5
        `;
        const recentRegsRes = await client.query(recentRegsQuery, [userId]);
        const recentRegistrations = recentRegsRes.rows.map(r => ({
            id: r.id,
            userName: r.user_name,
            userEmail: r.user_email,
            eventName: r.event_name,
            status: r.status,
            createdAt: r.created_at,
        }));

        return {
            totalEvents,
            totalAttendees,
            totalRevenue,
            timeline,
            topEvents,
            recentRegistrations
        };
    } finally {
        client.release();
    }
}
