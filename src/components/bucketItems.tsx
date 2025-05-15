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
      <h2 className="bucket-title">
        <i className="fa-solid fa-folder-open bucket-title-icon"></i>
        {bucket.name}
      </h2>
      
      <div className="items-header">
        <h3>Items ({items.length})</h3>
        <button onClick={createItem} className="btn btn-primary">
          <i className="fa-solid fa-plus me-2"></i> Ajouter un item
        </button>
      </div>
      
      {isLoading ? (
        <div className="loading-text">
          <div className="loading"></div>
          Chargement des items...
        </div>
      ) : (
        <>
          {items.length === 0 ? (
            <div className="no-items">
              <i className="fa-solid fa-box-open fa-3x mb-3"></i>
              <p>Ce bucket est vide</p>
              <p>Commencez par ajouter un nouvel item!</p>
            </div>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className={`item-card ${selectedItem?.id === item.id ? 'selected' : ''}`}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="item-card-actions">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        updateItem(item.id);
                      }} 
                      className="btn btn-success item-card-action"
                      title="Modifier"
                    >
                      <i className="fa-solid fa-pen"></i>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteItem(item.id);
                      }} 
                      className="btn btn-danger item-card-action"
                      title="Supprimer"
                    >
                      <i className="fa-solid fa-trash"></i>
                    </button>
                  </div>
                  <h3 className="item-card-title">{item.title}</h3>
                  {item.url && (
                    <div className="item-card-url">
                      <i className="fa-solid fa-link me-2"></i>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                        Ouvrir le lien
                      </a>
                    </div>
                  )}
                  {item.info && (
                    <div className="item-card-preview">
                      {item.info.length > 60 ? `${item.info.substring(0, 60)}...` : item.info}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {selectedItem && <ItemDetail item={selectedItem} />}
        </>
      )}
    </div>
  );
}

export default BucketItems;
