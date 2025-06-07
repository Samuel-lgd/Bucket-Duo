/**
 * Ce fichier initialise les APIs externes comme Google Maps dès le chargement de l'application
 */

import { loadGoogleMapsAPI } from './metadataService';

/**
 * Fonction pour initialiser toutes les APIs externes nécessaires au démarrage de l'application
 */
export const initializeExternalAPIs = async () => {
  // Précharger l'API Google Maps pour éviter les délais lors de la première utilisation
  try {
    console.log('Préchargement de Google Maps API...');
    await loadGoogleMapsAPI();
    console.log('Google Maps API préchargée avec succès');
  } catch (error) {
    console.warn('Échec du préchargement de Google Maps API:', error);
    // On continue même en cas d'échec
  }
};
