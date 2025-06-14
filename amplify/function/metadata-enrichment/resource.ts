import { defineFunction, secret } from '@aws-amplify/backend';

export const metadataEnrichment = defineFunction({
  name: 'metadata-enrichment',
  entry: './handler.ts',
  environment: {
    // Utiliser des secrets pour les clés API sensibles
    YOUTUBE_API_KEY: secret('YOUTUBE_API_KEY'),
    TMDB_API_KEY: secret('TMDB_API_KEY'),
    GOOGLE_MAPS_API_KEY: secret('GOOGLE_MAPS_API_KEY'),
  },
  // Runtime optionnel - omettez pour Node 18 LTS (par défaut)
  // Ou spécifiez 20 pour Node 20
  timeoutSeconds: 30,
});
