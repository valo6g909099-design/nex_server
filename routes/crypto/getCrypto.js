const { getProtfolio } = require("./../../db/crypto");
const { getCryptousersByEmail } = require("./../../db/cryptousers");
const jwt = require("jsonwebtoken");
async function getCryptoItems(req, res) {


  try {
   
    const cryptoItemsData = await getCryptousersByEmail('asraful808088@gmail.com');
    const result = await getProtfolio(cryptoItemsData["crypto"]);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
}
module.exports = { getCryptoItems };
