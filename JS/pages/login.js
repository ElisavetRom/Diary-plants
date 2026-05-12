/**
 * Login page controller
 * Полная реализация авторизации (листинг 6.33)
 */

import { authService } from '../services/AuthService.js';

// DOM элементы
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const errorDiv = document.getElementById('errorMessage');
const successDiv = document.getElementById('successMessage');

// Состояние загрузки
let isLoggingIn = false;

/**
 * Обработчик формы входа
 * ЛИСТИНГ 6.33: async function handleLogin(e)
 */
async function handleLogin(e) {
    e.preventDefault();
    
    if (isLoggingIn) return;
    isLoggingIn = true;
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Вход...';
    submitBtn.disabled = true;
    
    try {
        await authService.login({ email, password });
        window.location.href = 'dashboard.html';
    } catch (error) {
        showError(error.message || 'Ошибка авторизации: проверьте логин и пароль.');
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        isLoggingIn = false;
    }
}

/**
 * Обработчик формы регистрации
 */
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    if (password !== confirmPassword) {
        showError('Пароли не совпадают');
        return;
    }
    
    if (password.length < 6) {
        showError('Пароль должен содержать минимум 6 символов');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = '⏳ Регистрация...';
    submitBtn.disabled = true;
    
    try {
        await authService.register({ name, email, password });
        showSuccess('Регистрация успешна! Перенаправление...');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } catch (error) {
        showError(error.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function showError(message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

function showSuccess(message) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
}

// Переключение табов
document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${tabName}Form`).classList.add('active');
        
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';
    });
});

// Подключение обработчиков
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);

// Если уже авторизован - перенаправляем
if (authService.isAuthenticated()) {
    window.location.href = 'dashboard.html';
}