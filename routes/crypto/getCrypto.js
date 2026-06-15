const { getProtfolio } = require("./../../db/crypto");
const { getCryptousersByEmail } = require("./../../db/cryptousers");
const jwt = require("jsonwebtoken");
async function getCryptoItems(req, res) {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid token format" });
  }

  try {
    console.log(token)
    console.log(process.env.JWT_SECRET)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const cryptoItemsData = await getCryptousersByEmail(decoded.email);
    const result = await getProtfolio(cryptoItemsData["crypto"]);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {


  

    console.log(error)






    
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
