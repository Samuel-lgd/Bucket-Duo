import {useEffect, useState} from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';
import BucketItems from "./components/bucketItems.tsx";
import {loadAccessibleBuckets} from "./functions/loadAccessibleBuckets.ts";

const client = generateClient<Schema>();

function App() {
  const [buckets, setBuckets] = useState<Array<Schema["Bucket"]["type"]>>([]);
  const [selectedBucket, setSelectedBucket] = useState<Schema["Bucket"]["type"] | null>(null);
  const { user, signOut } = useAuthenticator();

  function handleBucketClick(bucket: Schema["Bucket"]["type"]) {
    setSelectedBucket(bucket);
  }

  useEffect(() => {
    const load = async () => {
      try {
        const userId = user?.userId;
        if (!userId) return;

        const accessibleBuckets = await loadAccessibleBuckets(userId);
        setBuckets(accessibleBuckets);
      } catch (err) {
        console.error("Failed to load buckets", err);
      }
    };

    load();
  }, []);

  async function createBucket() {
    const name = window.prompt("Give a name to your bucket")
    const owner = user?.userId;

    if (!name || !owner) {
      alert("Please provide a name and owner for the bucket");
      return;
    }

    if (buckets.some((bucket) => bucket.name === name)) {
      alert("Bucket with this name already exists");
      return;
    }

    client.models.Bucket.create({ name: name, owner: owner })

    client.models.Bucket.list().then((res) => {
      console.log(res.data);
      setBuckets(res.data);
    });
  }

  async function deleteBucket(bucket: Schema["Bucket"]["type"]) {
    if (window.confirm("Are you sure you want to delete this bucket?")) {
      client.models.Bucket.delete({ id: bucket.id })
      setBuckets(buckets.filter((b) => b.id !== bucket.id));
      if (selectedBucket?.id === bucket.id) {
        setSelectedBucket(null);
      }
    }
  }

  return (
    <main>
      <h1>Welcome, {user?.signInDetails?.loginId}</h1>
      <h2>My Buckets</h2>
      <ul>
        {buckets.map((bucket) => (
         <li key={bucket.id}>
           <span onClick={() => handleBucketClick(bucket)}>{bucket.name}</span>
           <button onClick={() => deleteBucket(bucket)}>Delete</button></li>

        ))}
      </ul>
      <a onClick={createBucket}>+ new</a>

      {selectedBucket && <BucketItems bucket={selectedBucket} />}
      <br/>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;