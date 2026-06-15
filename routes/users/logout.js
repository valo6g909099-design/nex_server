async function logout(req, res) {
  res.clearCookie("token", {
  httpOnly: false,
  secure: false,
  sameSite: "strict",
  path: "/",
  expires: new Date(0),  
});
  return res.status(200).json({ success: true, message: "Logged out" });
}

module.exports = { logout };
