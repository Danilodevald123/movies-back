import { UserRole } from '../../users/entities/user.entity';

export interface JwtUser {
  id: string;
  username: string | null;
  email: string;
  role: UserRole;
}
