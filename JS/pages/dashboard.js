/**
 * Dashboard page - ЧИСТЫЙ ООП
 */

import { authService } from '../services/AuthService.js';
import { plantService } from '../services/PlantService.js';
import { activityService } from '../services/ActivityService.js';

// Проверка авторизации
if (!authService.isAuthenticated()) {
    window.location.href = 'login.html';
}

async function initDashboard() {
    console.log('Инициализация дашборда...');
    
    const user = authService.getCurrentUser();
    if (!user) return;
    
    // Имя пользователя
    const userNameSpan = document.getElementById('userName');
    if (userNameSpan) userNameSpan.innerText = user.name;
    
    // Дата
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        dateElement.innerText = new Date().toLocaleDateString('ru-RU', options);
    }
    
    await updateStats();
    await renderAttentionList();
    await renderRecentActivities();
    
    // Совет дня
    const tips = ['Поливай растения утром или вечером, чтобы избежать ожогов листьев.'];
    const tipElement = document.getElementById('dailyTip');
    if (tipElement) tipElement.innerText = tips[0];
}

async function updateStats() {
    const plants = await plantService.loadPlants();
    
    let needWater = 0;
    let overdue = 0;
    
    for (const plant of plants) {
        const days = await plantService.getDaysUntilWatering(plant.lastWatered, plant.waterInterval);
        if (days <= 1) needWater++;
        if (days < 0) overdue++;
    }
    
    document.getElementById('totalPlants').innerText = plants.length;
    document.getElementById('needWater').innerText = needWater;
    document.getElementById('overdueCount').innerText = overdue;
    document.getElementById('healthyCount').innerText = plants.filter(p => p.health === 'healthy').length;
}

async function renderAttentionList() {
    const plants = await plantService.loadPlants();
    const needingWater = [];
    
    for (const plant of plants) {
        const days = await plantService.getDaysUntilWatering(plant.lastWatered, plant.waterInterval);
        if (days <= 1) {
            needingWater.push({ ...plant, daysUntil: days });
        }
    }
    
    needingWater.sort((a, b) => a.daysUntil - b.daysUntil);
    
    const container = document.getElementById('attentionList');
    if (!container) return;
    
    if (needingWater.length === 0) {
        container.innerHTML = '<div class="empty-state-small">✨ Все растения политы вовремя! ✨</div>';
        return;
    }
    
    container.innerHTML = needingWater.map(plant => {
        let statusText, statusClass, statusIcon;
        if (plant.daysUntil < 0) {
            statusText = 'Просрочено!';
            statusClass = 'overdue';
            statusIcon = '🔴';
        } else if (plant.daysUntil === 0) {
            statusText = 'Сегодня!';
            statusClass = 'today';
            statusIcon = '💧';
        } else {
            statusText = `Через ${plant.daysUntil} дн.`;
            statusClass = 'soon';
            statusIcon = '⚠️';
        }
        
        return `
            <div class="critical-item fade-in" data-plant-id="${plant.id}">
                <div class="plant-info">
                    <img src="${plant.imageUrl || 'https://placehold.co/100x100/e2f0da/2d6a4f?text=🌿'}" 
                         style="width:50px;height:50px;border-radius:16px;object-fit:cover"
                         onerror="this.src='https://placehold.co/100x100/e2f0da/2d6a4f?text=🌿'">
                    <div>
                        <strong>${escapeHtml(plant.name)}</strong>
                        <small>${escapeHtml(plant.typeLabel || 'Растение')}</small>
                    </div>
                </div>
                <div class="water-status">
                    <span class="water-badge ${statusClass}">${statusIcon} ${statusText}</span>
                    <button class="water-btn" data-id="${plant.id}">💧 Полить</button>
                </div>
            </div>
        `;
    }).join('');
    
    document.querySelectorAll('.water-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            await plantService.waterPlant(id);
            await updateStats();
            await renderAttentionList();
            await renderRecentActivities();
        });
    });
}

async function renderRecentActivities() {
    const activities = await activityService.loadActivities();
    const recent = activities.slice(0, 5);
    const plants = await plantService.loadPlants();
    const container = document.getElementById('recentActivities');
    
    if (!container) return;
    
    if (recent.length === 0) {
        container.innerHTML = '<div class="empty-state-small">Нет записей в дневнике</div>';
        return;
    }
    
    const typeIcons = { water: '💧', fertilize: '🌿', prune: '✂️', repot: '🏺', treat: '🩺', note: '📝' };
    const typeLabels = { water: 'Полив', fertilize: 'Подкормка', prune: 'Обрезка', repot: 'Пересадка', treat: 'Обработка', note: 'Заметка' };
    
    container.innerHTML = recent.map(activity => {
        const plant = plants.find(p => p.id === activity.plantId);
        const plantName = plant ? plant.name : 'Растение';
        const date = new Date(activity.date);
        const today = new Date();
        
        let dateStr = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
        if (date.toDateString() === today.toDateString()) dateStr = 'Сегодня';
        
        return `
            <div class="activity-item fade-in">
                <span class="activity-icon">${typeIcons[activity.type] || '📝'}</span>
                <div class="activity-info">
                    <strong>${escapeHtml(plantName)}</strong>
                    <span>${escapeHtml(activity.note || typeLabels[activity.type] || 'Действие')}</span>
                </div>
                <span class="activity-date">${dateStr}</span>
            </div>
        `;
    }).join('');
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Кнопка выхода
document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    authService.logout();
});

document.addEventListener('DOMContentLoaded', initDashboard);