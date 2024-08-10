
const paginateAndFilter = async (model, query, filterOptions = {}, page = 1, limit = 10) => {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const filter = {};
    Object.keys(filterOptions).forEach(key => {
        if (query[key]) {
            filter[key] = new RegExp(query[key], 'i'); 
        }
    });
    try {
        const documents = await model.find(filter)
            .skip((pageNumber - 1) * limitNumber)
            .limit(limitNumber);
        const totalCount = await model.countDocuments(filter);
        const pagination = {
            currentPage: pageNumber,
            totalPages: Math.ceil(totalCount / limitNumber),
            pageSize: limitNumber,
            totalRecords: totalCount,
        };
        return { documents, pagination };
    } catch (error) {
        throw new Error(error.message || 'Error occurred while fetching data');
    }
};

module.exports = paginateAndFilter;
