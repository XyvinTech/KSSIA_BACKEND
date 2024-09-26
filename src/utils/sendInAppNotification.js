const { getMessaging } = require("firebase-admin/messaging");

const sendInAppNotification = async (fcmTokens, title, body, media = null) => {
    try {
        if (!fcmTokens || fcmTokens.length === 0) {
            throw new Error("FCM tokens are required");
        }

        const message = {
            notification: {
                title,
                body,
            },
            android: {
                notification: {
                    ...(media && {
                        imageUrl: media
                    }),
                },
            },
            apns: {
                payload: {
                    aps: {
                        "mutable-content": 1,
                    },
                },
                fcm_options: {
                    ...(media && {
                        image: media
                    }),
                },
            },
        };

        if(fcmTokens.length === 1){
            const singleMessage = {
                ...message,
                token: fcmTokens[0]
            };
            const response =  await getMessaging().send(singleMessage);
            console.log("🚀 ~ Single message sent successfully:", response);
        }

        else{
            message.tokens = fcmTokens;
            const response = await getMessaging().sendEachForMulticast(message);
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