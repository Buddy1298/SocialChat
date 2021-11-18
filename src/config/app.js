export const app = {
  // Config the number of connection event listener
  max_event_listeners: 30,

  // Config of multer module
  avatar_directory: "src/public/images/users",
  avatar_type: ["image/png", "image/jpg", "image/jpeg"],
  avatar_limit_size: 3145728, // byte = 3MB 
  general_avatar_group_chat: "group-avatar.png",

  image_message_directory: "src/public/images/chat/message",
  image_message_type: ["image/png", "image/jpg", "image/jpeg"],
  image_message_limit_size: 3145728, // byte = 3MB 

  attachment_message_directory: "src/public/images/chat/message",
  attachment_message_limit_size: 3145728, // byte = 3MB 

}
