import { Injectable } from '@nestjs/common';
import { DrizzleService } from '../drizzle/drizzle.service';
import { EditUserDto } from './dto';
import { User } from '../drizzle/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UserService {
  constructor(private drizzle: DrizzleService) {}

  async editUser(userId: string, dto: EditUserDto) {
    const [user] = await this.drizzle.client
      .update(User)
      .set(dto)
      .where(eq(User.id, userId))
      .returning({
        id: User.id,
        email: User.email,
        firstName: User.firstName,
        lastName: User.lastName,
        createdAt: User.createdAt,
        updatedAt: User.updatedAt,
      });

    return user;
  }
}
