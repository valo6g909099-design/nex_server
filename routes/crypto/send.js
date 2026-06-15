const { isAuth } = require("./../users/auth");
const { getCryptousersByAddress, getCryptousersByEmail  } = require("./../../db/cryptousers");
const { replaceCryptoObject } = require("./../../db/cryptousers"); 
const { postCryptoRecord,getCryptoRecord } = require("./../../db/record");
const { getProtfolio } = require("./../../db/crypto");
async function send(req, res) {
  const isauth = await isAuth(req, res);

  if (!isauth || !req?.body?.address) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const { address, amount, crypto_item } = req.body;
  const sym = crypto_item?.sym;

  if (!sym || !amount || amount <= 0) {
    return res.status(400).json({ success: false, message: "Invalid symbol or amount" });
  }

  const sender = await getCryptousersByEmail(isauth.email);
  const receiver = await getCryptousersByAddress(address);

  if (!sender) {
    return res.status(404).json({ success: false, message: "Sender not found" });
  }

  if (!receiver) {
    return res.status(404).json({ success: false, message: "Receiver address not found" });
  }

  if (sender.id === receiver.id) {
    return res.status(400).json({ success: false, message: "Cannot send to yourself" });
  }

  const senderBalance = sender.crypto?.[sym]?.amount ?? 0;
  if (senderBalance < amount) {
    return res.status(400).json({
      success: false,
      message: `Insufficient ${sym} balance. Available: ${senderBalance}`,
    });
  }

  const newSenderBalance = senderBalance - amount;
  const receiverBalance = receiver.crypto?.[sym]?.amount ?? 0;
  const newReceiverBalance = receiverBalance + amount;
  const senderInfo = {
    ...sender.crypto,
    [sym]: { amount: newSenderBalance },
  }
  await replaceCryptoObject(sender.id, senderInfo);

  await replaceCryptoObject(receiver.id, {
    ...receiver.crypto,
    [sym]: { amount: newReceiverBalance },
  });
   const result = await getProtfolio(senderInfo);
   await postCryptoRecord({
    recv: receiver.email,
    send: sender.email,
    value: amount,
    type: sym,
  });
  const getResord = await getCryptoRecord(isauth.email)
    return res.status(200).json({ success: true, data: result,getResord });
  
}

module.exports = { send };