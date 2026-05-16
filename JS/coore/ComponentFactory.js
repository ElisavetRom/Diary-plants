import { Button } from '../components/Button.js';
import { ToggleSwitch } from '../components/ToggleSwitch.js';
import { PlantCard } from '../components/PlantCard.js';
import { WateringBadge } from '../components/WateringBadge.js';

export class ComponentFactory {
    static createButton(config) {
        return new Button(config);
    }

    static createToggleSwitch(config) {
        return new ToggleSwitch(config);
    }

    static createPlantCard(config) {
        return new PlantCard(config);
    }

    static createWateringBadge(config) {
        return new WateringBadge(config);
    }

    static createComponent(type, config) {
        switch (type) {
            case 'button':
                return this.createButton(config);
            case 'toggle':
                return this.createToggleSwitch(config);
            case 'plant-card':
                return this.createPlantCard(config);
            case 'watering-badge':
                return this.createWateringBadge(config);
            default:
                throw new Error(`Неизвестный тип компонента: ${type}`);
        }
    }
}