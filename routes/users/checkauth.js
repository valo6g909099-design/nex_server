const jwt = require("jsonwebtoken");
const {getCryptousersByEmail} = require('./../../db/cryptousers')
async function checkAuth(req, res) {
  console.log(req.headers["authorization"])
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log('1st')
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    console.log('1st')
    return res
      .status(401)
      .json({ success: false, message: "Invalid token format" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const cryptoObj = {}
    
    return res.status(200).json({ success: true, user: decoded});
  } catch (error) {
    if (error.name === "TokenExpiredError") {

      console.log('1st')
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    if (error.name === "JsonWebTokenError") {
      console.log('1st')
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { checkAuth };
