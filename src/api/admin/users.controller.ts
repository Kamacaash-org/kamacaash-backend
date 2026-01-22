import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiCreatedResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { DeleteUserResponse } from '../../users/dto/delete-response.dto';
import { FindOneParams } from '../../users/dto/find-one-params.dto';
import { UpdateUserDto } from '../../users/dto/update-user.dto';
import { User } from '../../users/schemas/user.schema';
import { UsersService } from '../../users/users.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

// @UseInterceptors(ClassSerializerInterceptor)
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  @ApiOperation({ description: 'Get all users' })
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({
    description: 'The users were successfully obtained.',
    type: [User],
  })
  async getAll(): Promise<User[]> {
    return this.usersService.findAll();
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
  async getById(@Param() { userId }: FindOneParams): Promise<User> {
    return this.usersService.findById(userId);
  }

  @Post()
  @ApiOperation({ description: 'Create a user.' })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: User,
  })
  async create(@Body() user: CreateUserDto): Promise<User> {
    return this.usersService.create(user);
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
  ): Promise<User> {
    return this.usersService.updateById(userId, updateUserDto);
  }

  @Delete(':userId')
  @ApiOperation({
    description: 'Delete a user by userId.',
  })
  @ApiOkResponse({
    description: 'The user was successfully deleted.',
    type: DeleteUserResponse,
  })
  async deleteById(@Param() { userId }: FindOneParams): Promise<DeleteUserResponse> {
    return this.usersService.remove(userId);
  }
}
