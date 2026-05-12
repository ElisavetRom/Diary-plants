import { apiService } from './ApiService.js';
import { authService } from './AuthService.js';
import { plantService } from './PlantService.js';

class ActivityService {
    async loadActivities() {
        const userId = authService.getCurrentUserId();
        if (!userId) return [];
        
        const plants = await plantService.loadPlants();
        let allActivities = [];
        
        for (const plant of plants) {
            const activities = await apiService.fetchActivities(plant.id);
            allActivities = [...allActivities, ...activities];
        }
        
        return allActivities.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    async getPlantActivities(plantId) {
        return await apiService.fetchActivities(plantId);
    }

    async addActivity(plantId, type, note, photo = null) {
        const userId = authService.getCurrentUserId();
        return await apiService.createActivity({
            plantId,
            userId,
            type,
            date: new Date().toISOString().split('T')[0],
            note,
            photo
        });
    }

    async getTotalWateringsCount() {
        const activities = await this.loadActivities();
        return activities.filter(a => a.type === 'water').length;
    }

    async calculateStreak() {
        const activities = await this.loadActivities();
        const dates = [...new Set(activities.map(a => a.date))].sort().reverse();
        
        let streak = 0;
        let expectedDate = new Date();
        expectedDate.setHours(0, 0, 0, 0);
        
        for (let date of dates) {
            const activityDate = new Date(date);
            activityDate.setHours(0, 0, 0, 0);
            const diffDays = Math.floor((expectedDate - activityDate) / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
                streak++;
                expectedDate.setDate(expectedDate.getDate() - 1);
            } else if (diffDays === 1) {
                streak++;
                expectedDate = activityDate;
            } else {
                break;
            }
        }
        return streak;
    }

    async getWeeklyActivityData() {
        const activities = await this.loadActivities();
        const weekDays = [];
        const counts = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            weekDays.push(date.toLocaleDateString('ru-RU', { weekday: 'short' }));
            counts.push(activities.filter(a => a.date === dateStr).length);
        }
        return { labels: weekDays, data: counts };
    }
}

export const activityService = new ActivityService();