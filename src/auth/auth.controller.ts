import { Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { CurrentUser } from './current-user.decorator';
import { LoginRequest } from './dto/login-request.dto';
import { LoginResponse } from './dto/login-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Staff, StaffDocument } from 'src/modules/staff/schemas/staff.schema';

@ApiTags('auth')
@Controller('admin/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ApiOperation({ description: 'Login user' })
  @ApiOkResponse({
    description: 'The users logged in successfully.',
    type: LoginResponse,
  })
  @ApiBody({
    description: 'Credentials of user',
    type: LoginRequest,
  })
  @Post('login')
  async login(@CurrentUser() staff: StaffDocument): Promise<LoginResponse> {
    return this.authService.login(staff);
  }
}
