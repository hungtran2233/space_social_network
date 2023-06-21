import { SetMetadata } from '@nestjs/common';
import { Role } from './role';

export const RoleDecorator = (...roles: Role[]) => SetMetadata('roles', roles);
