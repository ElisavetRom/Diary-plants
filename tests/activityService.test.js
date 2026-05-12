// tests/activityService.test.js
import { activityService } from '../js/services/ActivityService.js';

describe('ActivityService', () => {
  
  // ТЕСТ 4: Получение еженедельных данных для графика
  test('getWeeklyActivityData возвращает массив из 7 дней', async () => {
    const mockActivities = [
      { date: '2026-05-12', type: 'water' },
      { date: '2026-05-12', type: 'fertilize' },
      { date: '2026-05-11', type: 'water' }
    ];
    
    jest.spyOn(activityService, 'loadActivities').mockResolvedValue(mockActivities);
    
    const result = await activityService.getWeeklyActivityData();
    expect(result.labels).toHaveLength(7);
    expect(result.data).toHaveLength(7);
  });
});