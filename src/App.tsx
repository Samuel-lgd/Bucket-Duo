import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useAuthenticator } from '@aws-amplify/ui-react';

const client = generateClient<Schema>();

function App() {
  const [todos, setBuckets] = useState<Array<Schema["Bucket"]["type"]>>([]);

  useEffect(() => {
    client.models.Bucket.observeQuery().subscribe({
      next: (data) => setBuckets([...data.items]),
    });
  }, []);

  const { signOut } = useAuthenticator();

  function createTodo() {
    client.models.Bucket.create({ name: window.prompt("Give a name to your bucket")})
  }

  return (
    <main>
      <h1>My Buckets</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.name}</li>
        ))}
      </ul>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;