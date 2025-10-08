import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new LoginDto();
    dto.email = 'test@example.com';
    dto.password = 'password';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if email is not a valid email', async () => {
    const dto = new LoginDto();
    dto.email = 'invalid-email';
    dto.password = 'password';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should fail if email is missing', async () => {
    const dto = new LoginDto();
    dto.password = 'password';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail if password is missing', async () => {
    const dto = new LoginDto();
    dto.email = 'test@example.com';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });
});
