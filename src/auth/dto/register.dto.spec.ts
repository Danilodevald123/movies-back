import { validate } from 'class-validator';
import { RegisterDto } from './register.dto';

describe('RegisterDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail if email is not a valid email', async () => {
    const dto = new RegisterDto();
    dto.email = 'not-an-email';
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
    expect(errors[0].constraints).toHaveProperty('isEmail');
  });

  it('should fail if password is too short', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';
    dto.password = '12345';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  it('should fail if email is missing', async () => {
    const dto = new RegisterDto();
    dto.password = 'password123';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('email');
  });

  it('should fail if password is missing', async () => {
    const dto = new RegisterDto();
    dto.email = 'test@example.com';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('password');
  });
});
