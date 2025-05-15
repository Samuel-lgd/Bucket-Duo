import {useAuthenticator} from '@aws-amplify/ui-react';
import {BucketList} from './components/BucketList';
import BucketItems from './components/bucketItems';
import {useBuckets} from './hooks/useBuckets';
import {USE_MOCK_DATA} from './services/dataService';
import './styles/app.css';

function App() {
  const { user, signOut } = useAuthenticator();
  const { 
    buckets, 
    selectedBucket, 
    isLoading, 
    setSelectedBucket,
    createBucket, 
    updateBucket, 
    deleteBucket,
    refreshBuckets 
  } = useBuckets();

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>Welcome, {user?.signInDetails?.loginId?.split("@")[0] || "Développeur"}</h1>
        {USE_MOCK_DATA && <div className="mock-data-badge">Mode test (données fictives)</div>}
        <button onClick={signOut} className="sign-out-btn">Sign out</button>
      </header>
      
      <div className="content-container">
        <div className="buckets-section">
          <BucketList 
            buckets={buckets}
            selectedBucket={selectedBucket}
            isLoading={isLoading}
            onSelectBucket={setSelectedBucket}
            onCreateBucket={createBucket}
            onUpdateBucket={updateBucket}
            onDeleteBucket={deleteBucket}
          />
        </div>

        <div className="items-section">
          {selectedBucket && (
            <BucketItems 
              bucket={selectedBucket}
              onBucketUpdate={refreshBuckets}
            />
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
