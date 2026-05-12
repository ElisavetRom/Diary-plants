import { BaseComponent } from './BaseComponent.js';

export class BaseInteractiveElement extends BaseComponent {
    constructor(config = {}) {
        super(config);
        this.isActive = config.isActive || false;
        this.onClick = config.onClick || null;
        this.onChange = config.onChange || null;
    }

    activate() {
        this.isActive = true;
        if (this.element) {
            this.element.classList.add(`${this.className}--active`);
        }
    }

    deactivate() {
        this.isActive = false;
        if (this.element) {
            this.element.classList.remove(`${this.className}--active`);
        }
    }

    toggle() {
        this.isActive ? this.deactivate() : this.activate();
    }

    attachEvents() {
        if (this.element && typeof this.onClick === 'function') {
            this.element.addEventListener('click', (e) => {
                if (!this.isDisabled) {
                    this.onClick(e);
                }
            });
        }
    }

    removeEvents() {
        if (this.element && typeof this.onClick === 'function') {
            this.element.removeEventListener('click', this.onClick);
        }
    }
}