const jwt = require("jsonwebtoken");
const { isAuth } = require("./../users/auth");
const {
  getCryptousersByEmail,
  replaceCryptoObject,
} = require("./../../db/cryptousers");
const { getProtfolio } = require("./../../db/crypto");
async function toSell(req, res) {
  const isauth = await isAuth(req, res);
  if (isauth) {
    const getUsersItems = await getCryptousersByEmail(isauth?.email);
    const cryptoItems = getUsersItems["crypto"];
    if (cryptoItems[req.body.cryptoName].amount >= req.body.amount) {
      cryptoItems["USD"].amount =
        cryptoItems["USD"].amount + req.body.totalAmount*req.body.amount;
      cryptoItems[req.body.cryptoName].amount =
        cryptoItems[req.body.cryptoName].amount - req.body.amount;
    } else {
      return res.status(402).json({
        success: false,
        message: "Insufficient funds",
        amount: cryptoItems[req.body.cryptoName].amount,
      });
    }
    await replaceCryptoObject(getUsersItems.id, cryptoItems);

    const result = await getProtfolio(cryptoItems);

    return res.status(200).json({ success: true, data: result });
  } else {
    res.status(401).json({ success: false, message: "Invalid token format" });
  }
}

module.exports = { toSell };
