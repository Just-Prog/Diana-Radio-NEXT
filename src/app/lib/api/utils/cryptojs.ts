import CryptoJS from 'crypto-js';

// 掩耳盗铃式加密（
const encryption = (source: string) => CryptoJS.AES.encrypt(source, '672328094').toString();

const decryption = (source: string) => CryptoJS.AES.decrypt(source, '672328094').toString(CryptoJS.enc.Utf8);
export { encryption, decryption };
