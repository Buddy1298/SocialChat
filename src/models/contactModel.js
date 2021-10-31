import mongoose from "mongoose";

const Schema = mongoose.Schema;

const ContactSchema = new Schema({
  userId: String,
  contactId: String,
  status: { type: Boolean, default: false },
  createdAt: { type: Number, default: Date.now },
  updatedAt: { type: Number, default: null },
  deletedAt: { type: Number, default: null },
});

ContactSchema.statics = {
  createNew(item) {
    return this.create(item);
  },

  /**
   * Find all items that related with user.
   * @param {string} userId
   */
  findAllByUser(userId) {
    return this.find({
      $or: [{ userId: userId }, { contactId: userId }],
    }).exec();
  },

  /**
   * Check exist contact of 2 user
   * @param {string} userId
   * @param {string} contactId
   */
  checkExist(userId, contactId) {
    return this.findOne({
      $or: [
        { $and: [{ userId: userId }, { contactId: contactId }] },
        { $and: [{ userId: contactId }, { contactId: userId }] },
      ],
    }).exec();
  },

  removeContact(userId, contactId) {
    return this.deleteOne({
      $or: [
        {
          $and: [
            { userId: userId },
            { contactId: contactId },
            { status: true },
          ],
        },
        {
          $and: [
            { userId: contactId },
            { contactId: userId },
            { status: true },
          ],
        },
      ],
    }).exec();
  },

  /**
   * Remove request contact sent
   * @param {string} userId
   * @param {string} contactId
   */
  removeRequestContactSent(userId, contactId) {
    return this.deleteOne({
      $and: [{ userId: userId }, { contactId: contactId }, { status: false }],
    }).exec();
  },

  /**
   * Remove request contact received
   * @param {string} userId
   * @param {string} contactId
   */
  removeRequestContactReceived(userId, contactId) {
    return this.deleteOne({
      $and: [{ userId: contactId }, { contactId: userId }, { status: false }],
    }).exec();
  },

  /**
   * Approve contact
   * @param {string: of currentUserid} userId
   * @param {string} contactId
   */
  approveRequestContactReceived(userId, contactId) {
    return this.updateOne(
      {
        $and: [{ userId: contactId }, { contactId: userId }, { status: false }],
      },
      { status: true, updatedAt: Date.now() }
    ).exec();
  },

  /**
   * Get Contacts by userId and limit
   * @param {string} userId
   * @param {number} limit
   */
  getContacts(userId, limit) {
    return this.find({
      $and: [
        { $or: [{ userId: userId }, { contactId: userId }] },
        { status: true },
      ],
    })
      .sort({ updatedAt: -1 })
      .limit(limit)
      .exec();
  },

  /**
   * Get Contacts sent by userId and limit
   * @param {string} userId
   * @param {number} limit
   */
  getContactsSent(userId, limit) {
    return this.find({
      $and: [{ userId: userId }, { status: false }],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  },

  /**
   * Get Contacts received by userId and limit
   * @param {string} userId
   * @param {number} limit
   */
  getContactsReceived(userId, limit) {
    return this.find({
      $and: [{ contactId: userId }, { status: false }],
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  },

  /**
   * Count all contacts by userId
   * @param {string} userId
   */
  countAllContacts(userId) {
    return this.countDocuments({
      $and: [
        { $or: [{ userId: userId }, { contactId: userId }] },
        { status: true },
      ],
    }).exec();
  },

  /**
   * Count all contacts sent by userId
   * @param {string} userId
   */
  countAllContactsSent(userId) {
    return this.countDocuments({
      $and: [{ userId: userId }, { status: false }],
    }).exec();
  },

  /**
   * Count all contacts received by userId
   * @param {string} userId
   */
  countAllContactsReceived(userId) {
    return this.countDocuments({
      $and: [{ contactId: userId }, { status: false }],
    }).exec();
  },

  /**
   * Read more contacts by userId, skip, limit
   * @param {string} userId
   * @param {number} skip
   * @param {number} limit
   */
  readMoreContacts(userId, skip, limit) {
    return this.find({
      $and: [
        { $or: [{ userId: userId }, { contactId: userId }] },
        { status: true },
      ],
    })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  /**
   * Read more contacts sent by userId, skip, limit
   * @param {string} userId
   * @param {number} skip
   * @param {number} limit
   */
  readMoreContactsSent(userId, skip, limit) {
    return this.find({
      $and: [{ userId: userId }, { status: false }],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  /**
   * Read more contacts received by userId, skip, limit
   * @param {string} userId
   * @param {number} skip
   * @param {number} limit
   */
  readMoreContactsReceived(userId, skip, limit) {
    return this.find({
      $and: [{ contactId: userId }, { status: false }],
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  /**
     * Read more all chat by userId, skip, personalIds, limit
     * @param {string} userId
     * @param {number} skip
     * @param {array} personalIds
     * @param {number} limit
     */
  readMoreChatContact(userId, skip, personalIds, limit) {
    return this.find({
      $and: [
        { $or: [{ userId: { $nin: personalIds } }, { contactId: { $nin: personalIds } } ] },
        {
          $or: [{ userId: userId }, { contactId: userId } ],
        },
        { status: true },
      ],
    })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
  },

  /**
   * Update contact (chat personal) when has new message
   * @param { string } userId
   * @param { string } contactId
   */
  updateWhenHasNewMessage(userId, contactId) {
    return this.updateOne(
      {
        $or: [
          { $and: [{ userId: userId }, { contactId: contactId }] },
          { $and: [{ userId: contactId }, { contactId: userId }] },
        ],
      },
      {
        updatedAt: Date.now(),
      }
    ).exec();
  },

  /**
   * Get contact friends by userId
   * @param { string } userId
   */
  getFriends(userId) {
    return this.find({
      $and: [
        { $or: [{ userId: userId }, { contactId: userId }] },
        { status: true },
      ],
    })
      .sort({ updatedAt: -1 })
      .exec();
  },

  findContactsToAddGroupChat(userId, memberIds) {
    return this.find(
      {
        $or: [
          {
            userId: userId,
            contactId: { $nin: memberIds },
            status: true,
          },
          {
            contactId: userId,
            userId: { $nin: memberIds },
            status: true,
          },
        ],
      },
    ).exec();
  },
};

export default mongoose.model("contact", ContactSchema);
