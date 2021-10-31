import mongoose from "mongoose";

const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  senderId: String,
  receiverId: String,
  conversationType: String,
  messageType: String,
  sender: {
    id: String,
    name: String,
    avatar: String,
  },
  receiver: {
    id: String,
    name: String,
    avatar: String,
  },
  text: String,
  file: { data: Buffer, contentType: String, fileName: String },
  createdAt: { type: Number, default: Date.now },
  updatedAt: { type: Number, default: null },
  deletedAt: { type: Number, default: null },
});

MessageSchema.statics = {
  /**
   * Create new message
   * @param { object } item 
   */
  createNew(item) {
    return this.create(item);
  },

  /**
   * Get message in personal
   * @param { string } senderId currentUserId 
   * @param { string } receiverId id of contact
   * @param { number } limit
   */
  getMessagesInPersonal(senderId, receiverId, limit) {
    return this.find({
      $or: [
        {
          $and: [{ senderId: senderId }, { receiverId: receiverId }],
        },
        {
          $and: [{ senderId: receiverId }, { receiverId: senderId }],
        },
      ],
    })
      .sort({ "createdAt": -1 })
      .limit(limit)
      .exec();
  },

  /**
   * Get message in group
   * @param { string } receiverId id of group chat
   * @param { number } limit 
   */
  getMessagesInGroup(receiverId, limit) {
    return this.find({ receiverId: receiverId })
      .sort({ "createdAt": -1 })
      .limit(limit)
      .exec();
  },

  readMoreMessagesInPersonal(senderId, receiverId, skip, limit) {
    return this.find({
      $or: [
        {
          $and: [{ senderId: senderId }, { receiverId: receiverId }],
        },
        {
          $and: [{ senderId: receiverId }, { receiverId: senderId }],
        },
      ],
    })
      .sort({ "createdAt": -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  readMoreMessagesInGroup(receiverId, skip, limit) {
    return this.find({ receiverId: receiverId })
      .sort({ "createdAt": -1 }) // descending
      .skip(skip)
      .limit(limit)
      .exec();
  },
};

const MESSAGE_CONVERSATION_TYPES = {
  PERSONAL: "personal",
  GROUP: "group",
};

const MESSAGE_TYPES = {
  TEXT: "text",
  IMAGE: "image",
  FILE: "file",
};

const model = mongoose.model("message", MessageSchema);

export {
  model,
  MESSAGE_CONVERSATION_TYPES as conversationTypes,
  MESSAGE_TYPES as messageTypes,
};
