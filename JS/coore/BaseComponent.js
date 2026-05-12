export class BaseComponent {
    constructor(config = {}) {
        this.id = config.id || `component_${Date.now()}_${Math.random()}`;
        this.className = config.className || '';
        this.isDisabled = config.isDisabled || false;
        this.element = null;
        this.parentElement = null;
    }

    render() {
        throw new Error('Метод render() должен быть переопределён в дочернем классе');
    }

    attachEvents() {}

    removeEvents() {}

    enable() {
        this.isDisabled = false;
        if (this.element) {
            this.element.removeAttribute('disabled');
            this.element.classList.remove(`${this.className}--disabled`);
        }
    }

    disable() {
        this.isDisabled = true;
        if (this.element) {
            this.element.setAttribute('disabled', 'true');
            this.element.classList.add(`${this.className}--disabled`);
        }
    }

    mount(container) {
        this.parentElement = container;
        const rendered = this.render();
        if (container) {
            container.appendChild(rendered);
        }
        this.attachEvents();
    }

    unmount() {
        this.removeEvents();
        if (this.element && this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
        }
        this.element = null;
    }
}