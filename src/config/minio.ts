import * as Minio from "minio";
import * as dotenv from "dotenv";
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
