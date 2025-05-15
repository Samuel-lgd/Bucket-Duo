import type {Schema} from "../../amplify/data/resource";
import {ItemDetail} from "./ItemDetail";
import {useItems} from "../hooks/useItems";

type BucketItemsProps = { 
  bucket: Schema["Bucket"]["type"];
  onBucketUpdate?: () => void;
};

function BucketItems({ bucket, onBucketUpdate }: BucketItemsProps) {
  const {
    items,
    selectedItem,
    setSelectedItem,
    isLoading,
    createItem,
    updateItem,
    deleteItem
  } = useItems(bucket.id, onBucketUpdate);

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
                <li key={item.id} className={selectedItem?.id === item.id ? 'selected' : ''}>
                  <div className="item-header" onClick={() => setSelectedItem(item)}>
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
        
        {selectedItem && <ItemDetail item={selectedItem} />}
      </div>
    </div>
  );
}

export default BucketItems;
