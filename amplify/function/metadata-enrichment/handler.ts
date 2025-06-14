import type { Schema } from "../../data/resource";

// Import conditionnel pour gérer l'environnement de développement
let env: { 
  YOUTUBE_API_KEY: string; 
  TMDB_API_KEY: string; 
  GOOGLE_MAPS_API_KEY: string; 
};

try {
  // En production, utilise les secrets Amplify Gen2
  env = require('$amplify/env/metadata-enrichment').env;
} catch {
  // En développement local, utilise process.env comme fallback
  env = {
    YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || '',
    TMDB_API_KEY: process.env.TMDB_API_KEY || '',
    GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY || '',
  };
}

// Type pour les métadonnées enrichies
export type EnrichedMetadata = {
  title: string;
  url?: string;
  info?: string;
  imageUrl?: string;
}

/**
 * Extrait l'ID d'une vidéo YouTube à partir d'une URL
 */
const extractYouTubeVideoId = (url: string): string | null => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7] && match[7].length === 11) ? match[7] : null;
};

/**
 * Récupère les métadonnées d'une vidéo YouTube
 */
const getYouTubeMetadata = async (input: string): Promise<EnrichedMetadata> => {
  const YOUTUBE_API_KEY = env.YOUTUBE_API_KEY;
  
  if (!YOUTUBE_API_KEY) {
    throw new Error('Clé API YouTube manquante. Impossible de rechercher des vidéos.');
  }

  try {
    const isYoutubeUrl = input.includes('youtube.com') || input.includes('youtu.be');
    let videoId = null;
    let title = input;
    let url = input;
    
    if (isYoutubeUrl) {
      videoId = extractYouTubeVideoId(input);
    }

    if (!videoId) {
      try {
        const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(input)}&maxResults=1&type=video&key=${YOUTUBE_API_KEY}`;
        const response = await fetch(searchUrl);
        
        if (response.ok) {
          const data = await response.json();
          if (data.items && data.items.length > 0) {
            const firstVideo = data.items[0];
            videoId = firstVideo.id.videoId;
            title = firstVideo.snippet.title;
            url = `https://www.youtube.com/watch?v=${videoId}`;
          } else {
            throw new Error("Aucune vidéo trouvée");
          }
        } else {
          throw new Error(`Erreur API YouTube: ${response.status}`);
        }
      } catch (error: any) {
        throw new Error(`Erreur lors de la recherche YouTube: ${error.message}`);
      }
    }
    
    try {
      const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      
      const response = await fetch(oEmbedUrl, {
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des métadonnées: ${response.status}`);
      }
      
      const data = await response.json();
      
      return {
        title: data.title || title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        info: `Vidéo YouTube par ${data.author_name || 'Créateur inconnu'} • ${data.title || ''} • Ajoutée via l'ajout magique.`,
        imageUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
      };
    } catch (error: any) {
      throw new Error(`Impossible de récupérer les métadonnées de la vidéo: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Erreur lors de la récupération des métadonnées YouTube:', error);
    throw error;
  }
};

/**
 * Récupère les métadonnées d'un film ou d'une série
 */
const getMovieMetadata = async (title: string): Promise<EnrichedMetadata> => {
  const TMDB_API_KEY = env.TMDB_API_KEY;
  
  if (!TMDB_API_KEY) {
    throw new Error('Clé API TMDB manquante. Impossible de récupérer les métadonnées de films.');
  }

  try {
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(title)}&page=1&include_adult=false`;
    
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      throw new Error(`Erreur API TMDB: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.results || searchData.results.length === 0) {
      throw new Error(`Aucun film trouvé pour "${title}"`);
    }

    const movie = searchData.results[0];
    const imgBaseUrl = 'https://image.tmdb.org/t/p/w500';
    const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Date inconnue';
    
    let genreNames = '';
    try {
      const detailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}&language=fr-FR`;
      const detailsResponse = await fetch(detailsUrl);
      if (detailsResponse.ok) {
        const details = await detailsResponse.json();
        if (details.genres && details.genres.length > 0) {
          genreNames = details.genres.map((g: any) => g.name).join(', ');
        }
      }
    } catch (detailsError) {
      console.warn('Impossible de récupérer les détails du genre:', detailsError);
    }
    
    if (!genreNames) {
      genreNames = 'Film';
    }
    
    return {
      title: movie.title || title,
      url: `https://www.themoviedb.org/movie/${movie.id}`,
      info: `${genreNames} • ${year} • Note: ${movie.vote_average.toFixed(1)}/10 • ${movie.overview ? movie.overview.substring(0, 100) + '...' : 'Pas de description disponible.'}`,
      imageUrl: movie.poster_path ? `${imgBaseUrl}${movie.poster_path}` : undefined
    };
  } catch (error: any) {
    console.error('Erreur lors de la récupération des métadonnées du film/série:', error);
    throw error;
  }
};

/**
 * Récupère les métadonnées d'un restaurant via Google Places API
 */
const getRestaurantMetadata = async (name: string): Promise<EnrichedMetadata> => {
  const GOOGLE_MAPS_API_KEY = env.GOOGLE_MAPS_API_KEY;
  
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Clé API Google Maps manquante. Impossible de récupérer les métadonnées de restaurants.');
  }

  try {
    // Utiliser l'API Places Text Search
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(name + ' restaurant')}&key=${GOOGLE_MAPS_API_KEY}&type=restaurant`;
    
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      throw new Error(`Erreur API Google Places: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.results || searchData.results.length === 0) {
      throw new Error(`Aucun restaurant trouvé pour "${name}"`);
    }

    const place = searchData.results[0];
    
    // Récupérer les détails du lieu
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${GOOGLE_MAPS_API_KEY}&fields=name,rating,formatted_address,formatted_phone_number,website,price_level,photos,types,user_ratings_total,url`;
    
    const detailsResponse = await fetch(detailsUrl);
    if (!detailsResponse.ok) {
      throw new Error(`Erreur lors de la récupération des détails: ${detailsResponse.status}`);
    }
    
    const detailsData = await detailsResponse.json();
    const placeDetails = detailsData.result;
    
    // Traitement des données
    const restaurantType = placeDetails.types && placeDetails.types.length > 0 
      ? placeDetails.types[0].replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
      : 'Restaurant';
    
    const priceSymbols = ['', '€', '€€', '€€€', '€€€€'];
    const price = placeDetails.price_level !== undefined ? priceSymbols[placeDetails.price_level] || '' : '';
    
    const rating = placeDetails.rating ? `${placeDetails.rating}` : 'N/A';
    const numberOfRatings = placeDetails.user_ratings_total ? ` (${placeDetails.user_ratings_total} avis)` : '';
    
    let imageUrl = '';
    if (placeDetails.photos && placeDetails.photos.length > 0) {
      const photoRef = placeDetails.photos[0].photo_reference;
      imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${GOOGLE_MAPS_API_KEY}`;
    }
    
    const mapUrl = placeDetails.website || placeDetails.url || `https://www.google.com/maps/place/?q=place_id:${placeDetails.place_id}`;
    
    const address = placeDetails.formatted_address ? `${placeDetails.formatted_address}` : '';
    const phone = placeDetails.formatted_phone_number ? ` • Tél: ${placeDetails.formatted_phone_number}` : '';
    
    return {
      title: placeDetails.name || name,
      url: mapUrl,
      info: `${restaurantType} • ${price} • Note: ${rating}${numberOfRatings} • ${address}${phone}`,
      imageUrl: imageUrl
    };
    
  } catch (error: any) {
    console.error('Erreur lors de la récupération des métadonnées du restaurant:', error);
    throw error;
  }
};

/**
 * Récupère les métadonnées d'une destination touristique
 */
const getTourismMetadata = async (destination: string): Promise<EnrichedMetadata> => {
  const GOOGLE_MAPS_API_KEY = env.GOOGLE_MAPS_API_KEY;
  
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Clé API Google Maps manquante. Impossible de récupérer les métadonnées touristiques.');
  }

  try {
    // Utiliser l'API Places Text Search
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(destination)}&key=${GOOGLE_MAPS_API_KEY}&type=tourist_attraction`;
    
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      throw new Error(`Erreur API Google Places: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    if (!searchData.results || searchData.results.length === 0) {
      throw new Error(`Aucune destination trouvée pour "${destination}"`);
    }

    const place = searchData.results[0];
    
    // Récupérer les détails du lieu
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&key=${GOOGLE_MAPS_API_KEY}&fields=name,rating,formatted_address,photos,types,user_ratings_total,website,url,international_phone_number`;
    
    const detailsResponse = await fetch(detailsUrl);
    if (!detailsResponse.ok) {
      throw new Error(`Erreur lors de la récupération des détails: ${detailsResponse.status}`);
    }
    
    const detailsData = await detailsResponse.json();
    const placeDetails = detailsData.result;
    
    // Traitement des données
    const placeCategory = placeDetails.types && placeDetails.types.length > 0 
      ? placeDetails.types[0].replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
      : 'Destination touristique';
    
    const rating = placeDetails.rating ? `Note: ${placeDetails.rating}` : '';
    const numberOfRatings = placeDetails.user_ratings_total ? ` (${placeDetails.user_ratings_total} avis)` : '';
    const ratingInfo = rating ? `${rating}${numberOfRatings} • ` : '';
    
    let imageUrl = '';
    if (placeDetails.photos && placeDetails.photos.length > 0) {
      const photoRef = placeDetails.photos[0].photo_reference;
      imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${GOOGLE_MAPS_API_KEY}`;
    }
    
    const placeUrl = placeDetails.website || placeDetails.url || `https://www.google.com/maps/place/?q=place_id:${placeDetails.place_id}`;
    
    const address = placeDetails.formatted_address ? ` • ${placeDetails.formatted_address}` : '';
    
    return {
      title: placeDetails.name || destination,
      url: placeUrl,
      info: `${placeCategory} • ${ratingInfo}${address}`,
      imageUrl: imageUrl
    };
    
  } catch (error: any) {
    console.error('Erreur lors de la récupération des métadonnées touristiques:', error);
    throw error;
  }
};

/**
 * Point d'entrée principal pour récupérer des métadonnées selon la catégorie
 */
const getEnrichedMetadata = async (
  title: string,
  categoryId: string
): Promise<EnrichedMetadata> => {
  try {
    let result: EnrichedMetadata;
    
    // Mapping des IDs de catégories ou noms vers les fonctions appropriées
    switch(categoryId.toLowerCase()) {
      case 'c1':
      case 'music':
      case 'musique':
      case 'vidéo':
      case 'video':
        result = await getYouTubeMetadata(title);
        break;
      case 'c2':
      case 'movie':
      case 'movies':
      case 'film':
      case 'films':
      case 'séries':
      case 'series':
        result = await getMovieMetadata(title);
        break;
      case 'c3':
      case 'food':
      case 'restaurant':
      case 'restaurants':
      case 'nourriture':
        result = await getRestaurantMetadata(title);
        break;
      case 'c4':
      case 'travel':
      case 'tourism':
      case 'tourisme':
      case 'voyage':
      case 'destination':
        result = await getTourismMetadata(title);
        break;
      default:
        throw new Error(`Catégorie "${categoryId}" non supportée pour l'enrichissement automatique`);
    }
    
    return {
      title: result.title || title,
      url: result.url || `https://www.google.com/search?q=${encodeURIComponent(title)}`,
      info: result.info || `Élément ajouté via l'ajout magique.`,
      imageUrl: result.imageUrl
    };
    
  } catch (error: any) {
    console.error('Erreur lors de la récupération des métadonnées:', error);
    throw error;
  }
};

// Handler typé avec le schéma Amplify Gen2
export const handler: Schema["enrichMetadata"]["functionHandler"] = async (event) => {
  console.log('Event received:', JSON.stringify(event, null, 2));

  try {
    const { title, categoryId } = event.arguments;

    if (!title || !categoryId) {
      return {
        success: false,
        error: 'Title and categoryId are required'
      };
    }

    const enrichedData = await getEnrichedMetadata(title, categoryId);

    return {
      success: true,
      title: enrichedData.title,
      url: enrichedData.url,
      info: enrichedData.info,
      imageUrl: enrichedData.imageUrl
    };

  } catch (error: any) {
    console.error('Error in metadata enrichment:', error);
    
    return {
      success: false,
      error: error.message || 'An unexpected error occurred'
    };
  }
};
