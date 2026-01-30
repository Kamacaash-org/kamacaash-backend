import { ApiProperty } from '@nestjs/swagger';

export class LoginRequest {
  @ApiProperty({
    example: 'wllka',
    description: 'The username of the staff member',
  })
  username: string;

  @ApiProperty({
    example: '1234',
    description: 'The password of the staff member',
  })
  password: string;
}
