import expressValidator from "express-validator";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { transError, transSuccess } from "../../lang/vi";
import { app } from "../config/app";
import { user } from '../services';

const {validationResult} = expressValidator;

const storageAvatar = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, app.avatar_directory);
  },
  filename: (req, file, cb) => {
    // Kiểm tra type của hình upload
    const math = app.avatar_type;
    if (math.indexOf(file.mimetype) === -1) {
      return cb(transError.avatar_type, null);
    }

    const avatarName = `${Date.now()}-${uuidv4()}-${file.originalname}`;
    cb(null, avatarName);
  },
});

const avatarUploadFile = multer({
  storage: storageAvatar,
  limits: { fileSize: app.avatar_limit_size },
}).single("avatar");

const updateAvatar = (req, res) => {
  avatarUploadFile(req, res, async (error) => {
    if (error) {
      if(error.message) {
        return res.status(500).send(transError.avatar_size);
      }
      return res.status(500).send(error);
    }

    try {
      const updateUserItem = {
        avatar: req.file.filename,
        updatedAt: Date.now()
      };
      // Update user in db
      const userUpdate = await user.updateUser(req.user._id, updateUserItem);

      // Remove old avatar in directory
      // Không xóa avatar cũ của người dùng vì trong bảng message cần sử dụng
      // await fsExtra.remove(`${app.avatar_directory}/${userUpdate.avatar}`);

      const response = {
        message: transSuccess.user_info_updated,
        imgSrc: `/images/users/${req.file.filename}`
      }
      return res.status(200).send(response);
    } catch (error) {
      console.error(error);
      return res.status(500).send(error);
    }
  });
};

const updateInfo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(500).send(errorMessages);
  }

  try {
    const updateUserItem = req.body;
    updateUserItem.updatedAt = Date.now();
    await user.updateUser(req.user._id, updateUserItem);

    const response = {
      message: transSuccess.user_info_updated
    }
    res.status(200).send(response);
  } catch (error) {
    // Occur at server
    console.error(error);
    res.status(500).send(error);
  }
}

const updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(500).send(errorMessages);
  }

  try {
    const updateUserItem = req.body;
    await user.updatePassword(req.user._id, updateUserItem);

    const response = {
      message: transSuccess.user_password_updated
    }
    return res.status(200).send(response);
  } catch (error) {
    console.error(error)
    return res.status(500).send(error);
  }
}

export {
  updateAvatar,
  updateInfo,
  updatePassword
};
