import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { GetUser } from '../decorator';
import { JwtGuard } from '../auth/guard';
import { User } from '../drizzle/schema';
import { EditUserDto } from './dto';
import { UserService } from './user.service';

@UseGuards(JwtGuard)
@Controller('users')
export class UserController {
  // with custom Decoratrs
  constructor(private userService: UserService) {}
  @Get('me')
  getMe(@GetUser() user: typeof User) {
    return user;
  }

  @Patch('me')
  editUser(@GetUser('id') userId: string, @Body() dto: EditUserDto) {
    return this.userService.editUser(userId, dto);
  }

  // with raw http request
  // @Get('me')
  // getMe(@Req() req: Request) {
  //   return req.user;
  // }
}
