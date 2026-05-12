/**
 * My plants page - ЧИСТЫЙ ООП
 */

import { authService } from '../services/AuthService.js';
import { plantService } from '../services/PlantService.js';

// Проверка авторизации
if (!authService.isAuthenticated()) {
    window.location.href = 'login.html';
}

async function initMyPlants() {
    await renderPlantsGrid();
    setupFilters();
}

async function renderPlantsGrid() {
    let plants = await plantService.loadPlants();
    
    // Поиск
    const searchTerm = document.getElementById('searchInput')?.value || '';
    if (searchTerm) {
        plants = plants.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    
    // Фильтр
    const activeFilter = document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
    if (activeFilter === 'need-water') {
        const needWater = [];
        for (const plant of plants) {
            const days = await plantService.getDaysUntilWatering(plant.lastWatered, plant.waterInterval);
            if (days <= 1) needWater.push(plant);
        }
        plants = needWater;
    }
    if (activeFilter === 'healthy') {
        plants = plants.filter(p => p.health === 'healthy');
    }
    
    const grid = document.getElementById('plantsGrid');
    const emptyState = document.getElementById('emptyState');
    
    if (!grid) return;
    
    if (plants.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.style.display = 'block';
        updatePlantsCount(0);
        return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    updatePlantsCount(plants.length);
    
    // Получаем статусы
    const plantsWithStatus = [];
    for (const plant of plants) {
        const days = await plantService.getDaysUntilWatering(plant.lastWatered, plant.waterInterval);
        let status = { text: '✅', class: 'ok' };
        if (days < 0) status = { text: '🔴 Просрочено!', class: 'overdue' };
        else if (days === 0) status = { text: '💧 Сегодня!', class: 'today' };
        else if (days <= 2) status = { text: `⚠️ Через ${days} дн.`, class: 'soon' };
        else status = { text: `✅ Через ${days} дн.`, class: 'ok' };
        plantsWithStatus.push({ plant, status });
    }
    
    grid.innerHTML = plantsWithStatus.map(({ plant, status }) => `
        <div class="plant-card" data-id="${plant.id}">
            <img src="${plant.imageUrl || 'https://placehold.co/400x400/e2f0da/2d6a4f?text=🌿'}" 
                 class="plant-card-img" 
                 onerror="this.src='https://placehold.co/400x400/e2f0da/2d6a4f?text=🌿'">
            <div class="plant-card-content">
                <h3 class="plant-card-title">${escapeHtml(plant.name)}</h3>
                <div class="plant-card-type">${plant.typeLabel || 'Растение'}</div>
                <div class="plant-card-stats">
                    <span>💧 Последний полив: ${new Date(plant.lastWatered).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                </div>
                <div class="plant-card-stats">
                    <span class="water-badge ${status.class}">${status.text}</span>
                </div>
                <div class="plant-actions">
                    <button class="btn-water-card" data-id="${plant.id}">💧 Полить</button>
                    <button class="btn-detail-card" data-id="${plant.id}">👁️ Подробнее</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Обработчики кнопок
    document.querySelectorAll('.btn-water-card').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            await plantService.waterPlant(id);
            await renderPlantsGrid();
        });
    });
    
    document.querySelectorAll('.btn-detail-card, .plant-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-water-card')) return;
            const plantCard = card.closest('.plant-card');
            if (plantCard) {
                window.location.href = `plantdetail.html?id=${plantCard.dataset.id}`;
            }
        });
    });
}

function setupFilters() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', () => renderPlantsGrid());
    }
    
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            await renderPlantsGrid();
        });
    });
}

function updatePlantsCount(count) {
    const countElement = document.getElementById('plantsCount');
    if (countElement) countElement.innerText = count;
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

document.addEventListener('DOMContentLoaded', initMyPlants);