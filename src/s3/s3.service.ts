import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
// Dynamically require AWS SDK to avoid compile-time missing types when package isn't installed
const S3Pkg: any = (() => {
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        return require('@aws-sdk/client-s3');
    } catch (e) {
        return null;
    }
})();

@Injectable()
export class S3Service {
    private readonly logger = new Logger(S3Service.name);
    private readonly client: any;

    constructor() {
        if (!S3Pkg) {
            this.client = null;
            this.logger.warn('@aws-sdk/client-s3 not available; S3 operations will fail at runtime');
        } else {
            const { S3Client } = S3Pkg;
            this.client = new S3Client({
                region: process.env.AWS_REGION,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                },
            });
        }
    }

    async uploadBuffer(buffer: Buffer, originalName: string, mimeType: string, folder = 'surplus-packages') {
        const ext = originalName && originalName.includes('.') ? originalName.substring(originalName.lastIndexOf('.')) : '';
        const key = `${folder}/${randomUUID()}${ext}`;

        const params = {
            Bucket: process.env.AWS_S3_BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: mimeType,
            ACL: 'public-read',
        };

        try {
            if (!this.client) throw new Error('@aws-sdk/client-s3 not configured');
            const { PutObjectCommand } = S3Pkg;
            await this.client.send(new PutObjectCommand(params));
            return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        } catch (err) {
            this.logger.error('S3 upload failed', err as any);
            throw err;
        }
    }

    async deleteUrl(url?: string) {
        if (!url) return;
        const marker = '.amazonaws.com/';
        const idx = url.indexOf(marker);
        if (idx === -1) return;
        const key = url.substring(idx + marker.length);

        try {
            if (!this.client) throw new Error('@aws-sdk/client-s3 not configured');
            const { DeleteObjectCommand } = S3Pkg;
            await this.client.send(new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET_NAME, Key: key }));
            this.logger.log(`Deleted S3 object ${key}`);
        } catch (err) {
            this.logger.warn('Failed to delete S3 object', err as any);
        }
    }
}
