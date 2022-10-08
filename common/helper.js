module.exports = {
  InvalidCredError(res) {
    return res.status(400).json({ errors: [{ msg: "Invalid Credentials!" }] });
  },
  ServerError(res) {
    return res.status(500).json({ errors: [{ msg: "Server Error" }] });
  },
};
