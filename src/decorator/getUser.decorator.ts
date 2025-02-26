import { createParamDecorator, ExecutionContext } from '@nestjs/common';
interface CustomRequest extends Express.Request {
  user: Record<string, unknown>;
}
export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<CustomRequest>();

    if (data) {
      return request.user[data];
    }
    return request.user;
  },
);
