import otplib from "otplib";
import qrcode from "qrcode";

const { authenticator } = otplib;

const generateUniqueSecret = () => {
  return authenticator.generateSecret();
};
// Tạo mã OTP token
const generateOTPToken = (username, serviceName, secret) => {
  return authenticator.keyuri(username, serviceName, secret);
};
// Kiểm tra mã OTP token có hợp lệ hay không
const verifyOTPToken = (token, secret) => {
  return authenticator.verify({ token, secret });
};
// Tạo QR code từ mã OTP để gửi về cho user sử dụng app quét mã
const generateQRCode = async (otpAuth) => {
  try {
    const QRCodeImageUrl = await qrcode.toDataURL(otpAuth);
    return `<img src='${QRCodeImageUrl}' alt='qr-code-img' />`;
  } catch (error) {
    console.log("Could not generate QR code", error);
    return;
  }
};

export {
  generateUniqueSecret,
  verifyOTPToken,
  generateOTPToken,
  generateQRCode,
};
