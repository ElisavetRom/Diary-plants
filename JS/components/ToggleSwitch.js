import { BaseInteractiveElement } from '../core/BaseInteractiveElement.js';

export class ToggleSwitch extends BaseInteractiveElement {
    constructor(config = {}) {
        super({
            id: config.id,
            className: `toggle ${config.className || ''}`,
            isDisabled: config.isDisabled || false,
            onChange: config.onChange
        });
        this.state = config.initialState || false;
        this.labelOn = config.labelOn || 'Вкл';
        this.labelOff = config.labelOff || 'Выкл';
    }

    render() {
        const toggle = document.createElement('div');
        toggle.id = this.id;
        
        let className = `toggle ${this.state ? 'toggle--on' : 'toggle--off'}`;
        if (this.className) {
            className += ` ${this.className}`;
        }
        if (this.isDisabled) {
            className += ` toggle--disabled`;
        }
        toggle.className = className;
        
        const slider = document.createElement('span');
        slider.className = 'toggle__slider';
        toggle.appendChild(slider);
        
        const label = document.createElement('span');
        label.className = 'toggle__label';
        label.textContent = this.state ? this.labelOn : this.labelOff;
        toggle.appendChild(label);
        
        if (this.isDisabled) {
            toggle.setAttribute('data-disabled', 'true');
        }
        
        this.element = toggle;
        this.attachEvents();
        
        return toggle;
    }

    attachEvents() {
        if (this.element && !this.isDisabled) {
            this.element.addEventListener('click', () => {
                if (!this.isDisabled) {
                    this.state = !this.state;
                    this.element.classList.toggle('toggle--on', this.state);
                    this.element.classList.toggle('toggle--off', !this.state);
                    
                    const label = this.element.querySelector('.toggle__label');
                    if (label) {
                        label.textContent = this.state ? this.labelOn : this.labelOff;
                    }
                    
                    if (typeof this.onChange === 'function') {
                        this.onChange(this.state);
                    }
                }
            });
        }
    }

    setState(state) {
        this.state = state;
        if (this.element) {
            this.element.classList.toggle('toggle--on', state);
            this.element.classList.toggle('toggle--off', !state);
            const label = this.element.querySelector('.toggle__label');
            if (label) {
                label.textContent = state ? this.labelOn : this.labelOff;
            }
        }
    }

    getState() {
        return this.state;
    }
}