/**
 * Profile page - ЧИСТЫЙ ООП
 */

import { authService } from '../services/AuthService.js';
import { plantService } from '../services/PlantService.js';
import { activityService } from '../services/ActivityService.js';

// Проверка авторизации
if (!authService.isAuthenticated()) {
    window.location.href = 'login.html';
}

async function initProfile() {
    const user = authService.getCurrentUser();
    if (!user) return;
    
    // Отображаем данные профиля
    document.getElementById('profileName').innerText = user.name;
    document.getElementById('profileEmail').innerText = user.email;
    document.getElementById('profileCity').innerText = user.profile?.city || 'Не указан';
    document.getElementById('profileBio').innerText = user.profile?.bio || 'Не указано';
    
    const joinDate = user.profile?.joinDate || new Date().toISOString().split('T')[0];
    document.getElementById('joinDate').innerHTML = `🌱 Присоединился ${new Date(joinDate).toLocaleDateString('ru-RU')}`;
    
    // Аватар
    const avatarDisplay = document.getElementById('avatarDisplay');
    if (user.profile?.avatar) {
        avatarDisplay.innerHTML = `<img src="${user.profile.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%">`;
    } else {
        avatarDisplay.innerHTML = '👩‍🌾';
    }
    
    await loadStats();
    await renderBadges();
    
    // Настройки
    const toggle = document.getElementById('notificationsToggle');
    if (toggle) {
        toggle.checked = user.profile?.notifications !== false;
        toggle.addEventListener('change', async (e) => {
            await authService.updateProfile({ notifications: e.target.checked });
            location.reload();
        });
    }
    
    const unitsSelect = document.getElementById('unitsSelect');
    if (unitsSelect) {
        unitsSelect.value = user.profile?.units || 'celsius';
        unitsSelect.addEventListener('change', async (e) => {
            await authService.updateProfile({ units: e.target.value });
        });
    }
}

async function loadStats() {
    const plants = await plantService.loadPlants();
    const activities = await activityService.loadActivities();
    const waterCount = activities.filter(a => a.type === 'water').length;
    
    document.getElementById('userTotalPlants').innerText = plants.length;
    document.getElementById('userTotalWaterings').innerText = waterCount;
    
    // Streak
    let streak = 0;
    const dates = [...new Set(activities.map(a => a.date))].sort().reverse();
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
    document.getElementById('userStreak').innerText = streak;
    
    let level = '🌱 Новичок';
    if (waterCount > 50) level = '🌟 Эксперт';
    else if (waterCount > 20) level = '🌿 Опытный';
    else if (waterCount > 5) level = '🍃 Любитель';
    document.getElementById('userLevel').innerHTML = level;
}

async function renderBadges() {
    const plants = await plantService.loadPlants();
    const activities = await activityService.loadActivities();
    const waterCount = activities.filter(a => a.type === 'water').length;
    const streak = parseInt(document.getElementById('userStreak')?.innerText || 0);
    
    const badges = [
        { id: 'first', name: 'Первый росток', icon: '🌱', unlocked: plants.length >= 1 },
        { id: 'collector', name: 'Коллекционер', icon: '🌿', unlocked: plants.length >= 3 },
        { id: 'master', name: 'Мастер полива', icon: '💧', unlocked: waterCount >= 10 },
        { id: 'expert', name: 'Эксперт', icon: '🌟', unlocked: waterCount >= 30 },
        { id: 'streak', name: '7 дней заботы', icon: '🔥', unlocked: streak >= 7 },
        { id: 'greenhouse', name: 'Оранжерея', icon: '🏠', unlocked: plants.length >= 5 }
    ];
    
    const container = document.getElementById('badgesContainer');
    if (container) {
        container.innerHTML = badges.map(badge => `
            <div class="badge-item ${badge.unlocked ? 'unlocked' : ''}">
                <div class="badge-icon">${badge.icon}</div>
                <div class="badge-name">${badge.name}</div>
            </div>
        `).join('');
    }
}

// Глобальные функции для HTML
// Замените функцию window.editProfile на эту:

window.editProfile = function() {
    const user = authService.getCurrentUser();
    
    // Создаём модальное окно с CSS-классами
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    
    modal.innerHTML = `
        <div class="custom-modal__content">
            <div class="custom-modal__header">
                <h2 class="custom-modal__title">✏️ Редактирование профиля</h2>
                <p class="custom-modal__subtitle">Обнови информацию о себе</p>
            </div>
            
            <div class="custom-modal__body">
                <div class="modal-field">
                    <label class="modal-field__label">👤 Имя</label>
                    <input type="text" id="editName" class="modal-field__input" value="${escapeHtml(user.name)}">
                </div>
                
                <div class="modal-field">
                    <label class="modal-field__label">📧 Email</label>
                    <input type="email" id="editEmail" class="modal-field__input" value="${escapeHtml(user.email)}">
                </div>
                
                <div class="modal-field">
                    <label class="modal-field__label">📍 Город</label>
                    <input type="text" id="editCity" class="modal-field__input" value="${escapeHtml(user.profile?.city || '')}" placeholder="Например: Москва">
                </div>
                
                <div class="modal-field">
                    <label class="modal-field__label">🌱 О себе</label>
                    <textarea id="editBio" class="modal-field__textarea" rows="3" placeholder="Расскажи о своих растениях...">${escapeHtml(user.profile?.bio || '')}</textarea>
                </div>
            </div>
            
            <div class="custom-modal__footer">
                <button class="button button--secondary" id="cancelModalBtn">Отмена</button>
                <button class="button button--primary" id="saveModalBtn">💾 Сохранить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Закрытие по клику на фон
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    // Кнопка отмены
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => modal.remove());
    
    // Кнопка сохранения
    document.getElementById('saveModalBtn')?.addEventListener('click', async () => {
        const newName = document.getElementById('editName').value.trim();
        const newEmail = document.getElementById('editEmail').value.trim();
        const newCity = document.getElementById('editCity').value.trim();
        const newBio = document.getElementById('editBio').value.trim();
        
        const updates = {};
        if (newName) updates.name = newName;
        if (newEmail) updates.email = newEmail;
        if (newCity !== undefined) updates.city = newCity;
        if (newBio !== undefined) updates.bio = newBio;
        
        await authService.updateProfile(updates);
        modal.remove();
        location.reload();
    });
};

// Функция для аватарки тоже можно сделать красивой
window.changeAvatar = function() {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    
    modal.innerHTML = `
        <div class="custom-modal__content">
            <div class="custom-modal__header">
                <h2 class="custom-modal__title">🖼️ Сменить аватар</h2>
                <p class="custom-modal__subtitle">Введите URL нового изображения</p>
            </div>
            
            <div class="custom-modal__body">
                <div class="modal-field">
                    <label class="modal-field__label">🔗 URL аватарки</label>
                    <input type="url" id="avatarUrl" class="modal-field__input" placeholder="https://example.com/avatar.jpg">
                    <div id="urlError" style="color: #e76f51; font-size: 0.75rem; margin-top: 6px; display: none;">
                        ⚠️ Пожалуйста, введите корректный URL-адрес (начинается с http:// или https://)
                    </div>
                </div>
                <div id="avatarPreview" style="margin-top: 16px; text-align: center; display: none;">
                    <img style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover;">
                </div>
            </div>
            
            <div class="custom-modal__footer">
                <button class="button button--secondary" id="cancelModalBtn">Отмена</button>
                <button class="button button--primary" id="saveModalBtn">💾 Сохранить</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const urlInput = document.getElementById('avatarUrl');
    const previewDiv = document.getElementById('avatarPreview');
    const previewImg = previewDiv?.querySelector('img');
    const errorDiv = document.getElementById('urlError');
    const saveBtn = document.getElementById('saveModalBtn');
    
    // Функция валидации URL
    function isValidUrl(string) {
        if (!string || string.trim() === '') {
            return { valid: true, message: '' }; // Пустое значение разрешено (сброс аватарки)
        }
        try {
            const url = new URL(string);
            return { 
                valid: url.protocol === 'http:' || url.protocol === 'https:',
                message: 'URL должен начинаться с http:// или https://'
            };
        } catch {
            return { 
                valid: false, 
                message: 'Пожалуйста, введите корректный URL-адрес (пример: https://example.com/photo.jpg)'
            };
        }
    }
    
    // Проверка при вводе
    function validateUrl() {
        const value = urlInput.value;
        const validation = isValidUrl(value);
        
        if (!validation.valid) {
            errorDiv.textContent = `⚠️ ${validation.message}`;
            errorDiv.style.display = 'block';
            urlInput.style.borderColor = '#e76f51';
            saveBtn.disabled = true;
            saveBtn.style.opacity = '0.5';
            saveBtn.style.cursor = 'not-allowed';
            return false;
        } else {
            errorDiv.style.display = 'none';
            urlInput.style.borderColor = '#e0ecd6';
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
            saveBtn.style.cursor = 'pointer';
            return true;
        }
    }
    
    // Предпросмотр при вводе
    urlInput?.addEventListener('input', (e) => {
        validateUrl();
        
        if (e.target.value && isValidUrl(e.target.value).valid) {
            previewImg.src = e.target.value;
            previewDiv.style.display = 'block';
        } else if (!e.target.value) {
            previewDiv.style.display = 'none';
            previewImg.src = '';
        }
    });
    
    // Валидация перед сохранением
    saveBtn?.addEventListener('click', async () => {
        if (!validateUrl()) {
            return; // Не сохраняем, если валидация не пройдена
        }
        
        const url = urlInput.value.trim();
        
        // Дополнительная проверка: если URL не пустой, проверяем что он загружается
        if (url) {
            saveBtn.textContent = '⏳ Проверка...';
            saveBtn.disabled = true;
            
            // Проверяем, что изображение действительно загружается
            const img = new Image();
            img.onload = async () => {
                await authService.updateProfile({ avatar: url });
                modal.remove();
                location.reload();
            };
            img.onerror = () => {
                errorDiv.textContent = '⚠️ Изображение не найдено по указанному URL. Проверьте ссылку.';
                errorDiv.style.display = 'block';
                urlInput.style.borderColor = '#e76f51';
                saveBtn.textContent = '💾 Сохранить';
                saveBtn.disabled = false;
                saveBtn.style.opacity = '1';
            };
            img.src = url;
        } else {
            // Пустое значение - сбрасываем аватар
            await authService.updateProfile({ avatar: null });
            modal.remove();
            location.reload();
        }
    });
    
    // Закрытие по клику на фон
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    // Кнопка отмены
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => modal.remove());
};

// Модальное окно для подтверждения сброса данных
window.resetAllData = function() {
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    
    modal.innerHTML = `
        <div class="custom-modal__content">
            <div class="custom-modal__header" style="background: linear-gradient(135deg, #e76f51, #d95a3a);">
                <h2 class="custom-modal__title">⚠️ ВНИМАНИЕ!</h2>
                <p class="custom-modal__subtitle">Это действие нельзя отменить</p>
            </div>
            
            <div class="custom-modal__body">
                <p style="text-align: center; font-size: 1.1rem; margin: 20px 0;">
                    Вы уверены, что хотите удалить <strong>ВСЕ</strong> данные о растениях?
                </p>
                <p style="text-align: center; color: #8ba06e;">
                    Будут удалены все растения и история ухода
                </p>
            </div>
            
            <div class="custom-modal__footer">
                <button class="button button--secondary" id="cancelModalBtn">Отмена</button>
                <button class="button button--danger" id="confirmModalBtn">🗑️ Да, удалить всё</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    document.getElementById('cancelModalBtn')?.addEventListener('click', () => modal.remove());
    
    document.getElementById('confirmModalBtn')?.addEventListener('click', async () => {
        const plants = await plantService.loadPlants();
        for (const plant of plants) {
            await plantService.deletePlant(plant.id);
        }
        modal.remove();
        alert('Все данные удалены!');
        location.reload();
    });
};

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

document.addEventListener('DOMContentLoaded', initProfile);