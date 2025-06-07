import React, { useState, FormEvent } from 'react';
import type { Schema } from '../../amplify/data/resource';

type ItemFormProps = {
  onSubmit: (itemData: {
    title: string;
    url?: string;
    info?: string;
    categoryID: string;
  }) => Promise<void>;
  onCancel: () => void;
  selectedCategoryID: string | null;
  categories: Schema["Category"]["type"][];
  initialData?: {
    title?: string;
    url?: string;
    info?: string;
  };
  isEdit?: boolean;
};

export function ItemForm({ 
  onSubmit, 
  onCancel, 
  selectedCategoryID, 
  categories,
  initialData,
  isEdit = false
}: ItemFormProps) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [info, setInfo] = useState(initialData?.info || '');
  const [categoryID, setCategoryID] = useState(selectedCategoryID || 'c1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    
    try {      await onSubmit({
        title,
        url: url || undefined,
        info: info || undefined,
        categoryID: categoryID || 'c1',
        // Note: imageUrl n'est pas éditable manuellement dans ce formulaire,
        // mais sera géré par l'ajout magique ou conservé lors des modifications
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="item-form-overlay">
      <div className="item-form-container">
        <div className="item-form-header">
          <h3>{isEdit ? 'Modifier l\'item' : 'Ajouter un item'}</h3>
          <button onClick={onCancel} className="btn-close" aria-label="Fermer"></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Titre *</label>
            <input
              id="title"
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="url">URL</label>
            <input
              id="url"
              type="url"
              className="form-control"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="info">Information</label>
            <textarea
              id="info"
              className="form-control"
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Catégorie</label>
            <select
              id="category"
              className="form-control"
              value={categoryID || ''}
              onChange={(e) => setCategoryID(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={onCancel} 
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Enregistrement...
                </>
              ) : (
                isEdit ? 'Mettre à jour' : 'Ajouter'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type MagicItemFormProps = {
  onSubmit: (itemTitle: string, categoryId: string) => Promise<void>;
  onCancel: () => void;
  categoryName: string;
  isSubmitting: boolean;
};

export function MagicItemForm({ 
  onSubmit, 
  onCancel, 
  categoryName,
  isSubmitting 
}: MagicItemFormProps) {
  const [title, setTitle] = useState('');
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSubmit(title, '');
  };
  
  const getPlaceholderByCategory = () => {
    switch(categoryName.toLowerCase()) {
      case 'youtube':
        return 'Titre ou URL de la vidéo YouTube';
      case 'séries & films':
        return 'Nom de la série ou du film';
      case 'restaurants':
        return 'Nom du restaurant';
      case 'tourisme':
        return 'Destination ou attraction';
      default:
        return `Titre pour la catégorie ${categoryName}`;
    }
  };
  
  const getMagicDescriptionByCategory = () => {
    switch(categoryName.toLowerCase()) {
      case 'youtube':
        return 'Saisissez le titre ou l\'URL d\'une vidéo YouTube. Nous récupèrerons automatiquement la miniature et des informations sur la vidéo.';
      case 'séries & films':
        return 'Entrez le nom d\'un film ou d\'une série. Nous récupèrerons automatiquement l\'année, le genre, la note et une affiche.';
      case 'restaurants':
        return 'Indiquez le nom d\'un restaurant. Nous récupèrerons automatiquement le type de cuisine, la fourchette de prix et une image.';
      case 'tourisme':
        return 'Entrez une destination touristique. Nous récupèrerons automatiquement des informations et une image représentative.';
      default:
        return `Saisissez simplement un titre, et nous remplirons automatiquement les autres informations pour vous.`;
    }
  };
  
  return (
    <div className="item-form-overlay">
      <div className="item-form-container magic-form">
        <div className="item-form-header">
          <h3>
            <i className="fa-solid fa-magic me-2"></i>
            Ajout magique - {categoryName}
          </h3>
          <button onClick={onCancel} className="btn-close" aria-label="Fermer"></button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <p className="magic-description">
            {getMagicDescriptionByCategory()}
          </p>
          
          <div className="magic-preview">
            <div className="magic-icon">
              <i className={getCategoryIcon(categoryName)}></i>
            </div>
            <div className="magic-info">
              <span className="magic-label">Nous récupèrerons pour vous:</span>
              <ul className="magic-features">
                <li><i className="fa-solid fa-image"></i> Image représentative</li>
                <li><i className="fa-solid fa-link"></i> Lien pertinent</li>
                <li><i className="fa-solid fa-info-circle"></i> Description enrichie</li>
              </ul>
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="magicInput">{getPlaceholderByCategory()}</label>
            <input
              id="magicInput"
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={getPlaceholderByCategory()}
              required
              autoFocus
            />
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              onClick={onCancel} 
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  <i className="fa-solid fa-wand-sparkles me-2"></i>
                  Création magique en cours...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-sparkles me-2"></i>
                  Créer magiquement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Fonction utilitaire pour obtenir l'icône appropriée selon la catégorie
function getCategoryIcon(categoryName: string): string {
  switch(categoryName.toLowerCase()) {
    case 'youtube':
      return 'fa-brands fa-youtube fa-2x text-danger';
    case 'séries & films':
      return 'fa-solid fa-film fa-2x text-primary';
    case 'restaurants':
      return 'fa-solid fa-utensils fa-2x text-success';
    case 'tourisme':
      return 'fa-solid fa-plane fa-2x text-info';
    default:
      return 'fa-solid fa-star fa-2x text-warning';
  }
}
