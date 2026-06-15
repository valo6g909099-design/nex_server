const { isAuth } = require('./auth')
const {getCryptousersByEmail} = require('./../../db/cryptousers')

async function getApiKey(req,res) {
    const isauth = await isAuth(req, res)
    if (isauth) {
        const cryptoObject = await getCryptousersByEmail(isauth.email)
        return res
      .status(200)
      .json({ success: true, apiKey:cryptoObject?.apiKey  });
    } else {
        return res
      .status(401)
      .json({ success: false, message: "Invalid token format" });
    }
    return res
      .status(401)
      .json({ success: false, message: "Invalid token format" });
} 

module.exports = {getApiKey}