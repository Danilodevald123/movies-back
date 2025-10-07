import { UserRole } from '../../users/entities/user.entity';

export interface JwtUser {
  id: string;
  email: string;
  role: UserRole;
}
