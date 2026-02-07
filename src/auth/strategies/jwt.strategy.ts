import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../dto/jwt-payload.dto';
import { StaffService } from 'src/modules/staff/staff.service';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly staffService: StaffService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  // async validate(payload: JwtPayload): Promise<any> {
  //   try {
  //     // Handle static admin user
  //     if (payload.username === this.configService.get<string>('ADMIN_USERNAME')) {
  //       this.logger.log(`Admin user authenticated via JWT: ${payload.username}`);
  //       return {
  //         _id: payload.sub,
  //         username: payload.username,
  //         name: this.configService.get<string>('ADMIN_DEFAULT_NAME'),
  //         role: this.configService.get<string>('ADMIN_DEFAULT_ROLE') || 'SUPER_ADMIN',
  //         isAdmin: true,
  //       };
  //     }

  //     // Handle regular staff users
  //     const staff = await this.staffService.findByUsername(payload.username);
  //     if (!staff) {
  //       this.logger.warn(`JWT validation failed: staff not found for username ${payload.username}`);
  //       throw new UnauthorizedException('Invalid token');
  //     }

  //     if (!staff.isActive) {
  //       this.logger.warn(`JWT validation failed: staff ${payload.username} is inactive`);
  //       throw new UnauthorizedException('Account is inactive');
  //     }

  //     this.logger.log(`JWT validation successful for username: ${payload.username}`);

  //     return await this.authService.buildUserObject(staff);
  //   } catch (error) {
  //     this.logger.error(
  //       `JWT validation error for payload: ${JSON.stringify(payload)}`,
  //       error.stack,
  //     );
  //     throw error;
  //   }
  // }
  async validate(payload: JwtPayload): Promise<any> {
    try {
      // Handle static admin user
      if (payload.username === this.configService.get<string>('ADMIN_USERNAME')) {
        this.logger.log(`Admin user authenticated via JWT: ${payload.username}`);

        return {
          sub: payload.sub, // ✅ REQUIRED
          username: payload.username,
          name: this.configService.get<string>('ADMIN_DEFAULT_NAME'),
          role: this.configService.get<string>('ADMIN_DEFAULT_ROLE') || 'SUPER_ADMIN',
          isAdmin: true,
          mustChangePassword: false, // admin excluded
        };
      }

      // Handle regular staff users
      const staff = await this.staffService.findByUsername(payload.username);
      if (!staff) {
        this.logger.warn(`JWT validation failed: staff not found for username ${payload.username}`);
        throw new UnauthorizedException('Invalid token');
      }

      if (!staff.isActive) {
        this.logger.warn(`JWT validation failed: staff ${payload.username} is inactive`);
        throw new UnauthorizedException('Account is inactive');
      }

      this.logger.log(`JWT validation successful for username: ${payload.username}`);

      const userObject = await this.authService.buildUserObject(staff);

      return {
        ...userObject,
        sub: staff._id.toString(),              // ✅ REQUIRED
        mustChangePassword: staff.mustChangePassword, // ✅ REQUIRED
      };
    } catch (error) {
      this.logger.error(
        `JWT validation error for payload: ${JSON.stringify(payload)}`,
        error.stack,
      );
      throw error;
    }
  }

}
