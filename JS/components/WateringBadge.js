import { BaseComponent } from '../core/BaseComponent.js';

export class WateringBadge extends BaseComponent {
    constructor(config = {}) {
        super({
            id: config.id,
            className: 'watering-badge'
        });
        this.daysUntil = config.daysUntil || 0;
    }

    render() {
        const badge = document.createElement('div');
        badge.id = this.id;
        
        const status = this._getStatus();
        
        badge.className = `watering-badge watering-badge--${status.class}`;
        badge.innerHTML = `${status.icon} ${status.text}`;
        
        this.element = badge;
        return badge;
    }

    _getStatus() {
        if (this.daysUntil < 0) {
            return { text: 'Просрочено!', class: 'overdue', icon: '🔴' };
        }
        if (this.daysUntil === 0) {
            return { text: 'Сегодня!', class: 'today', icon: '💧' };
        }
        if (this.daysUntil <= 2) {
            return { text: `Через ${this.daysUntil} дн.`, class: 'soon', icon: '⚠️' };
        }
        return { text: `Через ${this.daysUntil} дн.`, class: 'ok', icon: '✅' };
    }

    setDays(days) {
        this.daysUntil = days;
        this.update();
    }
}