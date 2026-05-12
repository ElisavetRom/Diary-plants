import { BaseComponent } from '../core/BaseComponent.js';
import { Button } from './Button.js';

export class PlantCard extends BaseComponent {
    constructor(config = {}) {
        super({
            id: config.id,
            className: 'plant-card'
        });
        this.plant = config.plant || null;
        this.status = config.status || null;
        this.onWaterClick = config.onWaterClick || null;
        this.onDetailClick = config.onDetailClick || null;
    }

    render() {
        if (!this.plant) {
            return this._renderEmpty();
        }
        
        const card = document.createElement('div');
        card.id = this.id;
        card.className = 'plant-card';
        card.dataset.id = this.plant.id;
        
        const imgContainer = document.createElement('div');
        imgContainer.className = 'plant-card__image-container';
        const img = document.createElement('img');
        img.className = 'plant-card__image';
        img.src = this.plant.imageUrl || 'https://placehold.co/400x400/e2f0da/2d6a4f?text=🌿';
        img.alt = this.plant.name;
        img.onerror = () => { img.src = 'https://placehold.co/400x400/e2f0da/2d6a4f?text=🌿'; };
        imgContainer.appendChild(img);
        
        const content = document.createElement('div');
        content.className = 'plant-card__content';
        
        const title = document.createElement('h3');
        title.className = 'plant-card__title';
        title.textContent = this.plant.name;
        content.appendChild(title);
        
        const type = document.createElement('div');
        type.className = 'plant-card__type';
        type.textContent = this.plant.typeLabel || this._getTypeLabel(this.plant.type);
        content.appendChild(type);
        
        const stats = document.createElement('div');
        stats.className = 'plant-card__stats';
        const lastWateredDate = new Date(this.plant.lastWatered);
        stats.innerHTML = `<span>💧 Последний полив: ${lastWateredDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>`;
        content.appendChild(stats);
        
        if (this.status) {
            const statusBadge = document.createElement('div');
            statusBadge.className = `plant-card__status plant-card__status--${this.status.class}`;
            statusBadge.innerHTML = `${this.status.icon} ${this.status.text}`;
            content.appendChild(statusBadge);
        }
        
        const actions = document.createElement('div');
        actions.className = 'plant-card__actions';
        
        const waterBtn = new Button({
            label: '💧 Полить',
            variant: 'primary',
            className: 'plant-card__btn-water',
            onClick: (e) => {
                e.stopPropagation();
                if (this.onWaterClick) this.onWaterClick(this.plant.id);
            }
        });
        
        const detailBtn = new Button({
            label: '👁️ Подробнее',
            variant: 'secondary',
            className: 'plant-card__btn-detail',
            onClick: (e) => {
                e.stopPropagation();
                if (this.onDetailClick) this.onDetailClick(this.plant.id);
            }
        });
        
        actions.appendChild(waterBtn.render());
        actions.appendChild(detailBtn.render());
        content.appendChild(actions);
        
        card.appendChild(imgContainer);
        card.appendChild(content);
        
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.plant-card__btn-water') && !e.target.closest('.plant-card__btn-detail')) {
                if (this.onDetailClick) this.onDetailClick(this.plant.id);
            }
        });
        
        this.element = card;
        return card;
    }

    _renderEmpty() {
        const div = document.createElement('div');
        div.className = 'plant-card plant-card--empty';
        div.textContent = 'Нет данных';
        return div;
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

    updatePlant(plant, status) {
        this.plant = plant;
        this.status = status;
        this.update();
    }
}