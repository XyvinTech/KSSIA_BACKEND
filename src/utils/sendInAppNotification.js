const { getMessaging } = require("firebase-admin/messaging");

/**
 * Sends in-app notifications to specified FCM tokens.
 *
 * @param {string[]} fcmTokens - Array of FCM tokens to send notifications to.
 * @param {string} title - Title of the notification.
 * @param {string} body - Body of the notification.
 * @param {string|null} media - Optional media URL for the notification.
 * @param {string|null} tag - Optional tag for grouping notifications on Android.
 */

const sendInAppNotification = async (fcmTokens, title, body, media = null, tag = 'general') => {
    try {
        // Ensure there are FCM tokens
        if (!fcmTokens || fcmTokens.length === 0) {
            throw new Error("FCM tokens are required");
        }

        // Use a base tag for grouping (e.g., threadId or userId) and append a unique identifier
        const uniqueTag = `${tag}-${new Date().getTime()}`; // e.g., 'chat-123456789'

        // Construct the notification message
        const message = {
            notification: {
                title,
                body,
            },
            android: {
                notification: {
                    ...(media && { imageUrl: media }), // Image for Android notification
                    ...(tag && { tag }), // Tag for grouping notifications
                },
            },
            apns: {
                payload: {
                    aps: {
                        "mutable-content": 1, // Allows for modification of the notification content
                    },
                },
                fcm_options: {
                    ...(media && { image: media }), // Image for APNs
                },
            },
            data: {
                uniqueTag, // Send the uniqueTag in the data payload
            },
        };

        // Send notification
        let response;
        if (fcmTokens.length === 1) {
            const singleMessage = {
                ...message,
                token: fcmTokens[0],
            };
            response = await getMessaging().send(singleMessage);
            console.log("🚀 ~ Single message sent successfully:", response);
        } else {
            message.tokens = fcmTokens; // Use tokens for multicast
            response = await getMessaging().sendEachForMulticast(message);
            console.log("🚀 ~ Multicast message sent successfully:", response);
            if (response.failureCount > 0) {
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        console.error(`🚀 ~ Token at index ${idx} failed with error:`, resp.error.message);
                    }
                });
            }
        }

    } catch (error) {
        console.error("🚀 ~ sendInAppNotification ~ error:", error.message);
    }
};

module.exports = sendInAppNotification;