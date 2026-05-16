import { authService } from '../services/AuthService.js';
import { plantService } from '../services/PlantService.js';
import { activityService } from '../services/ActivityService.js';


if (!authService.isAuthenticated()) {
    window.location.href = 'login.html';
}

let currentPlant = null;

async function initPlantDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const plantId = parseInt(urlParams.get('id'));
    
    if (!plantId) {
        window.location.href = 'myplants.html';
        return;
    }
    
    currentPlant = await plantService.getPlantById(plantId);
    
    if (!currentPlant) {
        window.location.href = 'myplants.html';
        return;
    }
    
    await renderPlantDetail();
    await renderTimeline();
    setupEventHandlers();
}

async function renderPlantDetail() {
    const container = document.getElementById('plantDetail');
    const days = await plantService.getDaysUntilWatering(currentPlant.lastWatered, currentPlant.waterInterval);
    const lastWateredDate = new Date(currentPlant.lastWatered);
    
  
    let statusText, statusClass, statusIcon;
    if (days < 0) {
        statusText = 'Просрочено!';
        statusClass = 'overdue';
        statusIcon = '🔴';
    } else if (days === 0) {
        statusText = 'Сегодня!';
        statusClass = 'today';
        statusIcon = '💧';
    } else if (days <= 2) {
        statusText = `Через ${days} дн.`;
        statusClass = 'soon';
        statusIcon = '⚠️';
    } else {
        statusText = `Через ${days} дн.`;
        statusClass = 'ok';
        statusIcon = '✅';
    }
    
    container.innerHTML = `
        <div class="plant-detail-header">
            <img src="${currentPlant.imageUrl || 'https://placehold.co/400x400/e2f0da/2d6a4f?text=🌿'}" 
                 class="plant-detail-image" 
                 onerror="this.src='https://placehold.co/400x400/e2f0da/2d6a4f?text=🌿'">
            <div class="plant-detail-info">
                <h1 class="plant-detail-name">${escapeHtml(currentPlant.name)}</h1>
                <p class="plant-detail-scientific">${escapeHtml(currentPlant.typeLabel || 'Растение')}</p>
                <div class="info-grid">
                    <div class="info-item">
                        <div class="info-label">💧 Частота полива</div>
                        <div class="info-value">Каждые ${currentPlant.waterInterval} дней</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">📅 Последний полив</div>
                        <div class="info-value">${lastWateredDate.toLocaleDateString('ru-RU')}</div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">⏰ Следующий полив</div>
                        <div class="info-value"><span class="water-badge ${statusClass}">${statusIcon} ${statusText}</span></div>
                    </div>
                    <div class="info-item">
                        <div class="info-label">📍 Местоположение</div>
                        <div class="info-value">${escapeHtml(currentPlant.location) || 'Не указано'}</div>
                    </div>
                </div>
                <div class="plant-actions-buttons">
                    <button class="button button--primary" id="waterNowBtn">💧 Полить сейчас</button>
                    <button class="button button--secondary" id="addEventBtn">📝 Добавить запись</button>
                    <button class="button button--danger" id="deletePlantBtn">🗑️ Удалить растение</button>
                </div>
            </div>
        </div>
        ${currentPlant.notes ? `
            <div class="plant-notes">
                <h3>📝 Заметки</h3>
                <p>${escapeHtml(currentPlant.notes)}</p>
            </div>
        ` : ''}
        <div class="timeline-section">
            <div class="timeline-header">
                <h2>📖 Дневник ухода</h2>
                <button class="button button--secondary" id="addEventBtn2">➕ Добавить запись</button>
            </div>
            <div id="timelineList" class="timeline-list"></div>
        </div>
    `;
}

async function renderTimeline() {
    const activities = await activityService.getPlantActivities(currentPlant.id);
    const timelineList = document.getElementById('timelineList');
    
    if (!timelineList) return;
    
    if (activities.length === 0) {
        timelineList.innerHTML = '<div class="empty-state-small">📒 Здесь будут записи о поливе, подкормке и других действиях</div>';
        return;
    }
    
    const typeIcons = { water: '💧', fertilize: '🌿', prune: '✂️', repot: '🏺', treat: '🩺', note: '📝' };
    const typeLabels = { water: 'Полив', fertilize: 'Подкормка', prune: 'Обрезка', repot: 'Пересадка', treat: 'Обработка', note: 'Заметка' };
    
    timelineList.innerHTML = activities.map(activity => `
        <div class="timeline-item fade-in">
            <div class="timeline-icon">${typeIcons[activity.type] || '📝'}</div>
            <div class="timeline-content">
                <div class="timeline-date">${new Date(activity.date).toLocaleDateString('ru-RU')}</div>
                <div class="timeline-title"><strong>${typeLabels[activity.type] || activity.type}</strong></div>
                <div class="timeline-note">${escapeHtml(activity.note || '')}</div>
            </div>
            ${activity.photo ? `<img src="${activity.photo}" class="timeline-photo" onerror="this.style.display='none'">` : ''}
        </div>
    `).join('');
}

function setupEventHandlers() {
   
    document.getElementById('waterNowBtn')?.addEventListener('click', async () => {
        await plantService.waterPlant(currentPlant.id);
        currentPlant = await plantService.getPlantById(currentPlant.id);
        await renderPlantDetail();
        await renderTimeline();
    });
    
  
    document.getElementById('addEventBtn')?.addEventListener('click', () => openAddEventModal());
    document.getElementById('addEventBtn2')?.addEventListener('click', () => openAddEventModal());
    
  
    document.getElementById('deletePlantBtn')?.addEventListener('click', async () => {
        if (confirm(`Удалить растение "${currentPlant.name}"?`)) {
            await plantService.deletePlant(currentPlant.id);
            window.location.href = 'myplants.html';
        }
    });
}

function openAddEventModal() {
    const today = new Date().toISOString().split('T')[0];
    const eventTypes = `
        <select id="modalEventType" style="width:100%;padding:12px;border-radius:16px;border:2px solid #e0ecd6;">
            <option value="water">💧 Полив</option>
            <option value="fertilize">🌿 Подкормка</option>
            <option value="prune">✂️ Обрезка</option>
            <option value="repot">🏺 Пересадка</option>
            <option value="treat">🩺 Обработка</option>
            <option value="note">📝 Заметка</option>
        </select>
    `;
    
    const html = `
        <div style="margin-bottom:16px">
            <label style="display:block;margin-bottom:8px;font-weight:600">Тип действия</label>
            ${eventTypes}
        </div>
        <div style="margin-bottom:16px">
            <label style="display:block;margin-bottom:8px;font-weight:600">Дата</label>
            <input type="date" id="modalEventDate" value="${today}" style="width:100%;padding:12px;border-radius:16px;border:2px solid #e0ecd6;">
        </div>
        <div style="margin-bottom:16px">
            <label style="display:block;margin-bottom:8px;font-weight:600">Заметка</label>
            <textarea id="modalEventNote" rows="3" style="width:100%;padding:12px;border-radius:16px;border:2px solid #e0ecd6;" placeholder="Что произошло?"></textarea>
        </div>
        <div style="margin-bottom:16px">
            <label style="display:block;margin-bottom:8px;font-weight:600">Фото (URL)</label>
            <input type="url" id="modalEventPhoto" style="width:100%;padding:12px;border-radius:16px;border:2px solid #e0ecd6;" placeholder="https://...">
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:1000';
    modal.innerHTML = `
        <div style="background:white;border-radius:32px;max-width:500px;width:90%;padding:24px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px">
                <h2 style="color:#2d6a4f">📝 Добавить запись</h2>
                <button id="closeModalBtn" style="background:none;border:none;font-size:28px;cursor:pointer">&times;</button>
            </div>
            <div id="modalContent">${html}</div>
            <div style="display:flex;gap:12px;margin-top:24px">
                <button id="submitModalBtn" class="button button--primary" style="flex:1">💾 Сохранить</button>
                <button id="cancelModalBtn" class="button button--secondary" style="flex:1">Отмена</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeModal = () => modal.remove();
    
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    
    document.getElementById('submitModalBtn')?.addEventListener('click', async () => {
        const eventType = document.getElementById('modalEventType').value;
        const eventDate = document.getElementById('modalEventDate').value;
        const eventNote = document.getElementById('modalEventNote').value;
        const eventPhoto = document.getElementById('modalEventPhoto').value || null;
        
        await activityService.addActivity(currentPlant.id, eventType, eventNote, eventPhoto);
        
        if (eventType === 'water') {
            await plantService.waterPlant(currentPlant.id);
            currentPlant = await plantService.getPlantById(currentPlant.id);
            await renderPlantDetail();
        }
        
        await renderTimeline();
        closeModal();
    });
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

document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    authService.logout();
});

document.addEventListener('DOMContentLoaded', initPlantDetail);