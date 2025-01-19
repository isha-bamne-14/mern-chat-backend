const express = require("express");
const messageRouter = express.Router();
const Message = require("../models/ChatModel");
const { protect } = require("../middleware/authMiddleware");
const Group = require("../models/GroupModel");

messageRouter.post("/", protect, async (req, res) => {
  try {
    const { content, groupId } = req.body;
    const group = await Group.findById(groupId);
    if (!group.members.includes(req.user._id)) {
      res.status(400).json({ message: "User not in group" });
    }
    const message = await Message.create({
      sender: req.user._id,
      content,
      group: groupId,
    });
    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "username email"
    );
    res.json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

messageRouter.get("/:groupId", protect, async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.groupId })
      .populate("sender", "username email")
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = messageRouter;
