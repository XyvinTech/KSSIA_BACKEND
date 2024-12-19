const capitalizeData = (data) => {
  if (typeof data === "string") {
    return data.charAt(0).toUpperCase() + data.slice(1).toLowerCase();
  }

  if (Array.isArray(data)) {
    return data.map((item) => capitalizeData(item));
  }

  if (data && typeof data === "object") {
    return Object.keys(data).reduce((acc, key) => {
      if (
        key === "_id" ||
        key === "status" ||
        key === "membership_status" ||
        key === "subscription" ||
        key === "fcm" ||
        key === "selectedTheme" ||
        key === "company_email" ||
        key === "email" ||
        key === "url" ||
        key === "profile_picture" ||
        key === "image"
      ) {
        acc[key] = data[key];
      } else {
        acc[key] = capitalizeData(data[key]);
      }
      return acc;
    }, {});
  }

  return data;
};

module.exports = capitalizeData;
