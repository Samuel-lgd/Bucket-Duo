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
      <h2>My Buckets</h2>
      {isLoading && <p>Loading...</p>}
      
      <ul className="bucket-list">
        {buckets.map((bucket) => (
          <li key={bucket.id} className={selectedBucket?.id === bucket.id ? 'selected' : ''}>
            <span 
              onClick={() => onSelectBucket(bucket)}
              className="bucket-name"
            >
              {bucket.name}
            </span>
            <div className="bucket-actions">
              <button onClick={() => onUpdateBucket(bucket.id)} className="edit-btn">Edit</button>
              <button onClick={() => onDeleteBucket(bucket.id)} className="delete-btn">Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <button onClick={onCreateBucket} className="new-bucket-btn">+ New Bucket</button>
    </div>
  );
}
