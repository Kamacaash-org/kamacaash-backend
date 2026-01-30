import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'username',
      passwordField: 'password',
    });
  }

  async validate(username: string, password: string): Promise<any> {
    try {
      const user = await this.authService.validateUser(username, password);
      if (!user) {
        this.logger.warn(`Failed login attempt for username: ${username}`);
        throw new UnauthorizedException('Invalid credentials');
      }
      this.logger.log(`Successful authentication for username: ${username}`);
      return user;
    } catch (error) {
      this.logger.error(`Authentication error for username: ${username}`, error.stack);
      throw error;
    }
  }
}
