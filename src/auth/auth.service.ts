import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import { DrizzleService } from '../drizzle/drizzle.service';
import * as argon from 'argon2';
import { User } from '../drizzle/schema';
import { eq } from 'drizzle-orm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private drizzle: DrizzleService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async signUp(dto: AuthDto) {
    //generate the password hash
    const hash = await argon.hash(dto.password);
    // save the new user in the db
    try {
      const [user] = await this.drizzle.client
        .insert(User)
        .values({
          email: dto.email,
          hash,
        })
        .returning({
          id: User.id,
          email: User.email,
          firstName: User.firstName,
          lastName: User.lastName,
          createdAt: User.createdAt,
          updatedAt: User.updatedAt,
        });
      console.log(user);
      // return the saved user
      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof Error && 'code' in error) {
        if (error.code === '23505') {
          throw new ForbiddenException('Credentials already exits');
        }
      }
      throw error;
    }
  }

  async signin(dto: AuthDto) {
    //find the user by email
    const user = await this.drizzle.client.query.User.findFirst({
      where: eq(User.email, dto.email),
    });

    // if user does not exist throw exeception
    if (!user) {
      throw new ForbiddenException('Credentials incorrect');
    }

    // compare password
    const pwMatches = await argon.verify(user.hash, dto.password);

    //if password incorrect throw exeception
    if (!pwMatches) {
      throw new ForbiddenException('Credentials incorrect');
    }

    return this.signToken(user.id, user.email);
  }

  async signToken(
    userId: string,
    email: string,
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email,
    };

    const secret = this.config.get<string>('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    return {
      access_token: token,
    };
  }
}
