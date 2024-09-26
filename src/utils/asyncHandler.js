const responseHandler = require("../helpers/responseHandler");

const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        console.error(error);
        return responseHandler(res, 500, `Internal Server Error: ${error.message}`);

    }
}

module.exports = asyncHandler;