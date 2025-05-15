import {useAuthenticator} from '@aws-amplify/ui-react';
import {BucketList} from './components/BucketList';
import BucketItems from './components/bucketItems';
import {useBuckets} from './hooks/useBuckets';
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
        <h1>
          <span className="welcome-text">Bienvenue,</span> {user?.signInDetails?.loginId?.split("@")[0] || "Développeur"}
        </h1>
        {/*{USE_MOCK_DATA && <div className="mock-data-badge">Mode test (données fictives)</div>}*/}
        <button onClick={signOut} className="sign-out-btn">
          <span className="logout-icon">↩</span>
        </button>
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
          {!selectedBucket && (
            <div className="select-bucket-placeholder">
              <div className="placeholder-content">
                <i className="fa-solid fa-folder-open placeholder-icon"></i>
                <h2>Sélectionnez un bucket pour voir son contenu</h2>
                <p>Vos items apparaîtront ici sous forme de cartes</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
