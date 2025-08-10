import { registerAs } from '@nestjs/config';

export interface AuthConfig {
  jwt: {
    secretKey: string;
    expirationTime: string;
  };
}

export default registerAs(
  'auth',
  (): AuthConfig => ({
    jwt: {
      secretKey: process.env.JWT_SECRET || 'S3CR3TK3Y',
      expirationTime: process.env.JWT_EXPIRATION_TIME || '1h',
    },
  }),
);
