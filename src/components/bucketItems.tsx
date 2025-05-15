import type {Schema} from "../../amplify/data/resource";
import {useItems} from "../hooks/useItems";
import {useCategories} from "../hooks/useCategories";
import {ItemCard} from "./ItemCard";

type BucketItemsProps = { 
  bucket: Schema["Bucket"]["type"];
  onBucketUpdate?: () => void;
};

function BucketItems({ bucket, onBucketUpdate }: BucketItemsProps) {
  const { categories, isLoading: categoriesLoading } = useCategories();
  
  const {
    items,
    isLoading: itemsLoading,
    createItem,
    updateItem,
    deleteItem,
    selectedCategoryID,
    setSelectedCategoryID
  } = useItems(bucket.id, onBucketUpdate);

  const isLoading = categoriesLoading || itemsLoading;

  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategoryID(categoryId);
  };

  // Vérifier si la catégorie sélectionnée est une catégorie système
  const isSystemCategory = () => {
    if (!selectedCategoryID) return false;
    const selectedCategory = categories.find(cat => cat.id === selectedCategoryID);
    return selectedCategory?.system === true;
  };

  return (
    <div className="bucket-items-container">
      <h2 className="bucket-title">
        <i className="fa-solid fa-folder-open bucket-title-icon"></i>
        {bucket.name}
      </h2>
      
      {/* Sélecteur de catégories */}
      <div className="category-filter">
        <div className="category-filter-label">
          <i className="fa-solid fa-tags me-2"></i>
          Filtrer par catégorie:
        </div>
        <div className="category-buttons">
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategoryID === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              {category.name}
            </button>
          ))}
          <button 
            className={`category-btn ${selectedCategoryID === null ? 'active' : ''}`}
            onClick={() => handleCategoryChange(null)}
          >
            Toutes
          </button>
        </div>
      </div>
      
      <div className="items-header">
        <h3>Items ({items.length})</h3>
        <div className="action-buttons">
          <button onClick={createItem} className="btn btn-primary">
            <i className="fa-solid fa-plus me-2"></i> Ajouter un item
          </button>
          
          {isSystemCategory() && (
            <button className="btn btn-success ms-2">
              <i className="fa-solid fa-magic me-2"></i> Ajout magique
            </button>
          )}
        </div>
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
              <p>Aucun item dans cette catégorie</p>
              <p>Ajoutez un nouvel item ou sélectionnez une autre catégorie</p>
            </div>
          ) : (
            <div className="items-grid">
              {items.map((item) => (
                <ItemCard 
                  key={item.id}
                  item={item}
                  categoryName={categories.find(cat => cat.id === item.categoryID)?.name}
                  onUpdate={updateItem}
                  onDelete={deleteItem}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default BucketItems;

