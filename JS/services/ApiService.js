/**
 * API Client для работы с сервером
 * 
 * Соответствие требованиям части 6 методички:
 * - 6.4.1 Настройка запросов к API (листинг 6.26)
 * - 6.4.3 Работа с REST API (листинг 6.30)
 * - 6.4.4 Обработка ошибок (листинг 6.32)
 */

const API_BASE_URL = 'https://diary-plants.onrender.com';

class ApiService {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    /**
     * Базовая функция для HTTP-запросов через Fetch API
     * ЛИСТИНГ 6.26
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
        };
        
        const token = localStorage.getItem('auth_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        const config = {
            method: options.method || 'GET',
            headers: headers,
            ...options
        };
        
        if (options.body) {
            config.body = JSON.stringify(options.body);
        }
        
        try {
            // ЛИСТИНГ 6.26: выполнение запроса
            const response = await fetch(url, config);
            
            // ЛИСТИНГ 6.32: проверка статуса ответа
            if (!response.ok) {
                console.error(`Ошибка HTTP: ${response.status} ${response.statusText}`);
                throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log(` API ${config.method} ${endpoint} → статус ${response.status}`);
            
            return { success: true, data, status: response.status };
            
        } catch (error) {
            // ЛИСТИНГ 6.32: логирование ошибки
            console.error('Ошибка при выполнении запроса:', error);
            
            return { 
                success: false, 
                message: 'Не удалось выполнить запрос. Проверьте подключение к серверу.',
                error: error.message
            };
        }
    }

    // ===== REST API методы (листинг 6.30) =====

    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    }

    async post(endpoint, body) {
        return this.request(endpoint, { method: 'POST', body });
    }

    async put(endpoint, body) {
        return this.request(endpoint, { method: 'PUT', body });
    }

    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    // ===== Специфические методы =====

    async fetchUsers() {
        const result = await this.get('/users');
        return result.success ? result.data : [];
    }

    async fetchPlants(userId) {
        const result = await this.get(`/plants?userId=${userId}`);
        return result.success ? result.data : [];
    }

    async fetchPlantById(plantId) {
        const result = await this.get(`/plants/${plantId}`);
        return result.success ? result.data : null;
    }

    async createPlant(plantData) {
        const result = await this.post('/plants', plantData);
        if (result.success) return result.data;
        throw new Error(result.message || 'Ошибка создания растения');
    }

    async updatePlant(plantId, updates) {
        const result = await this.put(`/plants/${plantId}`, updates);
        if (result.success) return result.data;
        throw new Error(result.message || 'Ошибка обновления растения');
    }

    async deletePlant(plantId) {
        const result = await this.delete(`/plants/${plantId}`);
        return result.success;
    }

    async fetchActivities(plantId) {
        const result = await this.get(`/activities?plantId=${plantId}`);
        return result.success ? result.data : [];
    }

    async createActivity(activityData) {
        const result = await this.post('/activities', activityData);
        if (result.success) return result.data;
        throw new Error(result.message || 'Ошибка добавления записи');
    }
}

export const apiService = new ApiService();