const express = require("express");
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const { InvalidCredError, ServerError } = require("../../common/helper");
const bcrypt = require("bcryptjs");
const config = require("config");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ user });
  } catch (error) {
    ServerError(res);
  }
});

router.post(
  "/",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a password").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    console.log("PASSWORD = ", errors);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email });
      if (!user) {
        InvalidCredError(res);
      }
      const isCorrectPassword = await bcrypt.compare(password, user.password);
      if (!isCorrectPassword) {
        InvalidCredError(res);
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 36000 },
        (error, token) => {
          if (error) throw error;

          res.json({ token });
        }
      );
    } catch (error) {
      console.log(error);
      ServerError(res);
    }
  }
);

module.exports = router;
