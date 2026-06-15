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
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ get user crypto data
    const cryptoItemsData = await getCryptousersByEmail(decoded.email);

    // ✅ check if user data exists
    if (!cryptoItemsData) {
      return res.status(200).json({ success: true, data: [] });
    }

    // ✅ check if crypto field exists
    if (!cryptoItemsData["crypto"] || cryptoItemsData["crypto"].length === 0) {
      return res.status(200).json({ success: true, data: [] });
    }

    // ✅ get portfolio
    const result = await getProtfolio(cryptoItemsData["crypto"]);

    // ✅ check if result exists
    if (!result) {
      return res.status(200).json({ success: true, data: [] });
    }

    return res.status(200).json({ success: true, data: result });

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json({ success: false, message: "Invalid token" });
    }
    console.error("getCryptoItems error:", error); // ✅ log real error
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
}

module.exports = { getCryptoItems };
