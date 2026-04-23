import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

@Injectable()
export class RefreshAuthGuard extends AuthGuard('jwt-refresh') {
    constructor(private readonly reflector : Reflector){
        super();
    }
     canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
            return super.canActivate(context);
    }
}
