import type {Schema} from '../../amplify/data/resource';

// Fonction utilitaire pour obtenir une image par défaut basée sur la catégorie
function getDefaultImage(title: string, categoryID?: string): string {
  // Générer une graine stable basée sur le titre pour avoir une image cohérente
  const seed = title.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  
  switch(categoryID) {
    case 'c1': // YouTube
      return 'https://i.ytimg.com/vi/jNQXAC9IVRw/maxresdefault.jpg'; // Premier vidéo YouTube
    case 'c2': // Films & Séries
      return `https://via.placeholder.com/400x200/3498db/ffffff?text=${encodeURIComponent('Film: ' + title)}`;
    case 'c3': // Restaurants
      return `https://via.placeholder.com/400x200/e67e22/ffffff?text=${encodeURIComponent('Restaurant: ' + title)}`;
    case 'c4': // Tourisme
      return `https://via.placeholder.com/400x200/27ae60/ffffff?text=${encodeURIComponent('Lieu: ' + title)}`;
    default:
      // Images par défaut colorées aléatoires mais cohérentes
      const colors = ['3498db', 'e74c3c', '2ecc71', 'f39c12', '9b59b6', '1abc9c'];
      const color = colors[seed % colors.length];
      return `https://via.placeholder.com/400x200/${color}/ffffff?text=${encodeURIComponent(title)}`;
  }
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
