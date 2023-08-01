import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtCompletedGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const status = this.reflector.get<string[]>('status', context.getHandler());
    if (!status) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return user.status.COMPLETED;
  }
}