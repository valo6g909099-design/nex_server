const {
  getCryptousersByEmail,
  getCryptousersByApi,
  replaceCryptoObject,
} = require("./../../db/cryptousers");
const { postCryptoRecord } = require("./../../db/record");
const { getUserByEmail } = require("./../../db/crud");
const bcrypt = require("bcrypt");

async function paymentGateWay(req, res) {
  
  const apiKey = req.params?.key;
  console.log(req)
  if (!apiKey) {
    return res
      .status(400)
      .json({ success: false, message: "API key is required" });
  }

  const businessCryptoInfo = await getCryptousersByApi(apiKey);
  if (!businessCryptoInfo) {
    return res.status(404).json({ success: false, message: "Invalid API key" });
  }

  const { email, pass, amount } = req.body;
  const sym = "USD";
  const errors = [];

  if (!email) errors.push({ email: "Email is required" });
  if (!pass) errors.push({ pass: "Password is required" });
  if (!amount || amount <= 0)
    errors.push({ amount: "Valid amount is required" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push({ email: "Invalid email format" });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const user = await getUserByEmail(email);
  if (!user) {
    return res.status(404).json({
      success: false,
      errors: [{ email: "No account found with this email" }],
    });
  }

  const isMatch = await bcrypt.compare(pass, user.pass);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      errors: [{ pass: "Incorrect password" }],
    });
  }

  const senderCryptoInfo = await getCryptousersByEmail(email);
  if (!senderCryptoInfo) {
    return res.status(404).json({
      success: false,
      message: "Sender crypto account not found",
    });
  }

  if (senderCryptoInfo.id === businessCryptoInfo.id) {
    return res.status(400).json({
      success: false,
      message: "Cannot send to your own account",
    });
  }

  const senderBalance = senderCryptoInfo.crypto?.USD?.amount ?? 0;
  if (senderBalance < amount) {
    return res.status(400).json({
      success: false,
      message: `Insufficient USD balance. Available: ${senderBalance}`,
    });
  }

  const newSenderBalance = senderBalance - amount;
  const businessBalance = businessCryptoInfo.crypto?.USD?.amount ?? 0;
  const newBusinessBalance = businessBalance + amount;

  await replaceCryptoObject(senderCryptoInfo.id, {
    ...senderCryptoInfo.crypto,
    [sym]: { amount: newSenderBalance },
  });

  await replaceCryptoObject(businessCryptoInfo.id, {
    ...businessCryptoInfo.crypto,
    [sym]: { amount: newBusinessBalance },
  });
  // const result = await getProtfolio(cryptoItemsData["crypto"]);
  // return res.status(200).json({ success: true, data: result });
  await postCryptoRecord({
    recv: businessCryptoInfo.email,
    send: senderCryptoInfo.email,
    value: amount,
    type: sym,
  });
  return res.status(200).json({
    success: true,
    data: {
      sym,
      amount,
      from: email,
      to: businessCryptoInfo.email,
      senderNewBalance: newSenderBalance,
      businessNewBalance: newBusinessBalance,
    },
  });
}

module.exports = { paymentGateWay };
