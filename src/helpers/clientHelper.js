import moment from "moment";

export const bufferToBase64 = (bufferFrom) => {
  return Buffer.from(bufferFrom).toString("base64");  
}

export const lastItemFromArr = (arr) => {
  if(!arr.length) return [];
  return arr[arr.length - 1];
}

export const convertTimestampHumanTime = (timestamp) => {
  if(!timestamp) {
    return "";
  }
  return moment(timestamp).locale("vi").startOf("second").fromNow();    
}
