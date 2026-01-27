import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
    private s3Client: S3Client;
    private bucketName: string;

    constructor(private configService: ConfigService) {
        this.bucketName = this.configService.getOrThrow('MINIO_BUCKET_NAME');

        this.s3Client = new S3Client({
            region: 'us-east-1', // MinIO doesn't strictly care, but SDK needs it
            endpoint: this.configService.getOrThrow('MINIO_ENDPOINT'),
            credentials: {
                accessKeyId: this.configService.getOrThrow('MINIO_ROOT_USER'),
                secretAccessKey: this.configService.getOrThrow('MINIO_ROOT_PASSWORD'),
            },
            forcePathStyle: true, // Required for MinIO
        });
    }

    async uploadFile(file: Express.Multer.File, key: string) {
        await this.s3Client.send(
            new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: file.buffer,
                ContentType: file.mimetype,
            }),
        );

        return {
            key,
            url: `${this.configService.get('MINIO_ENDPOINT')}/${this.bucketName}/${key}`
        };
    }
}
