// tests/plantService.test.js
import { plantService } from '../js/services/PlantService.js';

// Мокаем API запросы
global.fetch = jest.fn();

describe('PlantService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ТЕСТ 1: Расчет дней до полива (как в листинге 7.1)
  test('getDaysUntilWatering возвращает правильное количество дней', async () => {
    const lastWatered = '2026-05-10';
    const interval = 7;
    const today = new Date('2026-05-12');
    jest.spyOn(global, 'Date').mockImplementation(() => today);
    
    const days = await plantService.getDaysUntilWatering(lastWatered, interval);
    // Ожидаем: 10 + 7 = 17 мая, до 12 мая = 5 дней
    expect(days).toBe(5);
  });

  // ТЕСТ 2: Загрузка растений
  test('loadPlants возвращает массив растений', async () => {
    const mockPlants = [{ id: 1, name: 'Монстера' }];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockPlants
    });
    
    const plants = await plantService.loadPlants();
    expect(Array.isArray(plants)).toBe(true);
    expect(plants[0].name).toBe('Монстера');
  });

  // ТЕСТ 3: Обработка ошибки при загрузке
  test('loadPlants выбрасывает ошибку при проблемах с сетью', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    await expect(plantService.loadPlants()).rejects.toThrow();
  });
});