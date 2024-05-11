import * as Minio from "minio";
import * as dotenv from "dotenv";
import { DEFAULT_MINIO } from "./constant";
dotenv.config();

const minioAccessKey = process.env.MINIO_ROOT_USER;
const minioSecretKey = process.env.MINIO_ROOT_PASSWORD;

if (!minioAccessKey || !minioSecretKey) {
  throw new Error(
    "MinIO access key or secret key is not defined in environment variables"
  );
}

// MinIO client configuration
export const minioClient = new Minio.Client({
  endPoint: "localhost",
  port: 9000,
  useSSL: false,
  accessKey: minioAccessKey,
  secretKey: minioSecretKey,
});

(async () => {
  try {
    const bucketExists = await minioClient.bucketExists(DEFAULT_MINIO.BUCKET);
    if (bucketExists) {
      console.log("✅ Successfully connected to Minio and bucket exists!");
    } else {
      console.log("❌ Bucket does not exist. Create it if needed.");
    }
  } catch (err) {
    console.error("❌ Error connecting to Minio:", err);
  }
})();
