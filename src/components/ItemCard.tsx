import type {Schema} from '../../amplify/data/resource';

// Fonction utilitaire pour obtenir une image par défaut basée sur la catégorie
function getDefaultImage(title: string, categoryID?: string): string {
  const baseUrl = "data:image/svg+xml,";
  let emoji = "📝";
  let bgColor = "3498db";
  
  switch(categoryID) {
    case 'c1': // YouTube
      emoji = "▶️";
      bgColor = "ff0000";
      break;
    case 'c2': // Films & Séries
      emoji = "🎬";
      bgColor = "3498db";
      break;
    case 'c3': // Restaurants
      emoji = "🍽️";
      bgColor = "e67e22";
      break;
    case 'c4': // Tourisme
      emoji = "🗺️";
      bgColor = "27ae60";
      break;
  }
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200">
    <rect width="400" height="200" fill="#${bgColor}"/>
    <text x="50%" y="50%" fill="white" font-size="72" text-anchor="middle" dominant-baseline="middle">
      ${emoji}
    </text>
  </svg>`;

  return baseUrl + encodeURIComponent(svg);
}

type ItemCardProps = {
  item: Schema["Item"]["type"];
  categoryName?: string;
  onUpdate: (itemId: string) => void;
  onDelete: (itemId: string) => void;
};

export function ItemCard({ item, onUpdate, onDelete }: ItemCardProps) {
  const handleEditClick = () => {
    const updatedItem = { ...item, title: `${item.title} (modifié)` };
    onUpdate(updatedItem.id);
  };

  const handleDeleteClick = () => {
    onDelete(item.id);
  };

  return (
    <div className="item-card">
      <div className="item-card-header">
        <div className="item-card-image-container">
          <img 
            src={item.imageUrl || getDefaultImage(item.title, item.categoryID)} 
            alt={item.title} 
            className="item-card-image"
            onError={(e) => {
              // Remplacer par une image par défaut en cas d'erreur
              // Prévenir la boucle infinie en vérifiant si on utilise déjà l'image par défaut
              const target = e.target as HTMLImageElement;
              const defaultImg = getDefaultImage(item.title, item.categoryID);
              
              // Vérifier si nous utilisons déjà l'image par défaut ou une image qui a échoué
              if (!target.src.includes(defaultImg.split('?')[0])) {
                target.src = defaultImg;
                // Ajout d'un attribut pour marquer que nous avons déjà tenté de corriger cette image
                target.setAttribute('data-using-fallback', 'true');
              } else if (!target.hasAttribute('data-using-fallback')) {
                // Si c'est l'image par défaut qui échoue aussi, on utilise une image très simple
                target.src = `https://via.placeholder.com/400x200/cccccc/666666?text=${encodeURIComponent("Image non disponible")}`;
                target.setAttribute('data-using-fallback', 'true');
              }
              // Si tout a échoué, on ne fait rien pour éviter la boucle infinie
            }}
          />
        </div>
        <h3 className="item-card-title">{item.title}</h3>
      </div>

      <div className="item-card-content">
        {item.url && (
          <div className="item-card-url">
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <i className="fa-solid fa-link me-1"></i> Voir le lien
            </a>
            {(item.categoryID === 'c3' || item.categoryID === 'c4') && (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.title)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="ms-2"
              >
                <i className="fa-solid fa-location-dot me-1"></i> S'y rendre
              </a>
            )}
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
