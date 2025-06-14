import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { metadataEnrichment } from './function/metadata-enrichment/resource';

defineBackend({
  auth,
  data,
  metadataEnrichment,
});
