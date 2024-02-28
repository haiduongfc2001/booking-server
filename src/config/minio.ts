import * as Minio from 'minio';

// MinIO client configuration
export const minioClient = new Minio.Client({
    endPoint: 'localhost',
    port: 9000,
    useSSL: false,
    accessKey: 'minio',
    secretKey: 'minio123'
});