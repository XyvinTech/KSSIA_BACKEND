const Event = require("../models/events");
const User = require("../models/user");
const Product = require("../models/products");
const News = require("../models/news");
const Promotion = require("../models/promotions");
const Payment = require("../models/payment");
const Requirements = require("../models/requirements");
const responseHandler = require("../helpers/responseHandler");

// Count the total number of users
exports.countUsers = async (req, res) => {
    try {
        const userCount = await User.countDocuments({
            status: { $in: ['active', 'suspended', 'inactive', 'notice'] }
        });

        return responseHandler(res, 200, `Total number of users` ,userCount);

    }

    catch (err) {
        return responseHandler(res, 500, `Error getting total number of users: ${err.message}`);
    }
};

// Count the total number of active users
exports.countActiveUsers = async (req, res) => {
    try {
        const userCount = await User.countDocuments({
            status: { $in: ['active', 'notice'] }
        });

        return responseHandler(res, 200, `Total number of active users` ,userCount);

    }

    catch (err) {
        return responseHandler(res, 500, `Error getting total number of active users: ${err.message}`);
    }
};

// Count the total number of active premium users
exports.countActivePremiumUsers = async (req, res) => {
    try {
        const userCount = await User.countDocuments({
            status: { $in: ['active', 'notice'] },
            subscription: 'premium'
        });

        return responseHandler(res, 200, `Total number of active users` ,userCount);

    }

    catch (err) {
        return responseHandler(res, 500, `Error getting total number of active premium users: ${err.message}`);
    }
};

// Count the total number of suspended users
exports.countSuspendedUsers = async (req, res) => {
    try {
        const userCount = await User.countDocuments({
            status: { $in: ['suspended'] }
        });

        return responseHandler(res, 200, `Total number of suspended users` ,userCount);
    }

    catch (err) {
        return responseHandler(res, 500, `Error getting total number of suspended users: ${err.message}`);
    }
};

// Get the total revenu of a month
exports.getMonthlyRevenue = async (req, res) => {

    try {
        const { month, year} = req.params;

        // Start and end of the month
        const startDate = new Date(year, month - 1, 1); // Month is 0-based in JavaScript
        const endDate = new Date(year, month, 0); // The last day of the month

        // Aggregation to calculate total combined revenue for the month
        const totalRevenueData = await Payment.aggregate([
            {
                $match: {
                    date: { $gte: startDate, $lt: endDate }, // Filter by the date field (the date on the bill)
                    status: { $in: ['accepted', 'expiring', 'expired'] }, // Only count valid payments
                }
            },
            {
                $group: {
                    _id: null, // No grouping, just sum all records
                    totalRevenue: { $sum: '$amount' } // Sum the 'amount' field
                }
            }
        ]);

        // Extract the total revenue from the result
        const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].totalRevenue : 0;
        return responseHandler(res, 200, `Total combined revenue for the month` ,totalRevenue);

    } 
    
    catch (err) {
        return responseHandler(res, 500, `Error calculating total revenue for the month: ${err.message}`);
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
                    status: { $in: ['accepted', 'expiring', 'expired'] }, // Only count valid payments
                    category: category  // Filter by category (either 'app' or 'membership')
                }
            },
            {
                $group: {
                    _id: null, // No grouping, just sum all records
                    totalRevenue: { $sum: '$amount' } // Sum the 'amount' field
                }
            }
        ]);

        // Extract the total revenue from the result
        const totalRevenue = totalRevenueData.length > 0 ? totalRevenueData[0].totalRevenue : 0;
        return responseHandler(res, 200, `Total ${category} revenue for the month` ,totalRevenue);

    } 
    
    catch (err) {
        return responseHandler(res, 500, `Error calculating total revenue for the month: ${err.message}`);
    }
};

// Get the total number of products
exports.getNumberOfProducts = async (req, res) => {
    try {
        const products = await Product.countDocuments({
            status: 'accepted'
        });
        return responseHandler(res, 200, `Total number of products`, products);
    }

    catch (err) {
        return responseHandler(res, 500, `Error counting products: ${err.message}`);
    }
};

// Get the total number of requirements
exports.getNumberOfRequirements = async (req, res) => {
    try {
        const requirements = await Requirements.countDocuments({
            status: 'approved'
        });

        return responseHandler(res, 200, `Total number of requirements`, requirements);
    }

    catch (err){
        return responseHandler(res, 500, `Error counting requirements: ${err.message}`);
    }
}

// Get the total number of events
exports.getNumberOfEvents = async (req, res) => {
    try {
        const events = await Event.countDocuments({
            status: { $in: ['upcoming', 'postponded', 'live'] }
        });
        return responseHandler(res, 200, `Total number of events`, events);
    }

    catch (err){
        return responseHandler(res, 500, `Error counting events: ${err.message}`);
    }
}

// Get the total number of news
exports.getNumberOfNews = async (req, res) => {
    try {
        const news = await News.countDocuments({
            published : true
        });
        return responseHandler(res, 200, `Total number of news`, news);
    }

    catch (err){
        return responseHandler(res, 500, `Error counting news: ${err.message}`);
    }
}

// Get total number of promotions
exports.getNumberOfPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.countDocuments({
            status: true
        });
        return responseHandler(res, 200, `Total number of promotions`, promotions);
    }

    catch (err){
        return responseHandler(res, 500, `Error counting promotions: ${err.message}`);
    }
}

exports.getAllStatistics = async (req, res) => {
    try {
        let year;
        let month;

        if(req.params.year && req.params.month){
            year = req.params.year;
            month = req.params.month;
        }
        else{
            // Use the current date for the year and month
            const currentDate = new Date();
            month = currentDate.getMonth() + 1; // Get current month (1-based)
            year = currentDate.getFullYear(); // Get current year
        }

        // Start and end of the current month
        const startDate = new Date(year, month - 1, 1); // Month is 0-based in JavaScript
        const endDate = new Date(year, month, 0); // The last day of the month

        // Handle the previous month correctly across year boundaries
        let prevMonth = month - 1;
        let prevYear = year;
        if (prevMonth === 0) { // If current month is January, go to December of previous year
            prevMonth = 12; // December
            prevYear = year - 1; // Previous year
        }

        // Start and end of the previous month
        const prevStartDate = new Date(prevYear, prevMonth - 1, 1); // Previous month start
        const prevEndDate = new Date(prevYear, prevMonth, 0); // Previous month end

        // Create an array of promises to fetch all required counts and data concurrently
        const results = await Promise.all([
            // Count users
            User.countDocuments({ status: { $in: ['active', 'suspended', 'inactive', 'notice'] } }),

            // Count active users
            User.countDocuments({ status: { $in: ['active', 'notice'] } }),

            // Count active premium users
            User.countDocuments({ status: { $in: ['active', 'notice'] }, subscription: 'premium' }),

            // Count suspended users
            User.countDocuments({ status: { $in: ['suspended'] } }),

            // Get monthly revenue (total) for current month
            Payment.aggregate([
                { $match: { date: { $gte: startDate, $lt: endDate }, status: { $in: ['accepted', 'expiring', 'expired'] } } },
                { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
            ]).then(data => (data.length > 0 ? data[0].totalRevenue : 0)),

            // Get monthly revenue by category membership for current month
            Payment.aggregate([
                { $match: { date: { $gte: startDate, $lt: endDate }, status: { $in: ['accepted', 'expiring', 'expired'] }, category: 'membership' } },
                { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
            ]).then(data => (data.length > 0 ? data[0].totalRevenue : 0)),

            // Get monthly revenue by category app for current month
            Payment.aggregate([
                { $match: { date: { $gte: startDate, $lt: endDate }, status: { $in: ['accepted', 'expiring', 'expired'] }, category: 'app' } },
                { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
            ]).then(data => (data.length > 0 ? data[0].totalRevenue : 0)),

            // Get monthly revenue (total) for previous month
            Payment.aggregate([
                { $match: { date: { $gte: prevStartDate, $lt: prevEndDate }, status: { $in: ['accepted', 'expiring', 'expired'] } } },
                { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
            ]).then(data => (data.length > 0 ? data[0].totalRevenue : 0)),

            // Get monthly revenue by category membership for previous month
            Payment.aggregate([
                { $match: { date: { $gte: prevStartDate, $lt: prevEndDate }, status: { $in: ['accepted', 'expiring', 'expired'] }, category: 'membership' } },
                { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
            ]).then(data => (data.length > 0 ? data[0].totalRevenue : 0)),

            // Get monthly revenue by category app for previous month
            Payment.aggregate([
                { $match: { date: { $gte: prevStartDate, $lt: prevEndDate }, status: { $in: ['accepted', 'expiring', 'expired'] }, category: 'app' } },
                { $group: { _id: null, totalRevenue: { $sum: '$amount' } } }
            ]).then(data => (data.length > 0 ? data[0].totalRevenue : 0)),

            // Count accepted products
            Product.countDocuments({ status: 'accepted' }),

            // Count approved requirements
            Requirements.countDocuments({ status: 'approved' }),

            // Count events with specific statuses
            Event.countDocuments({ status: { $in: ['upcoming', 'postponded', 'live'] } }),

            // Count published news
            News.countDocuments({ published: true }),

            // Count active promotions
            Promotion.countDocuments({ status: true })
        ]);

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
            prevCategoryMembershipRevenue,
            prevCategoryAppRevenue,
            productCount,
            requirementCount,
            eventCount,
            newsCount,
            promotionCount
        ] = results;

        // Calculate the differences and percentage changes
        const calculatePercentageChange = (current, previous) => {
            if (previous === 0) return current === 0 ? 0 : 100; // Prevent division by zero
            return ((current - previous) / previous) * 100;
        };

        const totalRevenueDiff = totalRevenue - prevTotalRevenue;
        const totalCategoryMembershipRevenueDiff = totalCategoryMembershipRevenue - prevCategoryMembershipRevenue;
        const totalCategoryAppRevenueDiff = totalCategoryAppRevenue - prevCategoryAppRevenue;

        const totalRevenuePct = calculatePercentageChange(totalRevenue, prevTotalRevenue);
        const totalCategoryMembershipRevenuePct = calculatePercentageChange(totalCategoryMembershipRevenue, prevCategoryMembershipRevenue);
        const totalCategoryAppRevenuePct = calculatePercentageChange(totalCategoryAppRevenue, prevCategoryAppRevenue);

        // Create the response data in a structured format with differences and percentages
        const responseData = {
            userCount,
            activeUserCount,
            activePremiumUserCount,
            suspendedUserCount,
            totalRevenue,
            prevTotalRevenue,
            totalRevenueDiff, // Difference between current and previous month's total revenue
            totalRevenuePct, // Percentage change in total revenue
            totalCategoryMembershipRevenue,
            prevCategoryMembershipRevenue,
            totalCategoryMembershipRevenueDiff, // Difference in category 'membership' revenue
            totalCategoryMembershipRevenuePct, // Percentage change in category 'membership' revenue
            totalCategoryAppRevenue,
            prevCategoryAppRevenue,
            totalCategoryAppRevenueDiff, // Difference in category 'app' revenue
            totalCategoryAppRevenuePct, // Percentage change in category 'app' revenue
            productCount,
            requirementCount,
            eventCount,
            newsCount,
            promotionCount
        };

        // Return the results in a single response
        return responseHandler(res, 200, "Statistics fetched successfully", responseData);
    } catch (err) {
        return responseHandler(res, 500, `Error fetching statistics: ${err.message}`);
    }
};