import { apiService } from './ApiService.js';

class AuthService {
    constructor() {
        this.currentUser = null;
        this.authToken = null;
    }

    async login(credentials) {
        try {
            const users = await apiService.fetchUsers();
            
            const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
            
            if (!user) {
                throw new Error('Неверные учетные данные');
            }
            
            const token = `fake-jwt-token-${user.id}-${Date.now()}`;
            
            localStorage.setItem('auth_token', token);
            localStorage.setItem('plantdiary_current_user', JSON.stringify(user));
            
            this.authToken = token;
            this.currentUser = user;
            
            console.log(' Авторизация успешна:', user.email);
            
            return token;
            
        } catch (error) {
            console.error('Ошибка авторизации:', error);
            throw error;
        }
    }

    async register(userData) {
        try {
            const users = await apiService.fetchUsers();
            
            if (users.find(u => u.email === userData.email)) {
                throw new Error('Пользователь с таким email уже существует');
            }
            
            const newUser = {
                id: Date.now(),
                name: userData.name,
                email: userData.email,
                password: userData.password,
                profile: {
                    city: '',
                    bio: '',
                    avatar: null,
                    joinDate: new Date().toISOString().split('T')[0],
                    notifications: true,
                    units: 'celsius'
                }
            };
            
            const result = await apiService.post('/users', newUser);
            
            if (result.success) {
                const token = `fake-jwt-token-${newUser.id}-${Date.now()}`;
                localStorage.setItem('auth_token', token);
                localStorage.setItem('plantdiary_current_user', JSON.stringify(newUser));
                this.authToken = token;
                this.currentUser = newUser;
                return token;
            }
            
            throw new Error('Ошибка регистрации');
            
        } catch (error) {
            console.error('Ошибка регистрации:', error);
            throw error;
        }
    }

    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('plantdiary_current_user');
        this.authToken = null;
        this.currentUser = null;
        window.location.href = 'login.html';
    }

    isAuthenticated() {
        const token = localStorage.getItem('auth_token');
        const user = localStorage.getItem('plantdiary_current_user');
        return !!(token && user);
    }

    getCurrentUser() {
        if (this.currentUser) return this.currentUser;
        
        const userJson = localStorage.getItem('plantdiary_current_user');
        if (userJson) {
            this.currentUser = JSON.parse(userJson);
            return this.currentUser;
        }
        return null;
    }

    getCurrentUserId() {
        const user = this.getCurrentUser();
        return user ? user.id : null;
    }

    async updateProfile(profileData) {
        const user = this.getCurrentUser();
        if (!user) throw new Error('Пользователь не авторизован');
        
        const updatedUser = {
            ...user,
            name: profileData.name || user.name,
            email: profileData.email || user.email,
            profile: {
                ...user.profile,
                city: profileData.city || user.profile?.city || '',
                bio: profileData.bio || user.profile?.bio || '',
                avatar: profileData.avatar || user.profile?.avatar || null,
                notifications: profileData.notifications !== undefined ? profileData.notifications : user.profile?.notifications !== false,
                units: profileData.units || user.profile?.units || 'celsius'
            }
        };
        
        const result = await apiService.put(`/users/${user.id}`, updatedUser);
        
        if (result.success) {
            localStorage.setItem('plantdiary_current_user', JSON.stringify(updatedUser));
            this.currentUser = updatedUser;
            return updatedUser;
        }
        
        throw new Error('Ошибка обновления профиля');
    }
}

export const authService = new AuthService();