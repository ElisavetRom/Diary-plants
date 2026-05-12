/**
 * Date utility functions
 */

export function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

export function getDaysAgoDate(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
}

export function formatDate(dateStr) {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatShortDate(dateStr) {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

export function isToday(dateStr) {
    return dateStr === getTodayDate();
}

export function getDaysDifference(date1Str, date2Str) {
    const date1 = new Date(date1Str);
    const date2 = new Date(date2Str);
    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);
    const diff = Math.ceil((date2 - date1) / (1000 * 60 * 60 * 24));
    return diff;
}