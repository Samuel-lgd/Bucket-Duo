import {useEffect, useState} from 'react';
import type {Schema} from '../../amplify/data/resource';
import {useAuthenticator} from '@aws-amplify/ui-react';
import {dataClient} from '../services/dataService';

export function useBuckets() {
  const [buckets, setBuckets] = useState<Schema["Bucket"]["type"][]>([]);
  const [selectedBucket, setSelectedBucket] = useState<Schema["Bucket"]["type"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [client, setClient] = useState<any>(null);
  const { user } = useAuthenticator();

  // Initialiser le client lors du montage du composant
  useEffect(() => {
    const initClient = async () => {
      const dataService = await dataClient;
      setClient(dataService);
    };
    
    initClient();
  }, []);

  const loadBuckets = async () => {
    if (!client) return; // Ne pas essayer de charger si le client n'est pas prêt
    
    try {
      setIsLoading(true);
      const { data } = await client.models.Bucket.list();
      setBuckets(data);
    } catch (error) {
      console.error("Error loading buckets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (client) { // Ne charger que lorsque le client est disponible
      loadBuckets();
    }
  }, [client]);

  const createBucket = async () => {
    if (!client) return; // Vérifier que le client est disponible
    
    const bucketName = window.prompt("Enter a name for the new bucket");
    if (!bucketName) return;
    
    try {
      setIsLoading(true);
      await client.models.Bucket.create({
        name: bucketName,
        owner: user?.userId || "current-user",
      });
      await loadBuckets();
    } catch (error) {
      console.error("Error creating bucket:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateBucket = async (bucketId: string) => {
    if (!client) return; // Vérifier que le client est disponible
    
    const bucket = buckets.find(b => b.id === bucketId);
    if (!bucket) return;
    
    const newName = window.prompt("Enter a new name for the bucket", bucket.name);
    if (!newName || newName === bucket.name) return;
    
    try {
      setIsLoading(true);
      const updatedBucket = await client.models.Bucket.update({
        id: bucketId,
        name: newName,
      });
      
      if (selectedBucket?.id === bucketId) {
        setSelectedBucket(updatedBucket.data);
      }
      
      await loadBuckets();
    } catch (error) {
      console.error("Error updating bucket:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteBucket = async (bucketId: string) => {
    if (!client) return; // Vérifier que le client est disponible
    
    if (!window.confirm("Are you sure you want to delete this bucket?")) return;
    
    try {
      setIsLoading(true);
      await client.models.Bucket.delete({ id: bucketId });
      if (selectedBucket?.id === bucketId) {
        setSelectedBucket(null);
      }
      await loadBuckets();
    } catch (error) {
      console.error("Error deleting bucket:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    buckets,
    selectedBucket,
    setSelectedBucket,
    isLoading,
    createBucket,
    updateBucket,
    deleteBucket,
    refreshBuckets: loadBuckets
  };
}
