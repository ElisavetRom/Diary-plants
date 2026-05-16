import { authService } from '../services/AuthService.js';
import { plantService } from '../services/PlantService.js';
import { activityService } from '../services/ActivityService.js';


if (!authService.isAuthenticated()) {
    window.location.href = 'login.html';
}

let currentDate = new Date();

async function initCalendar() {
    await renderCalendar();
    await renderActivityChart();
    await renderStatsDetail();
    await renderUpcomingEvents();
    
    document.getElementById('prevMonth')?.addEventListener('click', async () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        await renderCalendar();
    });
    
    document.getElementById('nextMonth')?.addEventListener('click', async () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        await renderCalendar();
    });
}

async function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDayOfWeek = firstDay.getDay() || 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    
    document.getElementById('monthYear').innerText = `${monthNames[month]} ${year}`;
    
    const calendarDays = document.getElementById('calendarDays');
    if (!calendarDays) return;
    calendarDays.innerHTML = '';
    
    const activities = await activityService.loadActivities();
    const activitiesByDate = {};
    activities.forEach(a => {
        if (!activitiesByDate[a.date]) activitiesByDate[a.date] = [];
        activitiesByDate[a.date].push(a);
    });
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    for (let i = startDayOfWeek - 1; i > 0; i--) {
        const day = prevMonthLastDay - i + 1;
        calendarDays.appendChild(createCalendarDay(day, true));
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const hasEvent = activitiesByDate[dateStr] && activitiesByDate[dateStr].length > 0;
        const isToday = dateStr === todayStr;
        calendarDays.appendChild(createCalendarDay(i, false, hasEvent, isToday, dateStr));
    }
    
    const totalCells = Math.ceil((startDayOfWeek - 1 + daysInMonth) / 7) * 7;
    const nextMonthDays = totalCells - (startDayOfWeek - 1 + daysInMonth);
    for (let i = 1; i <= nextMonthDays; i++) {
        calendarDays.appendChild(createCalendarDay(i, true));
    }
}

function createCalendarDay(day, isOtherMonth, hasEvent = false, isToday = false, dateStr = '') {
    const div = document.createElement('div');
    div.className = `calendar-day ${isOtherMonth ? 'other-month' : ''} ${hasEvent ? 'has-event' : ''} ${isToday ? 'today' : ''}`;
    div.innerHTML = `<span>${day}</span>${hasEvent ? '<div class="event-indicator">●</div>' : ''}`;
    
    if (!isOtherMonth && dateStr) {
        div.addEventListener('click', () => showDayEvents(dateStr));
    }
    return div;
}

async function showDayEvents(dateStr) {
    const activities = await activityService.loadActivities();
    const events = activities.filter(a => a.date === dateStr);
    if (events.length === 0) return;
    
    const plants = await plantService.loadPlants();
    const plantMap = {};
    plants.forEach(p => { plantMap[p.id] = p.name; });
    
    const typeLabels = { water: '💧 Полив', fertilize: '🌿 Подкормка', prune: '✂️ Обрезка', repot: '🏺 Пересадка', treat: '🩺 Обработка', note: '📝 Заметка' };
    
    let message = `События за ${new Date(dateStr).toLocaleDateString('ru-RU')}:\n\n`;
    events.forEach(e => {
        message += `• ${plantMap[e.plantId] || 'Растение'}: ${typeLabels[e.type] || e.type}\n`;
        if (e.note) message += `  ${e.note}\n`;
    });
    alert(message);
}

async function renderActivityChart() {
    const weeklyData = await activityService.getWeeklyActivityData();
    const ctx = document.getElementById('activityChart')?.getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: weeklyData.labels,
            datasets: [{
                label: 'Количество действий',
                data: weeklyData.data,
                backgroundColor: '#40916c',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
        }
    });
}

async function renderStatsDetail() {
    const activities = await activityService.loadActivities();
    const plants = await plantService.loadPlants();
    
    const waterCount = activities.filter(a => a.type === 'water').length;
    const fertilizeCount = activities.filter(a => a.type === 'fertilize').length;
    const pruneCount = activities.filter(a => a.type === 'prune').length;
    const repotCount = activities.filter(a => a.type === 'repot').length;
    const uniqueDays = new Set(activities.map(a => a.date)).size;
    
    const container = document.getElementById('statsDetail');
    if (!container) return;
    
    container.innerHTML = `
        <div class="stat-detail-card"><div class="stat-detail-icon">💧</div><div><div class="stat-detail-number">${waterCount}</div><div class="stat-detail-label">Всего поливов</div></div></div>
        <div class="stat-detail-card"><div class="stat-detail-icon">🌿</div><div><div class="stat-detail-number">${fertilizeCount}</div><div class="stat-detail-label">Подкормок</div></div></div>
        <div class="stat-detail-card"><div class="stat-detail-icon">✂️</div><div><div class="stat-detail-number">${pruneCount}</div><div class="stat-detail-label">Обрезок</div></div></div>
        <div class="stat-detail-card"><div class="stat-detail-icon">🏺</div><div><div class="stat-detail-number">${repotCount}</div><div class="stat-detail-label">Пересадок</div></div></div>
        <div class="stat-detail-card"><div class="stat-detail-icon">📅</div><div><div class="stat-detail-number">${uniqueDays}</div><div class="stat-detail-label">Дней с уходом</div></div></div>
        <div class="stat-detail-card"><div class="stat-detail-icon">🌱</div><div><div class="stat-detail-number">${plants.length}</div><div class="stat-detail-label">Растений</div></div></div>
    `;
}

async function renderUpcomingEvents() {
    const plants = await plantService.loadPlants();
    const upcoming = [];
    
    for (const plant of plants) {
        const days = await plantService.getDaysUntilWatering(plant.lastWatered, plant.waterInterval);
        if (days >= 0 && days <= 3) {
            upcoming.push({ ...plant, daysUntil: days });
        }
    }
    
    upcoming.sort((a, b) => a.daysUntil - b.daysUntil);
    
    const container = document.getElementById('upcomingEvents');
    if (!container) return;
    
    if (upcoming.length === 0) {
        container.innerHTML = '<div class="empty-state-small">✨ Нет ближайших событий ✨</div>';
        return;
    }
    
    container.innerHTML = upcoming.map(plant => {
        const status = getWateringStatus(plant.daysUntil);
        return `
            <div class="upcoming-item">
                <img src="${plant.imageUrl || 'https://placehold.co/50x50/e2f0da/2d6a4f?text=🌿'}" class="upcoming-img" onerror="this.src='https://placehold.co/50x50/e2f0da/2d6a4f?text=🌿'">
                <div class="upcoming-info">
                    <strong>${escapeHtml(plant.name)}</strong>
                    <span>${escapeHtml(plant.typeLabel)}</span>
                </div>
                <div class="upcoming-status ${status.class}">${status.icon} ${status.text}</div>
                <button class="water-btn-small" data-id="${plant.id}">💧 Полить</button>
            </div>
        `;
    }).join('');
    
    document.querySelectorAll('.water-btn-small').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = parseInt(btn.dataset.id);
            await plantService.waterPlant(id);
            await renderUpcomingEvents();
            await renderActivityChart();
            await renderStatsDetail();
        });
    });
}

function getWateringStatus(daysUntil) {
    if (daysUntil < 0) return { text: 'Просрочено!', class: 'overdue', icon: '🔴' };
    if (daysUntil === 0) return { text: 'Сегодня!', class: 'today', icon: '💧' };
    if (daysUntil <= 2) return { text: `Через ${daysUntil} дн.`, class: 'soon', icon: '⚠️' };
    return { text: `Через ${daysUntil} дн.`, class: 'ok', icon: '✅' };
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

document.addEventListener('DOMContentLoaded', initCalendar);