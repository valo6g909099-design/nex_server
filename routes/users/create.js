const { createUser, getUserByEmail } = require("./../../db/crud");
const bcrypt = require("bcrypt");
const { createCryptousersCollection } = require("./../../db/cryptousers");

async function userCreate(req, res) {
  const { fristname, lastname, email, pass, agree } = req.body;
  const errors = [];

  if (!fristname) errors.push({ fristname: "required" });
  if (!lastname) errors.push({ lastname: "required" });
  if (!email) errors.push({ email: "required" });
  if (!pass) errors.push({ pass: "required" });

  if (!agree) errors.push({ agree: "You must agree to the terms" });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push({ email: "Invalid email format" });
  }

  const passRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  if (pass && !passRegex.test(pass)) {
    errors.push({
      pass: "Password must be at least 8 characters, include 1 uppercase, 1 number, and 1 special character",
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return res.status(409).json({
      success: false,
      errors: [{ email: "Email already in use" }],
    });
  }

  const hashedPass = await bcrypt.hash(pass, 10);

  await createUser({ fristname, lastname, email, pass: hashedPass, agree });
  await createCryptousersCollection({ email });

  res.status(201).json({ success: true, message: "User created" });
}

module.exports = { userCreate };
