const express = require("express");
const { check, validationResult } = require("express-validator");

const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const { ServerError } = require("../../common/helper");

const router = express.Router();

// @route       GET api/profile
// @desc        Test Route
// @access      Private
router.get("/", (req, res) => res.send("Profile Route"));

// @route       GET api/profile
// @desc        GET by id
// @access      Private
router.get("/", (req, res) => {
  try {
  } catch (error) {}
});

// @route       GET api/profile/me
// @desc        Get current user profile
// @access      Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );
    if (!profile) {
      return res.status(400).json({ errors: [{ msg: "No profile found!" }] });
    }
    res.json(profile);
  } catch (error) {
    console.log(error);
    ServerError(res);
  }
});

// @route       POST api/profile
// @desc        Create user profile
// @access      Private
router.post(
  "/",
  [
    auth,
    check("status", "status is required").not().isEmpty(),
    check("skills", "skills are required").not().isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const {
        company,
        website,
        location,
        status,
        skills,
        bio,
        githubusername,
        youtube,
        twitter,
        instagram,
        linkedin,
        facebook,
      } = req.body;

      const profileFields = {};
      profileFields.user = req.user.id;

      if (company) profileFields.company = company;
      if (website) profileFields.website = website;
      if (location) profileFields.location = location;
      if (status) profileFields.status = status;
      if (skills)
        profileFields.skills = skills.split(",").map((skill) => skills.trim());
      if (bio) profileFields.bio = bio;
      if (githubusername) profileFields.githubusername = githubusername;

      //create social profile
      profileFields.social = {};
      if (youtube) profileFields.social.youtube = youtube;
      if (twitter) profileFields.social.twitter = twitter;
      if (instagram) profileFields.social.instagram = instagram;
      if (linkedin) profileFields.social.linkedin = linkedin;
      if (facebook) profileFields.social.facebook = facebook;

      try {
        let profile = await Profile.findOne({
          user: req.user.id,
        });
        if (profile) {
          profile = await Profile.findOneAndUpdate(
            { user: req.user.id },
            { $set: { profileFields } },
            { new: true }
          );
          return res.json(profile);
        }
        profile = new Profile(profileFields);

        await profile.save();
        return res.json(profile);
      } catch (error) {
        return res.status(400).json({ error: error.message });
      }
    } catch (error) {
      console.log(error);
      ServerError(res);
    }
  }
);

module.exports = router;
