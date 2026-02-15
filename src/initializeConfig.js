// initializeConfig.js
// Script para inicializar la configuración del sistema en Firebase
// Ejecutar este script una vez después de implementar las mejoras

import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase/config';

/**
 * Inicializa la configuración del sistema en Firebase
 */
export const initializeSystemConfig = async () => {
  try {
    // Verificar si ya existe la configuración
    const configRef = doc(db, 'configuracion', 'general');
    const configSnap = await getDoc(configRef);

    if (configSnap.exists()) {
      console.log('✅ La configuración ya existe en Firebase');
      console.log('Configuración actual:', configSnap.data());
      return { success: true, message: 'La configuración ya existe', data: configSnap.data() };
    }

    // Crear la configuración inicial
    const initialConfig = {
      // General
      siteName: 'ClassAdmin',
      sessionTimeout: 30, // minutos
      
      // Opciones del Sistema
      emailNotifications: true,
      autoBackup: false,
      maintenanceMode: false,
      registrationOpen: true,
      
      // Límites
      maxRegistrosPerDay: 100,
      
      // Metadata
      createdAt: new Date().toISOString(),
      version: '2.0.0'
    };

    // Guardar en Firebase
    await setDoc(configRef, initialConfig);
    
    console.log('✅ Configuración inicial creada exitosamente');
    console.log('Datos guardados:', initialConfig);
    
    return { 
      success: true, 
      message: 'Configuración creada exitosamente', 
      data: initialConfig 
    };

  } catch (error) {
    console.error('❌ Error al inicializar la configuración:', error);
    return { 
      success: false, 
      message: `Error: ${error.message}`,
      error 
    };
  }
};

/**
 * Actualiza la configuración existente sin sobrescribir
 */
export const updateSystemConfig = async (updates) => {
  try {
    const configRef = doc(db, 'configuracion', 'general');
    const configSnap = await getDoc(configRef);

    if (!configSnap.exists()) {
      console.log('⚠️ La configuración no existe. Creándola primero...');
      return await initializeSystemConfig();
    }

    const currentConfig = configSnap.data();
    const updatedConfig = {
      ...currentConfig,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    await setDoc(configRef, updatedConfig);
    
    console.log('✅ Configuración actualizada exitosamente');
    console.log('Nuevos valores:', updatedConfig);
    
    return { 
      success: true, 
      message: 'Configuración actualizada', 
      data: updatedConfig 
    };

  } catch (error) {
    console.error('❌ Error al actualizar la configuración:', error);
    return { 
      success: false, 
      message: `Error: ${error.message}`,
      error 
    };
  }
};

/**
 * Obtiene la configuración actual del sistema
 */
export const getSystemConfig = async () => {
  try {
    const configRef = doc(db, 'configuracion', 'general');
    const configSnap = await getDoc(configRef);

    if (!configSnap.exists()) {
      console.log('⚠️ No se encontró configuración');
      return { 
        success: false, 
        message: 'Configuración no encontrada',
        data: null 
      };
    }

    console.log('✅ Configuración obtenida');
    return { 
      success: true, 
      message: 'Configuración obtenida exitosamente',
      data: configSnap.data() 
    };

  } catch (error) {
    console.error('❌ Error al obtener la configuración:', error);
    return { 
      success: false, 
      message: `Error: ${error.message}`,
      error 
    };
  }
};

/**
 * Resetea la configuración a los valores por defecto
 */
export const resetSystemConfig = async () => {
  try {
    console.log('⚠️ Reseteando configuración a valores por defecto...');
    const result = await initializeSystemConfig();
    
    if (result.success) {
      console.log('✅ Configuración reseteada exitosamente');
    }
    
    return result;

  } catch (error) {
    console.error('❌ Error al resetear la configuración:', error);
    return { 
      success: false, 
      message: `Error: ${error.message}`,
      error 
    };
  }
};

// Ejemplo de uso en consola o componente:
// 
// import { initializeSystemConfig } from './initializeConfig';
// 
// // En un useEffect o al cargar la app
// useEffect(() => {
//   initializeSystemConfig();
// }, []);

const configModule = {
  initializeSystemConfig,
  updateSystemConfig,
  getSystemConfig,
  resetSystemConfig
};

export default configModule;
