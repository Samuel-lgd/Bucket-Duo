import {useEffect, useState} from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';
import BucketItems from "./components/bucketItems.tsx";
import './App.css';

const client = generateClient<Schema>();

function App() {
  const [buckets, setBuckets] = useState<Array<Schema["Bucket"]["type"]>>([]);
  const [selectedBucket, setSelectedBucket] = useState<Schema["Bucket"]["type"] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, signOut } = useAuthenticator();

  function handleBucketClick(bucket: Schema["Bucket"]["type"]) {
    setSelectedBucket(bucket);
  }

  async function loadBuckets() {
    try {
      setIsLoading(true);
      const { data } = await client.models.Bucket.list();
      setBuckets(data);
    } catch (error) {
      console.error("Error loading buckets:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBuckets();
  }, []);

  async function createBucket() {
    const bucketName = window.prompt("Enter a name for the new bucket");
    if (!bucketName) return;
    
    try {
      setIsLoading(true);
      await client.models.Bucket.create({
        name: bucketName,
        owner: user?.userId || "",
      });
      await loadBuckets();
    } catch (error) {
      console.error("Error creating bucket:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteBucket(bucketId: string) {
    if (!window.confirm("Are you sure you want to delete this bucket?")) return;
    
    try {
      setIsLoading(true);
      await client.models.Bucket.delete({ id: bucketId });
      if (selectedBucket?.id === bucketId) {
        setSelectedBucket(null);
      }
      await loadBuckets();
    } catch (error) {
      console.error("Error deleting bucket:", error);
    } finally {
      setIsLoading(false);
    }
  }

  async function updateBucket(bucketId: string) {
    const bucket = buckets.find(b => b.id === bucketId);
    if (!bucket) return;
    
    const newName = window.prompt("Enter a new name for the bucket", bucket.name);
    if (!newName || newName === bucket.name) return;
    
    try {
      setIsLoading(true);
      const updatedBucket = await client.models.Bucket.update({
        id: bucketId,
        name: newName,
      });
      
      if (selectedBucket?.id === bucketId) {
        setSelectedBucket(updatedBucket.data);
      }
      
      await loadBuckets();
    } catch (error) {
      console.error("Error updating bucket:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="app-container">
      <header className="app-header">
        <h1>Welcome, {user?.signInDetails?.loginId}</h1>
        <button onClick={signOut} className="sign-out-btn">Sign out</button>
      </header>
      
      <div className="content-container">
        <div className="buckets-section">
          <h2>My Buckets</h2>
          {isLoading && <p>Loading...</p>}
          
          <ul className="bucket-list">
            {buckets.map((bucket) => (
             <li key={bucket.id} className={selectedBucket?.id === bucket.id ? 'selected' : ''}>
               <span 
                 onClick={() => handleBucketClick(bucket)}
                 className="bucket-name"
               >
                 {bucket.name}
               </span>
               <div className="bucket-actions">
                 <button onClick={() => updateBucket(bucket.id)} className="edit-btn">Edit</button>
                 <button onClick={() => deleteBucket(bucket.id)} className="delete-btn">Delete</button>
               </div>
             </li>
            ))}
          </ul>
          <button onClick={createBucket} className="new-bucket-btn">+ New Bucket</button>
        </div>

        <div className="items-section">
          {selectedBucket && <BucketItems bucket={selectedBucket} onBucketUpdate={loadBuckets} />}
        </div>
      </div>
    </main>
  );
}

export default App;
