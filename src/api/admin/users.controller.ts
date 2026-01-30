import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { DeleteUserResponse } from 'src/modules/users/dto/delete-response.dto';
import { FindOneParams } from 'src/modules/users/dto/find-one-params.dto';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { User } from 'src/modules/users/schemas/user.schema';
import { UsersService } from 'src/modules/users/users.service';
import { ApiResponse } from '../../utils/response.util';
import { MESSAGES } from '../../constants/messages';

// @UseInterceptors(ClassSerializerInterceptor)
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ description: 'Get all users' })
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: 'The users were successfully obtained.',
    type: [User],
  })
  async getAll(): Promise<ApiResponse<User[]>> {
    const data = await this.usersService.findAll();
    return new ApiResponse(200, data, MESSAGES.ADMIN_USER.GET_ALL);
  }

  @Get(':userId')
  @ApiOperation({
    description: 'Get a user by userId.',
  })
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: 'The user was successfully obtained.',
    type: User,
  })
  async getById(@Param() { userId }: FindOneParams): Promise<ApiResponse<User>> {
    const data = await this.usersService.findById(userId);
    return new ApiResponse(200, data, MESSAGES.ADMIN_USER.GET_BY_ID);
  }

  @Post()
  @ApiOperation({ description: 'Create a user.' })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: User,
  })
  async create(@Body() user: CreateUserDto): Promise<ApiResponse<User>> {
    const data = await this.usersService.create(user);
    return new ApiResponse(201, data, MESSAGES.ADMIN_USER.CREATE);
  }

  @Patch(':userId')
  @ApiOperation({
    description: 'Update a user by userId.',
  })
  @ApiOkResponse({
    description: 'The user was successfully updated.',
    type: User,
  })
  async update(
    @Param() { userId }: FindOneParams,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<User>> {
    const data = await this.usersService.updateById(userId, updateUserDto);
    return new ApiResponse(200, data, MESSAGES.ADMIN_USER.UPDATE);
  }

  @Delete(':userId')
  @ApiOperation({
    description: 'Delete a user by userId.',
  })
  @ApiOkResponse({
    description: 'The user was successfully deleted.',
    type: DeleteUserResponse,
  })
  async deleteById(@Param() { userId }: FindOneParams): Promise<ApiResponse<DeleteUserResponse>> {
    const data = await this.usersService.remove(userId);
    return new ApiResponse(200, data, MESSAGES.ADMIN_USER.DELETE);
  }
}
