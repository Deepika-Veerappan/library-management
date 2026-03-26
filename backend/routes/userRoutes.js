const express = require("express");
const User = require("../models/User");
const Borrow = require("../models/Borrow");
const Notification = require("../models/Notification"); // ✅ add this
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

/* USER PROFILE */
router.get("/profile", protect, async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
});

/* USER BORROWED BOOKS */
router.get("/my-books", protect, async (req, res) => {

  try {

    const user = await User.findById(req.user.id);

    const books = await Borrow.find({
      userEmail: user.email
    }).populate("book");

    res.json(books);

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching books" });
  }

});


/* USER NOTIFICATIONS */

router.get("/notifications", protect, async (req, res) => {

  try {

    const user = await User.findById(req.user.id);

    const notifications = await Notification.find({
      userEmail: user.email
    }).sort({ createdAt: -1 });

    res.json(notifications);

  } catch (error) {
    res.status(500).json({ message: "Error fetching notifications" });
  }

});
router.put("/notifications/read", protect, async (req, res) => {

  try {

    const user = await User.findById(req.user.id);

    await Notification.updateMany(
      { userEmail: user.email, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: "Notifications marked as read" });

  } catch (error) {
    res.status(500).json({ message: "Error updating notifications" });
  }

});
router.put("/notifications/:id/read", protect, async (req, res) => {

  try {

    await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true }
    );

    res.json({ message: "Notification updated" });

  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }

});
module.exports = router;