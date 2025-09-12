import { registerAs } from '@nestjs/config';

export interface OpenApiConfig {
  title: string;
  description: string;
  version: string;
}

export default registerAs(
  'open-api',
  (): OpenApiConfig => ({
    title: 'kamacash App',
    description: 'Backend for the kamacash app.',
    version: '1.0.0',
  }),
);
