const { isAuth } = require("./../users/auth");
const {getCryptousersByEmail} = require('./../..//db/cryptousers')
async function receive(req, res) {
  const isauth = await isAuth(req, res);
  if (isauth) {
    const cryptoInfos = await getCryptousersByEmail(isauth?.email)
    return res.status(200).json({ success: true, data: {paymentAddress:cryptoInfos?.address} });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }
  return res.status(401).json({ success: false, message: "No token provided" });
}

module.exports = { receive };
