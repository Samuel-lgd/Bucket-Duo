import type {Schema} from '../../amplify/data/resource';

type ItemDetailProps = {
  item: Schema["Item"]["type"];
};

export function ItemDetail({ item }: ItemDetailProps) {
  return (
    <div className="item-details">
      <h3>{item.title}</h3>
      {item.url && (
        <div className="item-url">
          <strong>URL:</strong>{' '}
          <a href={item.url} target="_blank" rel="noopener noreferrer">
            {item.url}
          </a>
        </div>
      )}
      {item.info && (
        <div className="item-info">
          <strong>Info:</strong>
          <p>{item.info}</p>
        </div>
      )}
    </div>
  );
}
