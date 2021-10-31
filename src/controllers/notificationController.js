import { notification } from "../services";

const readMore = async (req, res) => {
  try {
    // get skip number from query param
    const skipNumberNotification = +req.query.skipNumber;
    // get more item
    const newNotification = await notification.readMore(
      req.user._id,
      skipNumberNotification
    );

    return res.status(200).send(newNotification);
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
};

const markAllAsRead = async (req, res) => {
  try {
    let mark = await notification.markAllAsRead(req.user._id, req.body.targetUser);
    return res.status(200).send(mark);
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
};

export { 
  readMore, 
  markAllAsRead 
};
