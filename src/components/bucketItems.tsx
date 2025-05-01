import type {Schema} from "../../amplify/data/resource.ts";
import {useEffect, useState} from "react";
import {generateClient} from "aws-amplify/api";

const client = generateClient<Schema>();

function BucketItems({ bucket }: { bucket: Schema["Bucket"]["type"] }) {

  const [items, setItems] = useState<Array<Schema["Item"]["type"]>>([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const items = await client.models.Item.list({ filter: { listID: { eq : bucket.id} } });
        console.log(items.data);
        setItems(items.data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  const createItem = async () => {
    const title = window.prompt("Give a name to your item");
    const url = window.prompt("Give a URL to your item");
    const info = window.prompt("Give some info to your item");

    if (!title || !url || !info) {
      alert("Please provide a title, URL, and info for the item");
      return;
    }

    await client.models.Item.create({ title: title, url: url, info: info, listID: bucket.id });

    const items = await client.models.Item.list({ filter: { listID: { eq : bucket.id} } });
    console.log(items.data);
    setItems(items.data);
  };

  return (
    <div>
      <h2>Bucket {bucket.name}</h2>
      <ul>
        {items.map((item, index) => (
          <li key={index}>{item.title}</li>
        ))}
      </ul>
      <a onClick={createItem}>+ add item</a>
    </div>
  );
}

export default BucketItems;