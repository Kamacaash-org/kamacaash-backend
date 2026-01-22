import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'wllka@gmail.com',
    description: 'The email of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'abdishakur',
    description: 'The name of the user',
  })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({
    example: 'shakra',
    description: 'The surname of the user',
  })
  @IsNotEmpty()
  @IsString()
  readonly surname: string;

  @ApiProperty({
    example: '1234',
    description: 'The password of the user',
  })
  @IsNotEmpty()
  @IsString()
  password: string;

}
