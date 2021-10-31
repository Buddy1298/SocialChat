import otplib from "otplib";
import qrcode from "qrcode";

const { authenticator } = otplib;

const generateUniqueSecret = () => {
  return authenticator.generateSecret();
};

const generateOTPToken = (username, serviceName, secret) => {
  return authenticator.keyuri(username, serviceName, secret);
};

const verifyOTPToken = (token, secret) => {
  return authenticator.verify({ token, secret });
};

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
