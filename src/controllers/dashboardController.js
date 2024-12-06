const Event = require("../models/events");
const User = require("../models/user");
const Product = require("../models/products");
const News = require("../models/news");
const Promotion = require("../models/promotions");
const Payment = require("../models/payment");
const Notification = require("../models/notifications");
const Requirements = require("../models/requirements");
const responseHandler = require("../helpers/responseHandler");

// Count the total number of users
exports.countUsers = async (req, res) => {
  try {
    const userCount = await User.countDocuments({
      status: { $in: ["active", "suspended", "inactive", "notice"] },
    });

    return responseHandler(res, 200, `Total number of users`, userCount);
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error getting total number of users: ${err.message}`
    );
  }
};

// Count the total number of active users
exports.countActiveUsers = async (req, res) => {
  try {
    const userCount = await User.countDocuments({
      status: { $in: ["active", "notice"] },
    });

    return responseHandler(res, 200, `Total number of active users`, userCount);
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error getting total number of active users: ${err.message}`
    );
  }
};

// Count the total number of active premium users
exports.countActivePremiumUsers = async (req, res) => {
  try {
    const userCount = await User.countDocuments({
      status: { $in: ["active", "notice"] },
      subscription: "premium",
    });

    return responseHandler(res, 200, `Total number of active users`, userCount);
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error getting total number of active premium users: ${err.message}`
    );
  }
};

// Count the total number of suspended users
exports.countSuspendedUsers = async (req, res) => {
  try {
    const userCount = await User.countDocuments({
      status: { $in: ["suspended"] },
    });

    return responseHandler(
      res,
      200,
      `Total number of suspended users`,
      userCount
    );
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error getting total number of suspended users: ${err.message}`
    );
  }
};

// Get the total revenu of a month
exports.getMonthlyRevenue = async (req, res) => {
  try {
    const { month, year } = req.params;

    // Start and end of the month
    const startDate = new Date(year, month - 1, 1); // Month is 0-based in JavaScript
    const endDate = new Date(year, month, 0); // The last day of the month

    // Aggregation to calculate total combined revenue for the month
    const totalRevenueData = await Payment.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate }, // Filter by the date field (the date on the bill)
          status: { $in: ["accepted", "expiring", "expired"] }, // Only count valid payments
        },
      },
      {
        $group: {
          _id: null, // No grouping, just sum all records
          totalRevenue: { $sum: "$amount" }, // Sum the 'amount' field
        },
      },
    ]);

    // Extract the total revenue from the result
    const totalRevenue =
      totalRevenueData.length > 0 ? totalRevenueData[0].totalRevenue : 0;
    return responseHandler(
      res,
      200,
      `Total combined revenue for the month`,
      totalRevenue
    );
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error calculating total revenue for the month: ${err.message}`
    );
  }
};

// Get the total revenu of a month in individual category
exports.getMonthlyRevenueIndividual = async (req, res) => {
  try {
    const { month, year, category } = req.params;

    // Start and end of the month
    const startDate = new Date(year, month - 1, 1); // Month is 0-based in JavaScript
    const endDate = new Date(year, month, 0); // The last day of the month

    // Aggregation to calculate total combined revenue for the month
    const totalRevenueData = await Payment.aggregate([
      {
        $match: {
          date: { $gte: startDate, $lt: endDate }, // Filter by the date field (the date on the bill)
          status: { $in: ["accepted", "expiring", "expired"] }, // Only count valid payments
          category: category, // Filter by category (either 'app' or 'membership')
        },
      },
      {
        $group: {
          _id: null, // No grouping, just sum all records
          totalRevenue: { $sum: "$amount" }, // Sum the 'amount' field
        },
      },
    ]);

    // Extract the total revenue from the result
    const totalRevenue =
      totalRevenueData.length > 0 ? totalRevenueData[0].totalRevenue : 0;
    return responseHandler(
      res,
      200,
      `Total ${category} revenue for the month`,
      totalRevenue
    );
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error calculating total revenue for the month: ${err.message}`
    );
  }
};

// Get the total number of products
exports.getNumberOfProducts = async (req, res) => {
  try {
    const products = await Product.countDocuments({
      status: "accepted",
    });
    return responseHandler(res, 200, `Total number of products`, products);
  } catch (err) {
    return responseHandler(res, 500, `Error counting products: ${err.message}`);
  }
};

// Get the total number of requirements
exports.getNumberOfRequirements = async (req, res) => {
  try {
    const requirements = await Requirements.countDocuments({
      status: "approved",
    });

    return responseHandler(
      res,
      200,
      `Total number of requirements`,
      requirements
    );
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error counting requirements: ${err.message}`
    );
  }
};

// Get the total number of events
exports.getNumberOfEvents = async (req, res) => {
  try {
    const events = await Event.countDocuments({
      status: { $in: ["upcoming", "postponded", "live"] },
    });
    return responseHandler(res, 200, `Total number of events`, events);
  } catch (err) {
    return responseHandler(res, 500, `Error counting events: ${err.message}`);
  }
};

// Get the total number of news
exports.getNumberOfNews = async (req, res) => {
  try {
    const news = await News.countDocuments({
      published: true,
    });
    return responseHandler(res, 200, `Total number of news`, news);
  } catch (err) {
    return responseHandler(res, 500, `Error counting news: ${err.message}`);
  }
};

// Get total number of promotions
exports.getNumberOfPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.countDocuments({
      status: true,
    });
    return responseHandler(res, 200, `Total number of promotions`, promotions);
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error counting promotions: ${err.message}`
    );
  }
};

exports.getAllStatistics = async (req, res) => {
  try {
    let year;
    let month;

    if (req.params.year && req.params.month) {
      year = req.params.year;
      month = req.params.month;
    } else {
      // Use the current date for the year and month
      const currentDate = new Date();
      month = currentDate.getMonth() + 1; // Get current month (1-based)
      year = currentDate.getFullYear(); // Get current year
    }

    // Start and end of the month (used for monthly revenue calculations)
    const startDate = new Date(year, month - 1, 1); // Month is 0-based in JavaScript
    const endDate = new Date(year, month, 0); // The last day of the month
    const oneYearBackDate = new Date(year - 1, month - 1, 1);
    // Calculate the previous month
    const adjustedYear = month === 1 ? year - 1 : year; // Handle January (roll back to December of the previous year)
    const adjustedMonth = month === 1 ? 12 : month - 1; // Roll back to December if January, otherwise subtract 1

    // Calculate the start and end dates for the previous month
    const prevStartDate = new Date(adjustedYear, adjustedMonth - 1, 1); // Start of the previous month
    const prevEndDate = new Date(adjustedYear, adjustedMonth, 0); // End of the previous month (last day)

    // Create an array of promises to fetch all required counts and data concurrently
    const results = await Promise.all([
      // Count users
      User.countDocuments({}),

      // Count active users
      User.countDocuments({ status: { $in: ["active"] } }),

      // Count active premium users
      User.countDocuments({
        status: { $in: ["active"] },
        subscription: "premium",
      }),

      // Count suspended users
      User.countDocuments({ status: { $in: ["suspended", "inactive"] } }),

      // Get monthly revenue (total)
      Payment.aggregate([
        {
          $match: {
            date: { $gte: startDate, $lt: endDate },
            status: { $in: ["accepted", "expiring", "expired"] },
          },
        },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
      ]).then((data) => (data.length > 0 ? data[0].totalRevenue : 0)),

      // Get monthly revenue by category membership
      // Payment.aggregate([
      //   {
      //     $match: {
      //       date: { $gte: startDate, $lt: endDate },
      //       status: { $in: ["accepted", "expiring", "expired"] },
      //       category: "membership",
      //     },
      //   },
      //   { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
      // ]).then((data) => (data.length > 0 ? data[0].totalRevenue : 0)),

      User.aggregate([
        { $match: { status: "active" } },
        { $count: "activeCount" },
        {
          $project: {
            result: { $multiply: ["$activeCount", 1050] },
          },
        },
      ]),

      // Get monthly revenue by category app
      // Payment.aggregate([
      //   {
      //     $match: {
      //       date: { $gte: startDate, $lt: endDate },
      //       status: { $in: ["accepted", "expiring", "expired"] },
      //       category: "app",
      //     },
      //   },
      //   { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
      // ]).then((data) => (data.length > 0 ? data[0].totalRevenue : 0)),
      User.aggregate([
        { $match: { status: "active", subscription: "premium" } },
        { $count: "activeCount" },
        {
          $project: {
            result: { $multiply: ["$activeCount", 999] },
          },
        },
      ]),

      // Get previous month's total revenue
      Payment.aggregate([
        {
          $match: {
            date: { $gte: prevStartDate, $lt: prevEndDate },
            status: { $in: ["accepted", "expiring", "expired"] },
          },
        },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
      ]).then((data) => (data.length > 0 ? data[0].totalRevenue : 0)),

      // Get previous month's membership revenue
      Payment.aggregate([
        {
          $match: {
            date: { $gte: prevStartDate, $lt: prevEndDate },
            status: { $in: ["accepted", "expiring", "expired"] },
            category: "membership",
          },
        },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
      ]).then((data) => (data.length > 0 ? data[0].totalRevenue : 0)),

      // Get previous month's app revenue
      Payment.aggregate([
        {
          $match: {
            date: { $gte: prevStartDate, $lt: prevEndDate },
            status: { $in: ["accepted", "expiring", "expired"] },
            category: "app",
          },
        },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
      ]).then((data) => (data.length > 0 ? data[0].totalRevenue : 0)),

      Event.countDocuments({}),

      News.countDocuments({}),

      Notification.countDocuments({}),

      Promotion.countDocuments({}),

      Product.countDocuments({}),

      Requirements.countDocuments({}),
    ]);

    const revenueRate = 1000;

    const appRevenue = await User.countDocuments({
      subscription: "premium",
      updatedAt: { $gte: oneYearBackDate, $lt: prevStartDate },
    }).then((count) => count * revenueRate);

    const membershipRevenue = await User.countDocuments({
      updatedAt: { $gte: oneYearBackDate, $lt: prevStartDate },
    }).then((count) => count * revenueRate);

    // Destructure the results array
    const [
      userCount,
      activeUserCount,
      activePremiumUserCount,
      suspendedUserCount,
      totalRevenue,
      totalCategoryMembershipRevenue,
      totalCategoryAppRevenue,
      prevTotalRevenue,
      prevTotalCategoryMembershipRevenue,
      prevTotalCategoryAppRevenue,
      eventCount,
      newsCount,
      notificationCount,
      promotionCount,
      productCount,
      requirementCount,
    ] = results;

    // Calculate percentages
    const calculatePercentage = (current, previous) => {
      if (previous > 0) {
        return ((current - previous) / previous) * 100;
      } else {
        return current > 0 ? 100 : 0;
      }
    };

    const formatPercentage = (value) => {
      const formatted = value.toFixed(1);
      return value > 0 ? `+${formatted}%` : `${formatted}%`;
    };

    const totalRevenuePercentage = formatPercentage(
      calculatePercentage(totalRevenue, prevTotalRevenue)
    );
    const membershipRevenuePercentage = formatPercentage(
      calculatePercentage(
        totalCategoryMembershipRevenue,
        prevTotalCategoryMembershipRevenue
      )
    );
    const appRevenuePercentage = formatPercentage(
      calculatePercentage(totalCategoryAppRevenue, prevTotalCategoryAppRevenue)
    );

    // Create the response data
    const responseData = {
      userCount,
      activeUserCount,
      activePremiumUserCount,
      suspendedUserCount,
      totalRevenue,
      totalCategoryMembershipRevenue,
      totalCategoryAppRevenue,
      totalRevenuePercentage,
      membershipRevenuePercentage,
      appRevenuePercentage,
      eventCount,
      newsCount,
      notificationCount,
      promotionCount,
      productCount,
      requirementCount,
      appRevenue,
      membershipRevenue,
    };

    // Return the results
    return responseHandler(
      res,
      200,
      "Statistics fetched successfully",
      responseData
    );
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error fetching statistics: ${err.message}`
    );
  }
};
