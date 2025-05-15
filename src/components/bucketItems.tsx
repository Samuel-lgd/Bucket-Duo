import type {Schema} from "../../amplify/data/resource.ts";
import {useEffect, useState} from "react";
import {generateClient} from "aws-amplify/data";
import {useAuthenticator} from "@aws-amplify/ui-react";
import './bucketItems.css';

const client = generateClient<Schema>();

function BucketItems({ 
  bucket, 
  onBucketUpdate 
}: { 
  bucket: Schema["Bucket"]["type"];
  onBucketUpdate?: () => void;
}) {
  const [items, setItems] = useState<Array<Schema["Item"]["type"]>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewItem, setViewItem] = useState<Schema["Item"]["type"] | null>(null);
  const { user } = useAuthenticator();

  async function loadItems() {
    try {
      setIsLoading(true);
      const { data } = await client.models.Item.list({
        filter: { bucketID: { eq: bucket.id } }
      });
      setItems(data);
    } catch (error) {
      console.error("Error loading items:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadItems();
  }, [bucket.id]);

  const createItem = async () => {
    const title = window.prompt("Enter item title:");
    if (!title) return;
    
    const url = window.prompt("Enter item URL (optional):");
    const info = window.prompt("Enter item information (optional):");
    
    try {
      setIsLoading(true);
      await client.models.Item.create({
        title,
        url: url || undefined,
        info: info || undefined,
        bucketID: bucket.id,
        owner: user?.userId || "",
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
      await client.models.Item.update({
        id: itemId,
        title,
        url: url || undefined,
        info: info || undefined,
      });
      
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
      
      if (viewItem?.id === itemId) {
        setViewItem(null);
      }
      
      await loadItems();
      if (onBucketUpdate) onBucketUpdate();
    } catch (error) {
      console.error("Error deleting item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleItemClick = (item: Schema["Item"]["type"]) => {
    setViewItem(item);
  };

  return (
    <div className="bucket-items-container">
      <h2>Bucket: {bucket.name}</h2>
      {isLoading && <p>Loading items...</p>}
      
      <div className="items-content">
        <div className="items-list-container">
          <h3>Items ({items.length})</h3>
          <ul className="items-list">
            {items.length === 0 && !isLoading ? (
              <li className="no-items">No items in this bucket</li>
            ) : (
              items.map((item) => (
                <li key={item.id} className={viewItem?.id === item.id ? 'selected' : ''}>
                  <div className="item-header" onClick={() => handleItemClick(item)}>
                    <span className="item-title">{item.title}</span>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => updateItem(item.id)} className="edit-btn">Edit</button>
                    <button onClick={() => deleteItem(item.id)} className="delete-btn">Delete</button>
                  </div>
                </li>
              ))
            )}
          </ul>
          <button onClick={createItem} className="new-item-btn">+ Add Item</button>
        </div>
        
        {viewItem && (
          <div className="item-details">
            <h3>{viewItem.title}</h3>
            {viewItem.url && (
              <div className="item-url">
                <strong>URL:</strong> <a href={viewItem.url} target="_blank" rel="noopener noreferrer">{viewItem.url}</a>
              </div>
            )}
            {viewItem.info && (
              <div className="item-info">
                <strong>Info:</strong>
                <p>{viewItem.info}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BucketItems;
