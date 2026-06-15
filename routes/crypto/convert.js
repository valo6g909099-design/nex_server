const { isAuth } = require("./../users/auth");
const { getCryptousersByEmail, replaceCryptoObject } = require('./../../db/cryptousers');
const { getProtfolio } = require("./../../db/crypto");

async function toConvert(req, res) {
  const isauth = await isAuth(req, res);
  if (!isauth) {
    return res.status(401).json({ success: false, message: "Invalid token format" });
  }

  const getUsersItems = await getCryptousersByEmail(isauth?.email);
  const cryptoItems = getUsersItems['crypto'];

  const { from, to, base, rate } = req.body;

  const fromKey = Object.keys(from)[0];
  const toKey = Object.keys(to)[0];

  const fromData = from[fromKey];
  const toData = to[toKey];

  if (!cryptoItems[fromKey]) {
    return res.status(402).json({ success: false, message: `You don't hold any ${fromKey}` });
  }

  if (!cryptoItems[toKey]) {
    return res.status(402).json({ success: false, message: `${toKey} is not available in your portfolio` });
  }

  const sellAmount = fromData.amount * (rate / 100);

  if (cryptoItems[fromKey].amount < sellAmount) {
    return res.status(402).json({
      success: false,
      message: `Insufficient ${fromKey} balance. You have ${cryptoItems[fromKey].amount} but tried to sell ${sellAmount}`,
    });
  }

  const usdValue = sellAmount * fromData.price_usd;
  const buyAmount = usdValue / toData.price_usd;

  const exchangeRate = fromData.price_usd / toData.price_usd;

  cryptoItems[fromKey].amount = cryptoItems[fromKey].amount - sellAmount;
  cryptoItems[toKey].amount = cryptoItems[toKey].amount + buyAmount;

  await replaceCryptoObject(getUsersItems.id, cryptoItems);
  const result = await getProtfolio(cryptoItems);
  
  return res.status(200).json({
    success: true,
    conversion: {
      exchange_rate: `1 ${fromKey} = ${exchangeRate.toFixed(5)} ${toKey}`,
      sent: `${sellAmount} ${fromKey}`,
      received: `${buyAmount} ${toKey}`,
      usd_value: `$${usdValue}`,
    },
    data: result,
  });
}

module.exports = { toConvert };