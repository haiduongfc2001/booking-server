import * as crypto from "crypto";
import { HashAlgorithm } from "../config/enum.config";
import * as dotenv from "dotenv";
dotenv.config();

// Đảm bảo rằng secretKey có độ dài 32 byte (256 bit) cho AES-256
const secretKey = crypto
  .createHash(HashAlgorithm.SHA256)
  .update(process.env.JWT_SECRET as string)
  .digest();

// Hàm tạo một IV ngẫu nhiên mỗi lần mã hóa (16 byte)
function generateIv() {
  return crypto.randomBytes(16);
}

// Function to encode JSON object content into a base64 encoded string
export function encodeJsonObject(jsonObject: any): string {
  // 1. Stringify the JSON object
  const jsonString: string = JSON.stringify(jsonObject);

  // 2. Generate a new IV
  const iv = generateIv();

  // 3. Create a new AES cipher using the secret key and IV
  const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);

  // 4. Encrypt the JSON string
  let encrypted = cipher.update(jsonString, "utf8", "base64");
  encrypted += cipher.final("base64");

  // 5. Return the encrypted data along with the IV (concatenate them)
  return iv.toString("base64") + ":" + encrypted;
}

// Function to decode a base64 encoded string back to JSON object
export function decodeJsonObject(encodedString: string): any {
  // 1. Split the encoded string to extract the IV and the encrypted data
  const [ivBase64, encryptedData] = encodedString.split(":");

  // 2. Decode the IV from base64
  const iv = Buffer.from(ivBase64, "base64");

  // 3. Create a new AES decipher using the secret key and IV
  const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv);

  // 4. Decrypt the data
  let decrypted = decipher.update(encryptedData, "base64", "utf8");
  decrypted += decipher.final("utf8");

  // 5. Parse the JSON string back to an object
  const jsonObject: any = JSON.parse(decrypted);

  return jsonObject;
}

// Function to encode an array into a base64 encoded string
export function encodeArray(array: any[]): string {
  // Chuyển đổi mảng thành chuỗi JSON
  const jsonString: string = JSON.stringify(array);

  // Generate a new IV
  const iv = generateIv();

  // Create a new AES cipher using the secret key and IV
  const cipher = crypto.createCipheriv("aes-256-cbc", secretKey, iv);

  // Encrypt the JSON string
  let encrypted = cipher.update(jsonString, "utf8", "base64");
  encrypted += cipher.final("base64");

  // Return the encrypted data along with the IV (concatenate them)
  return iv.toString("base64") + ":" + encrypted;
}

// Function to decode a base64 encoded string back to an array
export function decodeArray(encodedString: string): any[] {
  // Split the encoded string to extract the IV and the encrypted data
  const [ivBase64, encryptedData] = encodedString.split(":");

  // Decode the IV from base64
  const iv = Buffer.from(ivBase64, "base64");

  // Create a new AES decipher using the secret key and IV
  const decipher = crypto.createDecipheriv("aes-256-cbc", secretKey, iv);

  // Decrypt the data
  let decrypted = decipher.update(encryptedData, "base64", "utf8");
  decrypted += decipher.final("utf8");

  // Parse the JSON string back to an array
  const jsonArray: any[] = JSON.parse(decrypted);

  return jsonArray;
}
