// src/utils/storage.js
// Utilidad centralizada para manejar el almacenamiento de sesión
// Usa sessionStorage para permitir sesiones independientes por pestaña

/**
 * Obtiene un valor del sessionStorage
 * @param {string} key - Clave del valor a obtener
 * @returns {string|null} - Valor almacenado o null si no existe
 */
export const getStorageItem = (key) => {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    console.error(`Error al obtener ${key} del storage:`, error);
    return null;
  }
};

/**
 * Guarda un valor en el sessionStorage
 * @param {string} key - Clave del valor
 * @param {string} value - Valor a guardar
 */
export const setStorageItem = (key, value) => {
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    console.error(`Error al guardar ${key} en el storage:`, error);
  }
};

/**
 * Elimina un valor del sessionStorage
 * @param {string} key - Clave del valor a eliminar
 */
export const removeStorageItem = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error al eliminar ${key} del storage:`, error);
  }
};

/**
 * Obtiene el usuario del sessionStorage
 * @returns {Object|null} - Objeto usuario o null si no existe
 */
export const getUser = () => {
  const userStr = getStorageItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error al parsear usuario del storage:', error);
    return null;
  }
};

/**
 * Guarda el usuario en el sessionStorage
 * @param {Object} user - Objeto usuario a guardar
 */
export const setUser = (user) => {
  setStorageItem('user', JSON.stringify(user));
};

/**
 * Elimina el usuario del sessionStorage
 */
export const removeUser = () => {
  removeStorageItem('user');
};

/**
 * Obtiene el email del usuario del sessionStorage
 * @returns {string|null} - Email del usuario o null si no existe
 */
export const getUserEmail = () => {
  return getStorageItem('userEmail');
};

/**
 * Guarda el email del usuario en el sessionStorage
 * @param {string} email - Email del usuario
 */
export const setUserEmail = (email) => {
  setStorageItem('userEmail', email);
};

/**
 * Elimina el email del usuario del sessionStorage
 */
export const removeUserEmail = () => {
  removeStorageItem('userEmail');
};

/**
 * Obtiene el token del sessionStorage
 * @returns {string|null} - Token o null si no existe
 */
export const getToken = () => {
  return getStorageItem('token');
};

/**
 * Guarda el token en el sessionStorage
 * @param {string} token - Token a guardar
 */
export const setToken = (token) => {
  setStorageItem('token', token);
};

/**
 * Elimina el token del sessionStorage
 */
export const removeToken = () => {
  removeStorageItem('token');
};

/**
 * Limpia toda la información de sesión del usuario
 */
export const clearSession = () => {
  removeUser();
  removeUserEmail();
  removeToken();
  removeStorageItem('isDriverMode');
};

