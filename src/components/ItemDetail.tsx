import type {Schema} from '../../amplify/data/resource';

type ItemDetailProps = {
  item: Schema["Item"]["type"];
  categories: Schema["Category"]["type"][];
};

export function ItemDetail({ item, categories }: ItemDetailProps) {
  // Trouver la catégorie correspondante
  const category = categories.find(cat => cat.id === item.categoryID);

  return (
    <div className="item-details">
      <h3>
        <i className="fa-solid fa-circle-info me-2"></i>
        {item.title}
      </h3>

      {item.url && (
        <div className="item-url">
          <strong><i className="fa-solid fa-link me-2"></i>URL:</strong>{' '}
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {item.url}
          </a>
        </div>
      )}
      
      {item.info && (
        <div className="item-info">
          <strong><i className="fa-solid fa-circle-info me-2"></i>Information:</strong>
          <p>{item.info}</p>
        </div>
      )}
    </div>
  );
}
