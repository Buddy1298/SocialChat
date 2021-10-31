import bluebird from "bluebird";
import mongoose from "mongoose";

/**
 * Connect to MongoDB
 */
const connectDB = () => {
  mongoose.Promise = bluebird;
  // mongodb://localhost:27017/awesome_chat
  const URI = `${process.env.DB_CONNECTION}://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

  return mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
}

export default connectDB;
