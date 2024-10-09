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
    // Update events from "upcoming" or "postponded" to "live"
    const liveEvents = await Event.updateMany(
      {
        status: { $in: ["upcoming", "postponded"] },
        startDate: { $lte: now.toDate() },
        startTime: { $lte: currentDateTime },
      },
      { status: "live" },
      { new: true }
    );

    try {
      liveEvents.forEach( async event => {
        const topic = `event_${event._id}`;
        const message = {
          notification: {
            title: `Event ${event.name} is now live!`,
            body: `The event ${event.name} has started. Join now!`,
          },
          topic: topic,
          android: {
            notification: {
              imageUrl: event.image,
            },
          },
          apns: {
            payload: {
              aps: {
                "mutable-content": 1,
              },
            },
            fcm_options: {
              imageUrl: event.image,
            },
          },
        };
        
        // Send the notification using the Firebase Cloud Messaging (FCM) service
        await getMessaging().send(message);

      });  
    } catch (error) {
      console.log(`error creating notification : ${error}`);
    }

    console.log(`Updated ${liveEvents.modifiedCount} events to live`);

    // Update events from "live" to "completed"
    const completedEvents = await Event.updateMany(
      {
        status: "live",
        endDate: { $lte: now.toDate() },
        endTime: { $lte: currentDateTime },
      },
      { status: "completed" },
      { new: true }
    );

    try {
      completedEvents.forEach(async event => {
        const topic = `event_${event._id}`;
        const message = {
          notification: {
            title: `Event ${event.name} is now completed!`,
            body: `The event ${event.name} has ended. Thank you for participating!`,
          },
          topic: topic,
          android: {
            notification: {
              imageUrl: event.image,
            },
          },
          apns: {
            payload: {
              aps: {
                "mutable-content": 1,
              },
            },
            fcm_options: {
              imageUrl: event.image,
            },
          },
        };
        
        // Send the notification using the Firebase Cloud Messaging (FCM) service
        await getMessaging().send(message);
      
      });  
    } catch (error) {
      console.log(`error creating notification : ${error}`);
    }

    console.log(`Updated ${completedEvents.modifiedCount} events to completed`);
  } catch (err) {
    console.error("Error updating events:", err);
  }
});