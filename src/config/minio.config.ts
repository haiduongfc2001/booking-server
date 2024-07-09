import * as Minio from "minio";
import * as dotenv from "dotenv";
import { DEFAULT_MINIO } from "./constant.config";

dotenv.config();

class MinioConfig {
  private static instance: MinioConfig;
  private minioClient: Minio.Client;

  private readonly MINIO_ENDPOINT: string;
  private readonly MINIO_PORT: number;
  // private readonly MINIO_USE_SSL: boolean;
  private readonly MINIO_ACCESS_KEY: string;
  private readonly MINIO_SECRET_KEY: string;

  private constructor() {
    this.MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || "localhost";
    this.MINIO_PORT = Number(process.env.MINIO_PORT) || 9000;
    // this.MINIO_USE_SSL = process.env.MINIO_USE_SSL === "true";
    this.MINIO_ACCESS_KEY = process.env.MINIO_ROOT_USER as string;
    this.MINIO_SECRET_KEY = process.env.MINIO_ROOT_PASSWORD as string;

    if (!this.MINIO_ACCESS_KEY || !this.MINIO_SECRET_KEY) {
      throw new Error(
        "MinIO access key or secret key is not defined in environment variables"
      );
    }

    this.minioClient = new Minio.Client({
      endPoint: this.MINIO_ENDPOINT,
      // port: this.MINIO_PORT,
      useSSL: true,
      accessKey: this.MINIO_ACCESS_KEY,
      secretKey: this.MINIO_SECRET_KEY,
    });

    this.connectToMinio();
  }

  public static getInstance(): MinioConfig {
    if (!MinioConfig.instance) {
      MinioConfig.instance = new MinioConfig();
    }
    return MinioConfig.instance;
  }

  private async connectToMinio() {
    try {
      const bucketExists = await this.minioClient.bucketExists(
        DEFAULT_MINIO.BUCKET
      );
      if (bucketExists) {
        console.log("✅ Successfully connected to Minio and bucket exists!");
      } else {
        console.log("❌ Bucket does not exist. Create it if needed.");
      }
    } catch (err) {
      console.error("❌ Error connecting to Minio:", err);
    }
  }

  public getClient(): Minio.Client {
    return this.minioClient;
  }
}

const minioConfig = MinioConfig.getInstance();
export { minioConfig };
