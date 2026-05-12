// tests/authService.test.js
import { authService } from '../js/services/AuthService.js';

describe('AuthService', () => {
  
  // ТЕСТ 5: Проверка валидации email
  test('login проверяет корректность email', async () => {
    const invalidCredentials = { email: 'not-an-email', password: '123' };
    
    await expect(authService.login(invalidCredentials)).rejects.toThrow();
  });

  // ТЕСТ 6: Успешная аутентификация
  test('login возвращает пользователя при правильных данных', async () => {
    const mockUser = { id: 1, email: 'demo@plantdiary.com', password: 'demo123' };
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => [mockUser]
    });
    
    const result = await authService.login({ email: 'demo@plantdiary.com', password: 'demo123' });
    expect(result).toBeDefined();
  });
});