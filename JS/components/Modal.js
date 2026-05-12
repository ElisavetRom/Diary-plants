import { BaseComponent } from '../core/BaseComponent.js';
import { Button } from './Button.js';

export class Modal extends BaseComponent {
    constructor(config = {}) {
        super({
            id: config.id,
            className: 'modal'
        });
        this.title = config.title || 'Модальное окно';
        this.content = config.content || '';
        this.onClose = config.onClose || null;
        this.onSubmit = config.onSubmit || null;
        this.isOpen = false;
    }

    render() {
        const modal = document.createElement('div');
        modal.id = this.id;
        modal.className = `modal ${this.isOpen ? 'modal--open' : ''}`;
        modal.style.display = this.isOpen ? 'flex' : 'none';
        
        const content = document.createElement('div');
        content.className = 'modal__content';
        
        const header = document.createElement('div');
        header.className = 'modal__header';
        
        const title = document.createElement('h2');
        title.className = 'modal__title';
        title.textContent = this.title;
        header.appendChild(title);
        
        const closeBtn = document.createElement('span');
        closeBtn.className = 'modal__close';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => this.close());
        header.appendChild(closeBtn);
        
        content.appendChild(header);
        
        const body = document.createElement('div');
        body.className = 'modal__body';
        
        if (typeof this.content === 'string') {
            body.innerHTML = this.content;
        } else if (this.content instanceof HTMLElement) {
            body.appendChild(this.content);
        }
        content.appendChild(body);
        
        const footer = document.createElement('div');
        footer.className = 'modal__footer';
        
        const cancelBtn = new Button({
            label: 'Отмена',
            variant: 'secondary',
            onClick: () => this.close()
        });
        
        const submitBtn = new Button({
            label: 'Сохранить',
            variant: 'primary',
            onClick: () => {
                if (this.onSubmit) this.onSubmit();
                this.close();
            }
        });
        
        footer.appendChild(cancelBtn.render());
        footer.appendChild(submitBtn.render());
        content.appendChild(footer);
        
        modal.appendChild(content);
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.close();
        });
        
        this.element = modal;
        return modal;
    }

    open() {
        this.isOpen = true;
        if (this.element) {
            this.element.classList.add('modal--open');
            this.element.style.display = 'flex';
        } else {
            const rendered = this.render();
            document.body.appendChild(rendered);
            this.element = rendered;
        }
    }

    close() {
        this.isOpen = false;
        if (this.element) {
            this.element.classList.remove('modal--open');
            this.element.style.display = 'none';
            if (this.onClose) this.onClose();
        }
    }

    setContent(content) {
        this.content = content;
        if (this.element) {
            const body = this.element.querySelector('.modal__body');
            if (body) {
                if (typeof content === 'string') {
                    body.innerHTML = content;
                } else if (content instanceof HTMLElement) {
                    body.innerHTML = '';
                    body.appendChild(content);
                }
            }
        }
    }
}