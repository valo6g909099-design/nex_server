const { isAuth } = require("./../users/auth");
const {getCryptousersByEmail,replaceCryptoObject,} = require('./../../db/cryptousers')
const { getProtfolio } = require("./../../db/crypto");
async function toBuy(req,res){
     const isauth = await isAuth(req, res);
  if (isauth) {
    
    const getUsersItems = await getCryptousersByEmail(isauth?.email)
    const cryptoItems = getUsersItems['crypto']
    
    const actualvalue =req.body.totalAmount*req.body.amount
    if (cryptoItems['USD'].amount>=actualvalue) {
            
            cryptoItems[req.body.cryptoName].amount = cryptoItems[req.body.cryptoName].amount + req.body.amount
            cryptoItems['USD'].amount = cryptoItems['USD'].amount -   actualvalue
    }else{
         return res.status(402).json({ success: false, message: "Insufficient funds",amount:cryptoItems['USD'].amount });

    }

      await replaceCryptoObject(getUsersItems.id,cryptoItems)
      const result = await getProtfolio(cryptoItems);
    return res.status(200).json({ success: true, data: result });
  } else {
   return res.status(401).json({ success: false, message: "Invalid token format" });
  }
}

module.exports = {toBuy}
