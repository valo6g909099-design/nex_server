const express = require("express");
const router = express.Router();
const { getCryptoItems } = require("./getCrypto");
const { toBuy  }  = require('./buy')
const { toSell }  = require('./sell')
const {toConvert} = require('./convert')
const {send} = require('./send')
const {receive} = require('./receive')
const {paymentGateWay}  = require('./paymentGateWay')
const {getRecord} = require('./getRecord')
router.get("/getCryptoInfo", getCryptoItems);
router.post("/cryptoBuy", toBuy);
router.post("/cryptoSell", toSell);
router.post("/cryptoConvert", toConvert);
router.post("/send", send);
router.get("/receive", receive);
router.post("/payment/:key", paymentGateWay);
router.get("/getRecords", getRecord);

module.exports = router;
