const cron = require("node-cron");
const moment = require("moment-timezone");
const Event = require("../models/events");
require("dotenv").config();
const { getMessaging } = require("firebase-admin/messaging");

// Define the cron job to run every minute
cron.schedule("* * * * *", async () => {
  const now = moment().tz("Asia/Kolkata");
  const currentDateTime = moment.utc(now.format("YYYY-MM-DDTHH:mm")).toDate();

  try {
    // Update events from "upcoming" or "postponed" to "live"
    const updatedLiveEvents = await Event.updateMany(
      {
        status: { $in: ["upcoming", "postponded"] },
        startDate: { $lte: now.toDate() },
        startTime: { $lte: currentDateTime },
      },
      { status: "live" }
    );

    // Retrieve only events that were updated to "live" in this operation
    const liveEvents = await Event.find({
      status: "live",
      updatedAt: { $gte: now.subtract(1, 'minute').toDate() }, // Fetch only recently updated events
      startDate: { $lte: now.toDate() },
      startTime: { $lte: currentDateTime },
    });

    liveEvents.forEach(async (event) => {
      const topic = `event_${event._id}`;
      const message = {
        notification: {
          title: `Event ${event.name} is now live!`,
          body: `The event ${event.name} has started. Join now!`,
        },
        topic: topic,
        android: {
          notification: {
            image: event.image,
          },
        },
        apns: {
          payload: {
            aps: {
              "mutable-content": 1,
            },
          },
          fcm_options: {
            image: event.image,
          },
        },
      };

      // Send the notification using Firebase Cloud Messaging (FCM)
      await getMessaging().send(message);
    });

    console.log(`Updated ${updatedLiveEvents.modifiedCount} notified: ${liveEvents.length} events to live`);

    // Update events from "live" to "completed"
    const updatedCompletedEvents = await Event.updateMany(
      {
        status: "live",
        endDate: { $lte: now.toDate() },
        endTime: { $lte: currentDateTime },
      },
      { status: "completed" }
    );

    // Retrieve only events that were updated to "completed" in this operation
    const completedEvents = await Event.find({
      status: "completed",
      updatedAt: { $gte: now.subtract(1, 'minute').toDate() }, // Fetch only recently updated events
      endDate: { $lte: now.toDate() },
      endTime: { $lte: currentDateTime },
    });

    completedEvents.forEach(async (event) => {
      const topic = `event_${event._id}`;
      const message = {
        notification: {
          title: `Event ${event.name} is now completed!`,
          body: `The event ${event.name} has ended. Thank you for participating!`,
        },
        topic: topic,
        android: {
          notification: {
            image: event.image,
          },
        },
        apns: {
          payload: {
            aps: {
              "mutable-content": 1,
            },
          },
          fcm_options: {
            image: event.image,
          },
        },
      };

      // Send the notification using Firebase Cloud Messaging (FCM)
      await getMessaging().send(message);
    });

    console.log(`Updated: ${updatedCompletedEvents.modifiedCount} notified: ${completedEvents.length} events to completed`);
  } catch (err) {
    console.error("Error updating events:", err);
  }
});
