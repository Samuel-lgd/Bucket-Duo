import type {Schema} from '../../amplify/data/resource';

type ItemCardProps = {
  item: Schema["Item"]["type"];
  categoryName?: string;
  onUpdate: (item: Schema["Item"]["type"]) => void;
  onDelete: (itemId: string) => void;
};

export function ItemCard({ item, onUpdate, onDelete }: ItemCardProps) {
  const handleEditClick = () => {
    const updatedItem = { ...item, title: `${item.title} (modifié)` };
    onUpdate(updatedItem);
  };

  const handleDeleteClick = () => {
    onDelete(item.id);
  };

  return (
    <div className="item-card">
      <div className="item-card-header">
        <div className="item-card-image-container">
          {/*<img */}
          {/*  src={itemImage} */}
          {/*  alt={item.title} */}
          {/*  className="item-card-image"*/}
          {/*  onError={(e) => {*/}
          {/*    // Remplacer par une image par défaut en cas d'erreur*/}
          {/*    (e.target as HTMLImageElement).src = '/images/default-item.jpg';*/}
          {/*  }}*/}
          {/*/>*/}
        </div>
        <h3 className="item-card-title">{item.title}</h3>
      </div>

      <div className="item-card-content">
        {item.url && (
          <div className="item-card-url">
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <i className="fa-solid fa-link me-1"></i> Voir le lien
            </a>
          </div>
        )}

          <div className="item-card-info">
            <p>{item.info}</p>
          </div>
      </div>

      <div className="item-card-actions">

        
        <button 
          className="btn btn-sm btn-outline-primary" 
          onClick={handleEditClick}
        >
          <i className="fa-solid fa-edit me-1"> </i> Modifier
        </button>
        
        <button 
          className="btn btn-sm btn-outline-danger" 
          onClick={handleDeleteClick}
        >
          <i className="fa-solid fa-trash me-1"> </i> Supprimer
        </button>
      </div>
    </div>
  );
}
