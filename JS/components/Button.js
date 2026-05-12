import { BaseInteractiveElement } from '../core/BaseInteractiveElement.js';

export class Button extends BaseInteractiveElement {
    constructor(config = {}) {
        super({
            id: config.id,
            className: `button ${config.className || ''}`,
            isDisabled: config.isDisabled || false,
            onClick: config.onClick
        });
        this.label = config.label || 'Кнопка';
        this.type = config.type || 'button';
        this.variant = config.variant || 'primary';
    }

    render() {
        const button = document.createElement('button');
        button.id = this.id;
        button.type = this.type;
        
        let className = `button button--${this.variant}`;
        if (this.className) {
            className += ` ${this.className}`;
        }
        if (this.isDisabled) {
            className += ` button--disabled`;
        }
        button.className = className;
        button.textContent = this.label;
        
        if (this.isDisabled) {
            button.disabled = true;
        }
        
        this.element = button;
        this.attachEvents();
        
        return button;
    }

    setLabel(label) {
        this.label = label;
        if (this.element) {
            this.element.textContent = label;
        }
    }

    showLoading() {
        if (this.element) {
            this._originalLabel = this.label;
            this.element.textContent = '⏳ Загрузка...';
            this.disable();
        }
    }

    hideLoading() {
        if (this.element && this._originalLabel) {
            this.element.textContent = this._originalLabel;
            this.enable();
        }
    }
}