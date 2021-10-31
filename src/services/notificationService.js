import * as NotificationModel from "../models/notificationModel";
import UserModel from "../models/userModel";

const LIMIT_NUMBER_TAKEN = 10;

/**
 * Get notification when f5 page
 * Just 10 item one time.
 * @param {string} currentUserId
 */
const getNotification = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      const notifications = await NotificationModel.model.getByUserIdAndLimit(currentUserId, LIMIT_NUMBER_TAKEN);

      const getNotifContents = notifications.map(async (notification) => {
        const sender = await UserModel.getNormalUserDataById(notification.senderId);
        return NotificationModel.content.getContent(
          notification.type,
          notification.isRead,
          sender._id,
          sender.username,
          sender.avatar
        );
      });

      resolve(await Promise.all(getNotifContents));
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Count all notification unread
 * @param {string} currentUserId
 */
const countNotifUnread = (currentUserId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let notificationUnread = await NotificationModel.model.countNotifUnread(currentUserId);
      resolve(notificationUnread);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Read more notification, max 10 item one time
 * @param {string} currentUserId
 * @param {number} skipNumberNotification
 */
const readMore = (currentUserId, skipNumberNotification) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newNotifications = await NotificationModel.model.readMore(currentUserId, skipNumberNotification, LIMIT_NUMBER_TAKEN);

      const getNotifContents = newNotifications.map(async (notification) => {
        const sender = await UserModel.getNormalUserDataById(notification.senderId);
        return NotificationModel.content.getContent(
          notification.type,
          notification.isRead,
          sender._id,
          sender.username,
          sender.avatar
        );
      });
      
      resolve(await Promise.all(getNotifContents));
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Mark all notification as read
 * @param {string} currentUserId 
 * @param {array} targetUser 
 */
const markAllAsRead = (currentUserId, targetUser) => {
  return new Promise(async (resolve, reject) => {
    try {
      await NotificationModel.model.markAllAsRead(currentUserId, targetUser);
      resolve(true);
    } catch (error) {
      console.error(`Error when mark notifications as read: ${error}`);
      reject(false);
    }
  });
};

export { 
  getNotification, 
  countNotifUnread, 
  readMore,
  markAllAsRead
};
