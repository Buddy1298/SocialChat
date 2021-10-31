import mongoose from "mongoose";

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  senderId: String,
  receiverId: String,
  type: String,
  isRead: { type: Boolean, default: false },
  createdAt: { type: Number, default: Date.now },
});

NotificationSchema.statics = {
  createNew(item) {
    return this.create(item);
  },

  removeRequestContactSentNotification(senderId, receiverId, type) {
    return this.deleteOne({
      $and: [
        { senderId: senderId },
        { receiverId: receiverId },
        { type: type },
        { isRead: false }
      ],
    }).exec();
  },

  /**
   * Get by userId and limit
   * @param {string} userId
   * @param {number} limit
   */
  getByUserIdAndLimit(userId, limit) {
    return this.find({ receiverId: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  },

  /**
   * Count all nofitication unread
   * @param {string} userId
   */
  countNotifUnread(userId) {
    return this.countDocuments({
      $and: [{ receiverId: userId }, { isRead: false }],
    }).exec();
  },

  /**
   * Read more notification
   * @param {string} userId
   * @param {number} skip
   * @param {number} limit
   */
  readMore(userId, skip, limit) {
    return this.find({ receiverId: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  /**
   * Mark all notification as read
   * @param {string} userId
   * @param {array} targetUser
   */
  markAllAsRead(userId, targetUser) {
    return this.updateMany(
      {
        $and: [{ receiverId: userId }, { senderId: { $in: targetUser } }],
      },
      { isRead: true }
    ).exec();
  },
};

const NOTIFICATION_TYPE = {
  ADD_CONTACT: "add_contact",
  APPROVE_CONTACT: "approve_contact"
};

const NOTIFICATION_CONTENT = {
  getContent(notificationType, isRead, userId, username, userAvatar) {
    if (notificationType === NOTIFICATION_TYPE.ADD_CONTACT) {
      if (!isRead) {
        return `<div class="notif-readed-false" data-uid="${userId}">
                  <img class="avatar-small" src="images/users/${userAvatar}" alt=${username} />
                  <strong>${username}</strong> đã gửi cho bạn một lời mời kết bạn! 
                </div>`;
      }

      return `<div data-uid="${userId}">
                <img class="avatar-small" src="images/users/${userAvatar}" alt=${username} />
                <strong>${username}</strong> đã gửi cho bạn một lời mời kết bạn! 
              </div>`;
    }

    if (notificationType === NOTIFICATION_TYPE.APPROVE_CONTACT) {
      if (!isRead) {
        return `<div class="notif-readed-false" data-uid="${userId}">
                  <img class="avatar-small" src="images/users/${userAvatar}" alt=${username} />
                  <strong>${username}</strong> đã chấp nhận lời mời kết bạn của bạn! 
                </div>`;
      }

      return `<div data-uid="${userId}">
                <img class="avatar-small" src="images/users/${userAvatar}" alt=${username} />
                <strong>${username}</strong> đã chấp nhận lời mời kết bạn của bạn! 
              </div>`;
    }

    return "No matching with any notification type.";
  },
};

const model = mongoose.model("notification", NotificationSchema);

export {
  model,
  NOTIFICATION_TYPE as types,
  NOTIFICATION_CONTENT as content,
};
