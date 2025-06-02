const { getMessaging } = require("firebase-admin/messaging");

/**
 * Sends in-app notifications to specified FCM tokens.
 *
 * @param {string[]} fcmTokens - Array of FCM tokens to send notifications to.
 * @param {string} title - Title of the notification.
 * @param {string} body - Body of the notification.
 * @param {string|null} media - Optional media URL for the notification.
 * @param {string|null} tag - Optional tag for grouping notifications on Android.
 * @param {string|null} id - Optional userId for navigating to a specific chat.
 */
const sendInAppNotification = async (
  fcmTokens,
  title,
  body,
  media = null,
  tag = "general",
  id = null
) => {
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
          ...(media && { imageUrl: encodeURI(media) }),
          ...(tag && { tag }),
          clickAction: "FLUTTER_NOTIFICATION_CLICK", // Important for handling clicks
        },
      },
      apns: {
        payload: {
          aps: {
            "mutable-content": 1,
          },
        },
        fcm_options: {
          ...(media && { image: media }),
        },
      },
      data: {
        screen: tag,
        ...(id && { id }),
      },
    };

    let response;
    if (fcmTokens.length === 1) {
      response = await getMessaging().send({ ...message, token: fcmTokens[0] });
      console.log("🚀 ~ Single message sent successfully:", response);
    } else {
      message.tokens = fcmTokens;
      response = await getMessaging().sendEachForMulticast(message);
      console.log("🚀 ~ Multicast message sent successfully:", response);

      if (response.failureCount > 0) {
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            console.error(
              `🚀 ~ Token at index ${idx} failed with error:`,
              resp.error.message
            );
          }
        });
      }
    }
  } catch (error) {
    console.error("🚀 ~ sendInAppNotification ~ error:", error.message);
  }
};

module.exports = sendInAppNotification;
