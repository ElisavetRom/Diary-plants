import { apiService } from './ApiService.js';
import { authService } from './AuthService.js';

class PlantService {
    async loadPlants() {
        const userId = authService.getCurrentUserId();
        if (!userId) return [];
        return await apiService.fetchPlants(userId);
    }

    async getPlantById(plantId) {
        return await apiService.fetchPlantById(plantId);
    }

    async addPlant(plantData) {
        const userId = authService.getCurrentUserId();
        const newPlant = {
            ...plantData,
            userId: userId,
            id: Date.now(),
            createdAt: new Date().toISOString().split('T')[0],
            health: 'healthy',
            typeLabel: this._getTypeLabel(plantData.type)
        };
        return await apiService.createPlant(newPlant);
    }

    async updatePlant(plantId, updates) {
        const plant = await this.getPlantById(plantId);
        if (!plant) throw new Error('Растение не найдено');
        
        const updatedPlant = { ...plant, ...updates };
        return await apiService.updatePlant(plantId, updatedPlant);
    }

    async deletePlant(plantId) {
        return await apiService.deletePlant(plantId);
    }

    async waterPlant(plantId) {
        const plant = await this.getPlantById(plantId);
        if (!plant) return false;
        
        const today = new Date().toISOString().split('T')[0];
        
        const updatedPlant = await this.updatePlant(plantId, {
            lastWatered: today,
            health: 'healthy'
        });
        
        // Добавляем активность в дневник
        await this._addWaterActivity(plantId);
        
        return true;
    }

    async _addWaterActivity(plantId) {
        const userId = authService.getCurrentUserId();
        await apiService.createActivity({
            plantId,
            userId,
            type: 'water',
            date: new Date().toISOString().split('T')[0],
            note: 'Полив растения',
            photo: null
        });
    }

    async getDaysUntilWatering(lastWatered, interval) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const last = new Date(lastWatered);
        last.setHours(0, 0, 0, 0);
        const nextWater = new Date(last);
        nextWater.setDate(last.getDate() + interval);
        const diff = Math.ceil((nextWater - today) / (1000 * 60 * 60 * 24));
        return diff;
    }

    async getPlantsNeedingWater() {
        const plants = await this.loadPlants();
        const plantsWithDays = [];
        
        for (const plant of plants) {
            const days = await this.getDaysUntilWatering(plant.lastWatered, plant.waterInterval);
            plantsWithDays.push({ ...plant, daysUntil: days });
        }
        
        return plantsWithDays
            .filter(p => p.daysUntil <= 1)
            .sort((a, b) => a.daysUntil - b.daysUntil);
    }

    async getOverduePlants() {
        const plants = await this.loadPlants();
        const overdue = [];
        
        for (const plant of plants) {
            const days = await this.getDaysUntilWatering(plant.lastWatered, plant.waterInterval);
            if (days < 0) overdue.push(plant);
        }
        return overdue;
    }

    _getTypeLabel(type) {
        const types = {
            cactus: '🌵 Кактус',
            ficus: '🌳 Фикус',
            orchid: '🌸 Орхидея',
            succulent: '🌱 Суккулент',
            foliage: '🍃 Декоративно-лиственное',
            flowering: '🌺 Цветущее',
            other: '🌿 Другое'
        };
        return types[type] || '🌿 Растение';
    }
}

export const plantService = new PlantService();