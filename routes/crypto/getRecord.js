const { getCryptoRecord } = require("./../../db/record");
const { isAuth } = require("./../users/auth");

async function getRecord(req, res) {
  const isauth = await isAuth(req, res);

  if (isauth) {
    const getRecordItems = await getCryptoRecord(isauth.email);
  
    return res.status(200).json({ success: true, data: getRecordItems??[] });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Invalid token format" });
  }

  return res
    .status(401)
    .json({ success: false, message: "Invalid token format" });
}

module.exports = { getRecord };
