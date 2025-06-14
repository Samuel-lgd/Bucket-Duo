/**
 * Service pour récupérer des métadonnées enrichies via la fonction Lambda Amplify
 */

import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../amplify/data/resource';

const client = generateClient<Schema>();

export type EnrichedMetadata = {
  title: string;
  url?: string;
  info?: string;
  imageUrl?: string;
}

/**
 * Point d'entrée principal pour récupérer des métadonnées selon la catégorie
 * Utilise maintenant la fonction Lambda Amplify
 */
export const getEnrichedMetadata = async (
  title: string,
  categoryId: string
): Promise<EnrichedMetadata> => {
  try {
    const response = await client.queries.enrichMetadata({
      title,
      categoryId
    });

    if (!response.data) {
      throw new Error('Aucune réponse reçue du service de métadonnées');
    }

    const { success, error, ...metadata } = response.data;

    if (!success) {
      throw new Error(error || 'Erreur lors de l\'enrichissement des métadonnées');
    }

    return {
      title: metadata.title || title,
      url: metadata.url || `https://www.google.com/search?q=${encodeURIComponent(title)}`,
      info: metadata.info || `Élément ajouté via l'ajout magique.`,
      imageUrl: metadata.imageUrl
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées:', error);
    throw error;
  }
};
