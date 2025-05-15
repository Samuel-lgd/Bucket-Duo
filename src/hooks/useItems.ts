import {useEffect, useState} from 'react';
import type {Schema} from '../../amplify/data/resource';
import {useAuthenticator} from '@aws-amplify/ui-react';
import {dataClient} from '../services/dataService';

export function useItems(bucketId: string, onBucketUpdate?: () => void) {
  const [items, setItems] = useState<Schema["Item"]["type"][]>([]);
  const [selectedItem, setSelectedItem] = useState<Schema["Item"]["type"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthenticator();

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const { data } = await dataClient.models.Item.list({
        filter: { bucketID: { eq: bucketId } }
      });
      setItems(data);
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    // Reset selected item when bucket changes
    setSelectedItem(null);
  }, [bucketId]);

  const createItem = async () => {
    const title = window.prompt("Enter item title:");
    if (!title) return;
    
    const url = window.prompt("Enter item URL (optional):");
    const info = window.prompt("Enter item information (optional):");
    
    try {
      setIsLoading(true);
      await dataClient.models.Item.create({
        title,
        url: url || undefined,
        info: info || undefined,
        bucketID: bucketId,
        owner: user?.userId || "current-user",
      });
      
      await loadItems();
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
      const updatedItem = await dataClient.models.Item.update({
        id: itemId,
        title,
        url: url || undefined,
        info: info || undefined,
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
      await dataClient.models.Item.delete({ id: itemId });
      
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
    refreshItems: loadItems
  };
}
