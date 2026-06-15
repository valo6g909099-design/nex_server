require("dotenv").config();
const app = require("./api");
require("./db/init");
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
