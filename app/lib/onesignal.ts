import * as OneSignal from "@onesignal/node-onesignal";

function createOneSignalClient() {
    const configuration = OneSignal.createConfiguration({
        restApiKey: process.env.ONESIGNAL_REST_API_KEY || "",
    });

    return new OneSignal.DefaultApi(configuration);
}

export async function sendPushNotification(message: string, title?: string, userIds?: string[], url?: string) {
    if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || !process.env.ONESIGNAL_REST_API_KEY) {
        console.warn("OneSignal is not configured. Missing API keys.");
        return;
    }

    const client = createOneSignalClient();
    const notification = new OneSignal.Notification();
    
    notification.app_id = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    notification.contents = {
        en: message
    };
    
    if (title) {
        notification.headings = {
            en: title
        };
    }
    
    if (url) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        notification.url = url.startsWith("http") ? url : `${baseUrl}${url}`;
    }

    if (userIds && userIds.length > 0) {
        notification.include_aliases = {
            external_id: userIds // The frontend links session user id using OneSignal.login, which sets their 'external_id' alias
        };
        // node-onesignal requires setting the target channel if using aliases
        notification.target_channel = "push";
    } else {
        notification.included_segments = ["Subscribed Users"]; // Broadcast to all
    }

    try {
        const response = await client.createNotification(notification);
        console.log("OneSignal push notification sent:", response);
        return response;
    } catch (e: any) {
        console.error("Error sending OneSignal push notification:", e);
    }
}
