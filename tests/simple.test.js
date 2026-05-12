/**
 * Простые тесты для PlantDiary
 * ЛИСТИНГ 7.1 из методички
 */

// Функция из листинга 7.1
const sum = (a, b) => a + b;

// Тест из листинга 7.1 (точная копия)
test("Сумма 1 + 2 должна быть равна 3", () => {
  expect(sum(1, 2)).toBe(3);
});

// Дополнительные тесты для демонстрации
describe('PlantDiary Дополнительные тесты', () => {
  
  test('Валидация email работает', () => {
    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid')).toBe(false);
  });

  test('Проверка статуса полива', () => {
    const getStatus = (days) => {
      if (days < 0) return 'overdue';
      if (days === 0) return 'today';
      if (days <= 2) return 'soon';
      return 'ok';
    };
    expect(getStatus(-1)).toBe('overdue');
    expect(getStatus(0)).toBe('today');
    expect(getStatus(2)).toBe('soon');
    expect(getStatus(5)).toBe('ok');
  });

  test('Окружение работает', () => {
    expect(true).toBe(true);
  });
});