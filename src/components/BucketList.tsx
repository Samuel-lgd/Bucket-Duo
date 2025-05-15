import type {Schema} from '../../amplify/data/resource';

type BucketListProps = {
  buckets: Schema["Bucket"]["type"][];
  selectedBucket: Schema["Bucket"]["type"] | null;
  isLoading: boolean;
  onSelectBucket: (bucket: Schema["Bucket"]["type"]) => void;
  onCreateBucket: () => void;
  onUpdateBucket: (id: string) => void;
  onDeleteBucket: (id: string) => void;
};

export function BucketList({
  buckets,
  selectedBucket,
  isLoading,
  onSelectBucket,
  onCreateBucket,
  onUpdateBucket,
  onDeleteBucket,
}: BucketListProps) {
  return (
    <div>
      <div className="buckets-header">
        <h2>Mes Buckets</h2>
      </div>
      
      {isLoading ? (
        <div className="loading-text">
          <div className="loading"></div>
          Chargement...
        </div>
      ) : (
        <ul className="bucket-list">
          {buckets.map((bucket) => (
            <li 
              key={bucket.id} 
              className={`bucket-item ${selectedBucket?.id === bucket.id ? 'selected' : ''}`}
            >
              <div className="bucket-content">
                <span 
                  onClick={() => onSelectBucket(bucket)}
                  className="bucket-name"
                >
                  <i className="fa-solid fa-folder me-2"></i> {bucket.name}
                </span>
                <div className="bucket-actions">
                  <button 
                    onClick={() => onUpdateBucket(bucket.id)} 
                    className="btn btn-success item-card-action"
                    title="Modifier"
                  >
                    <i className="fa-solid fa-pen"></i>
                  </button>
                  <button 
                    onClick={() => onDeleteBucket(bucket.id)} 
                    className="btn btn-danger item-card-action"
                    title="Supprimer"
                  >
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
      
      <button onClick={onCreateBucket} className="btn new-bucket-btn">
        <i className="fa-solid fa-plus me-2"></i> Nouveau Bucket
      </button>
    </div>
  );
}
