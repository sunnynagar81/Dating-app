const Block = require("../models/Block");

// Wo sab user IDs jinke saath is user ka block relation hai (dono direction mein)
const getBlockedUserIds = async (userId) => {
  const blocks = await Block.find({
    $or: [{ blocker: userId }, { blocked: userId }],
  });
  return blocks.map((b) => (b.blocker.equals(userId) ? b.blocked : b.blocker).toString());
};

module.exports = { getBlockedUserIds };