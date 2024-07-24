const responseHandler = (res, status, message, data, totalCount) => {
  const res_structure = {
    status,
    message,
    data,
    totalCount,
  };
  return res.status(status).json(res_structure);
};

module.exports = responseHandler;
