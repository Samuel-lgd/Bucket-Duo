import {useCallback, useEffect, useState} from 'react';
import type {Schema} from '../../amplify/data/resource';
import {useAuthenticator} from '@aws-amplify/ui-react';
import {createDataService} from '../services/mockDataService';

export function useItems(bucketId: string, onBucketUpdate?: () => void) {
  const [items, setItems] = useState<Schema["Item"]["type"][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategoryID, setSelectedCategoryID] = useState<string | null>(null);
  const [client, setClient] = useState<any>(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [showMagicForm, setShowMagicForm] = useState(false);
  const [magicLoading, setMagicLoading] = useState(false);
  const { user } = useAuthenticator();
  
  // Initialiser le client lors du montage du composant
  useEffect(() => {
    const initClient = async () => {
      const dataService = await createDataService(true);
      setClient(dataService);
    };
    
    initClient();
  }, []);

  const loadItems = useCallback(async () => {
    if (!client) return; // Ne pas essayer de charger si le client n'est pas prêt
    
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
    } catch (error) {
      console.error("Error loading items:", error);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  }, [bucketId, selectedCategoryID, client]);

  // Utiliser deux effets séparés pour éviter les dépendances circulaires
  useEffect(() => {
    if (client) { // Ne charger que lorsque le client est disponible
      loadItems();
    }
  }, [loadItems, client]);

  // Définir la catégorie par défaut à c1 seulement au premier montage du composant
  useEffect(() => {
    // Définir la catégorie par défaut (première catégorie)
    setSelectedCategoryID("c1");
  }, []);

  const createItem = () => {
    // Ouvrir le formulaire d'ajout
    setShowItemForm(true);
  };
  
  const handleItemSubmit = async (itemData: {
    title: string;
    url?: string;
    info?: string;
    categoryID: string;
  }) => {
    if (!client) return; // Vérifier que le client est disponible
    
    try {
      setIsLoading(true);
      await client.models.Item.create({
        title: itemData.title,
        url: itemData.url,
        info: itemData.info,
        bucketID: bucketId,
        categoryID: itemData.categoryID || selectedCategoryID || "c1",
        owner: user?.userId || "current-user",
      });
      
      await loadItems();
      if (onBucketUpdate) onBucketUpdate();
      setShowItemForm(false);
    } catch (error) {
      console.error("Error creating item:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const openMagicForm = () => {
    setShowMagicForm(true);
  };
  
  const handleMagicSubmit = async (title: string, categoryId: string) => {
    if (!client) return;
    
    const catId = categoryId || selectedCategoryID || "c1";
    
    try {
      setMagicLoading(true);
      
      // Utiliser le service de métadonnées pour enrichir l'élément
      const { getEnrichedMetadata } = await import('../services/metadataService');
      const enrichedData = await getEnrichedMetadata(title, catId);
      
      await client.models.Item.create({
        title: enrichedData.title,
        url: enrichedData.url,
        info: enrichedData.info,
        imageUrl: enrichedData.imageUrl,
        bucketID: bucketId,
        categoryID: catId,
        owner: user?.userId || "current-user",
      });
      
      await loadItems();
      if (onBucketUpdate) onBucketUpdate();
      setShowMagicForm(false);
    } catch (error) {
      console.error("Error creating magic item:", error);
    } finally {
      setMagicLoading(false);
    }
  };

  const [editingItem, setEditingItem] = useState<Schema["Item"]["type"] | null>(null);
  
  const updateItem = async (itemId: string) => {
    if (!client) return;
    
    const item = items.find(i => i.id === itemId);
    if (!item) return;
    
    // Ouvrir le formulaire d'édition avec les données de l'item
    setEditingItem(item);
    setShowItemForm(true);
  };
  
  const handleUpdateSubmit = async (itemData: {
    title: string;
    url?: string;
    info?: string;
    categoryID: string;
  }) => {
    if (!client || !editingItem) return;
    
    try {
      setIsLoading(true);
      await client.models.Item.update({
        id: editingItem.id,
        title: itemData.title,
        url: itemData.url,
        info: itemData.info,
        categoryID: itemData.categoryID, // Permettre de changer la catégorie
        imageUrl: editingItem.imageUrl, // Préserver l'image existante
      });
      
      await loadItems();
      setShowItemForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    if (!client) return; // Vérifier que le client est disponible
    
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    
    try {
      setIsLoading(true);
      await client.models.Item.delete({ id: itemId });
      
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
    isLoading,
    createItem,
    updateItem,
    deleteItem,
    refreshItems: loadItems,
    selectedCategoryID,
    setSelectedCategoryID,
    // Nouveaux états et fonctions pour les formulaires
    showItemForm,
    setShowItemForm,
    showMagicForm,
    setShowMagicForm,
    handleItemSubmit,
    handleUpdateSubmit,
    editingItem,
    openMagicForm,
    handleMagicSubmit,
    magicLoading
  };
}
