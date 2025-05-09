import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export async function loadAccessibleBuckets(userId: string) {
  if (!userId) throw new Error("Missing user ID");

  const ownedResult = await client.models.Bucket.list({
    filter: { owner: { eq: userId } },
  });
  const ownedBuckets = ownedResult.data;

  const membershipResult = await client.models.BucketMember.list({
    filter: { memberID: { eq: userId } },
  });

  const bucketIds = membershipResult.data
    .map(m => m.bucketID)
    .filter((id): id is string => typeof id === 'string');

  const memberBuckets = await Promise.all(
    bucketIds.map(id =>
      client.models.Bucket.get({ id }).then(res => res.data).catch(() => null)
    )
  );

  const allBucketsMap = new Map();
  for (const b of [...ownedBuckets, ...memberBuckets]) {
    if (b) allBucketsMap.set(b.id, b);
  }

  return Array.from(allBucketsMap.values());
}
