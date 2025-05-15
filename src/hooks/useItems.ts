import {useCallback, useEffect, useState} from 'react';
import type {Schema} from '../../amplify/data/resource';
import {useAuthenticator} from '@aws-amplify/ui-react';
import {createDataService} from '../services/mockDataService';

export function useItems(bucketId: string, onBucketUpdate?: () => void) {
  const [items, setItems] = useState<Schema["Item"]["type"][]>([]);
  const [selectedItem, setSelectedItem] = useState<Schema["Item"]["type"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategoryID, setSelectedCategoryID] = useState<string | null>(null);
  const { user } = useAuthenticator();
  
  // Utiliser le mock pour l'instant
  const client = createDataService(true);

  const loadItems = useCallback(async () => {
    try {
      setIsLoading(true);
      
      let result;
      
      if (selectedCategoryID) {
        // Utiliser la fonction filter explicitement comme spécifiée dans mockDataService
        result = await client.models.Item.list({
          filter: {
            bucketID: { eq: bucketId },
            categoryID: { eq: selectedCategoryID }
          }
        });
      } else {
        // Si aucune catégorie n'est sélectionnée, ne filtrer que par bucketID
        result = await client.models.Item.list({
          filter: { bucketID: { eq: bucketId } }
        });
      }
      
      setItems(result.data);
      
      // Réinitialiser l'item sélectionné s'il n'est plus dans la liste filtrée
      if (selectedItem && !result.data.some(item => item.id === selectedItem.id)) {
        setSelectedItem(null);
      }
    } catch (error) {
      console.error("Error loading items:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [bucketId, selectedCategoryID, selectedItem]);

  // Utiliser deux effets séparés pour éviter les dépendances circulaires
  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Définir la catégorie par défaut à c1 seulement au premier montage du composant
  useEffect(() => {
    // Définir la catégorie par défaut (première catégorie)
    setSelectedCategoryID("c1");
  }, []);

  const createItem = async () => {
    const title = window.prompt("Enter item title:");
    if (!title) return;
    
    const url = window.prompt("Enter item URL (optional):");
    const info = window.prompt("Enter item information (optional):");
    
    // Utiliser la catégorie sélectionnée ou la catégorie par défaut ("c1")
    const categoryID = selectedCategoryID || "c1";
    
    try {
      setIsLoading(true);
      const result = await client.models.Item.create({
        title,
        url: url || undefined,
        info: info || undefined,
        bucketID: bucketId,
        categoryID,
        owner: user?.userId || "current-user",
      });
      
      await loadItems();
      setSelectedItem(result.data);
      if (onBucketUpdate) onBucketUpdate();
    } catch (error) {
      console.error("Error creating item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    const title = window.prompt("Update item title:", item.title);
    if (!title) return;
    
    const url = window.prompt("Update item URL:", item.url || "");
    const info = window.prompt("Update item information:", item.info || "");
    
    try {
      setIsLoading(true);
      const updatedItem = await client.models.Item.update({
        id: itemId,
        title,
        url: url || undefined,
        info: info || undefined,
        // Ne pas modifier la catégorie lors d'une mise à jour simple
      });
      
      if (selectedItem?.id === itemId) {
        setSelectedItem(updatedItem.data);
      }
      
      await loadItems();
    } catch (error) {
      console.error("Error updating item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    try {
      setIsLoading(true);
      await client.models.Item.delete({ id: itemId });
      
      if (selectedItem?.id === itemId) {
        setSelectedItem(null);
      }
      
      await loadItems();
      if (onBucketUpdate) onBucketUpdate();
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    items,
    selectedItem,
    setSelectedItem,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
    refreshItems: loadItems,
    selectedCategoryID,
    setSelectedCategoryID
  };
}
