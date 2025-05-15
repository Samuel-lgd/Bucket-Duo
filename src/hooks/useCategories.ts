import {useEffect, useState} from 'react';
import {createDataService} from '../services/mockDataService';
import type {Schema} from '../../amplify/data/resource';

export function useCategories() {
  const [categories, setCategories] = useState<Schema["Category"]["type"][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [client, setClient] = useState<any>(null);
  
  // Initialiser le client lors du montage du composant
  useEffect(() => {
    const initClient = async () => {
      const dataService = await createDataService(true);
      setClient(dataService);
    };
    
    initClient();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      if (!client) return; // Ne pas essayer de charger si le client n'est pas prêt
      
      setIsLoading(true);
      try {
        const result = await client.models.Category.list();
        setCategories(result.data);
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (client) {
      fetchCategories();
    }
  }, [client]); // Dépend du client

  const createCategory = async (name: string) => {
    if (!client) return null; // Vérifier que le client est disponible
    
    try {
      const result = await client.models.Category.create({
        name,
        system: false,
      });
      setCategories(prev => [...prev, result.data]);
      return result.data;
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      return null;
    }
  };

  const updateCategory = async (id: string, name: string) => {
    if (!client) return null; // Vérifier que le client est disponible
    
    try {
      const result = await client.models.Category.update({
        id,
        name,
      });
      setCategories(prev => 
        prev.map(cat => cat.id === id ? result.data : cat)
      );
      return result.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
      return null;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!client) return false; // Vérifier que le client est disponible
    
    try {
      await client.models.Category.delete({ id });
      setCategories(prev => prev.filter(cat => cat.id !== id));
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      return false;
    }
  };

  return {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory
  };
}
