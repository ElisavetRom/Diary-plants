import { authService } from '../services/AuthService.js';
import { plantService } from '../services/PlantService.js';


if (!authService.isAuthenticated()) {
    window.location.href = 'login.html';
}

async function initAddPlant() {
    const form = document.getElementById('addPlantForm');
    if (form) {
        form.addEventListener('submit', handleAddPlant);
    }
    

    const lastWateredInput = document.getElementById('lastWatered');
    if (lastWateredInput) {
        lastWateredInput.value = new Date().toISOString().split('T')[0];
    }
    

    const imageInput = document.getElementById('plantImage');
    const preview = document.getElementById('imagePreview');
    
    if (imageInput && preview) {

        imageInput.addEventListener('input', (e) => {
            validateImageUrl(e.target.value, preview);
        });
        

        imageInput.addEventListener('blur', (e) => {
            validateImageUrl(e.target.value, preview, true);
        });
    }
    
}


function validateImageUrl(url, previewElement, showError = false) {
    const errorId = 'imageUrlError';
    let errorDiv = document.getElementById(errorId);
    

    if (errorDiv) {
        errorDiv.remove();
    }
    
    if (!url || url.trim() === '') {
        if (previewElement) {
            previewElement.innerHTML = '';
        }
        return true;
    }
    

    const validation = isValidImageUrl(url);
    
    if (!validation.valid) {
        if (showError) {

            errorDiv = document.createElement('div');
            errorDiv.id = errorId;
            errorDiv.style.cssText = 'color: #e76f51; font-size: 0.75rem; margin-top: 6px;';
            errorDiv.innerHTML = `⚠️ ${validation.message}`;
            
            const parent = previewElement?.parentElement;
            if (parent && !document.getElementById(errorId)) {
                parent.appendChild(errorDiv);
            }
            
  
            const input = document.getElementById('plantImage');
            if (input) {
                input.style.borderColor = '#e76f51';
            }
            
            if (previewElement) {
                previewElement.innerHTML = '';
            }
        }
        return false;
    }
    
   
    if (showError) {
        const img = new Image();
        img.onload = () => {
            if (previewElement) {
                previewElement.innerHTML = `<img src="${url}" style="max-width:200px;border-radius:16px;margin-top:10px; border:2px solid #40916c;">`;
            }
         
            const input = document.getElementById('plantImage');
            if (input) {
                input.style.borderColor = '#e0ecd6';
            }
        };
        img.onerror = () => {
            if (previewElement) {
                previewElement.innerHTML = `<div style="color:#e76f51; margin-top:10px; padding:10px; background:#ffe0db; border-radius:12px;">
                    ⚠️ Изображение не загружено. Проверьте URL или используйте предложенные фото ниже.
                </div>`;
            }
            const input = document.getElementById('plantImage');
            if (input) {
                input.style.borderColor = '#e76f51';
            }
            
            if (!errorDiv || !document.getElementById(errorId)) {
                errorDiv = document.createElement('div');
                errorDiv.id = errorId;
                errorDiv.style.cssText = 'color: #e76f51; font-size: 0.75rem; margin-top: 6px;';
                errorDiv.innerHTML = '⚠️ Изображение не найдено по указанному URL';
                const parent = previewElement?.parentElement;
                if (parent) parent.appendChild(errorDiv);
            }
        };
        img.src = url;
    }
    
    return true;
}


function isValidImageUrl(string) {
    if (!string || string.trim() === '') {
        return { valid: true, message: '' };
    }
    
  
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i;
    const hasImageExtension = imageExtensions.test(string);
    
    try {
        const url = new URL(string);
        const isValidProtocol = url.protocol === 'http:' || url.protocol === 'https:';
        
        if (!isValidProtocol) {
            return { 
                valid: false, 
                message: 'URL должен начинаться с http:// или https://'
            };
        }
        
        if (!hasImageExtension) {
            return {
                valid: false,
                message: 'URL должен указывать на изображение (jpg, png, gif, webp, svg)'
            };
        }
        
        return { valid: true, message: '' };
    } catch {
        return { 
            valid: false, 
            message: 'Пожалуйста, введите корректный URL-адрес (пример: https://example.com/plant.jpg)'
        };
    }
}


function validateForm(plantData) {
    const errors = [];
    

    if (!plantData.name || plantData.name.trim() === '') {
        errors.push('Введите название растения');
        highlightError('plantName');
    } else {
        clearError('plantName');
    }
    

    if (!plantData.type || plantData.type === '') {
        errors.push('Выберите тип растения');
        highlightError('plantType');
    } else {
        clearError('plantType');
    }
    
    if (!plantData.waterInterval || plantData.waterInterval < 1 || plantData.waterInterval > 60) {
        errors.push('Частота полива должна быть от 1 до 60 дней');
        highlightError('waterInterval');
    } else {
        clearError('waterInterval');
    }
    
    if (plantData.imageUrl && plantData.imageUrl.trim() !== '') {
        const urlValidation = isValidImageUrl(plantData.imageUrl);
        if (!urlValidation.valid) {
            errors.push(urlValidation.message);
            highlightError('plantImage');
        } else {
            clearError('plantImage');
        }
    }
    
    return errors;
}

function highlightError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.style.borderColor = '#e76f51';
        
        const errorId = `${fieldId}Error`;
        if (!document.getElementById(errorId)) {
            const errorDiv = document.createElement('div');
            errorDiv.id = errorId;
            errorDiv.style.cssText = 'color: #e76f51; font-size: 0.75rem; margin-top: 6px;';
            
            let message = '';
            switch (fieldId) {
                case 'plantName':
                    message = '⚠️ Введите название растения';
                    break;
                case 'plantType':
                    message = '⚠️ Выберите тип растения';
                    break;
                case 'waterInterval':
                    message = '⚠️ Укажите частоту полива (1-60 дней)';
                    break;
                case 'plantImage':
                    message = '⚠️ Некорректный URL изображения';
                    break;
            }
            errorDiv.innerHTML = message;
            field.parentElement.appendChild(errorDiv);
        }
    }
}

function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.style.borderColor = '#e0ecd6';
        
        const errorId = `${fieldId}Error`;
        const errorDiv = document.getElementById(errorId);
        if (errorDiv) {
            errorDiv.remove();
        }
    }
}

async function handleAddPlant(e) {
    e.preventDefault();
    
    const allErrors = document.querySelectorAll('[id$="Error"]');
    allErrors.forEach(error => error.remove());
    
    const plantData = {
        name: document.getElementById('plantName').value.trim(),
        type: document.getElementById('plantType').value,
        waterInterval: parseInt(document.getElementById('waterInterval').value),
        lastWatered: document.getElementById('lastWatered').value || new Date().toISOString().split('T')[0],
        imageUrl: document.getElementById('plantImage').value.trim(),
        notes: document.getElementById('plantNotes').value.trim(),
        location: document.getElementById('plantLocation').value.trim(),
        typeLabel: getTypeLabel(document.getElementById('plantType').value)
    };
    

    const errors = validateForm(plantData);
    
    if (errors.length > 0) {
   
        alert(`❌ Пожалуйста, исправьте следующие ошибки:\n\n${errors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`);
        return;
    }
    
    if (!plantData.imageUrl) {
        plantData.imageUrl = getDefaultImageForType(plantData.type);
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '💾 Сохранение...';
    submitBtn.disabled = true;
    
    try {
        const newPlant = await plantService.addPlant(plantData);
        
        const successMsg = document.createElement('div');
        successMsg.style.cssText = 'position:fixed; top:20px; right:20px; background:#2d6a4f; color:white; padding:12px 24px; border-radius:40px; z-index:1000; animation:fadeIn 0.3s ease;';
        successMsg.innerHTML = `✅ Растение "${newPlant.name}" успешно добавлено!`;
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.remove();
            window.location.href = 'myplants.html';
        }, 1500);
        
    } catch (error) {
        console.error('Ошибка:', error);
        alert('❌ Ошибка при добавлении растения. Убедитесь, что сервер запущен.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function getTypeLabel(type) {
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

function getDefaultImageForType(type) {
    const images = {
        cactus: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400',
        ficus: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400',
        orchid: 'https://images.unsplash.com/photo-1604603815783-2bd94c5694e3?w=400',
        succulent: 'https://images.unsplash.com/photo-1593482892290-f54927c2d473?w=400',
        foliage: 'https://images.unsplash.com/photo-1614594976925-6420ecdbe0b5?w=400',
        flowering: 'https://images.unsplash.com/photo-1593691509543-c55fb32e6de5?w=400',
        other: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=400'
    };
    return images[type] || images.other;
}


document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    authService.logout();
});

document.addEventListener('DOMContentLoaded', initAddPlant);