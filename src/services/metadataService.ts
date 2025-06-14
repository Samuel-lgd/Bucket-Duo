/**
 * Service pour récupérer des métadonnées sur différents types de contenu
 * Utilise des APIs gratuites et des méthodes d'extraction simples
 */

const YOUTUBE_API_KEY = "test"
const TMDB_API_KEY = "test"
const GOOGLE_MAPS_API_KEY = "test"


// Variable pour tracker si l'API Google Maps JavaScript est chargée
let googleMapsLoaded = false;
let googleMapsLoadPromise: Promise<void> | null = null;

/**
 * Charge l'API Google Maps JavaScript
 * Cette fonction est exportée pour permettre un préchargement au démarrage de l'application
 */
export const loadGoogleMapsAPI = (): Promise<void> => {
  if (googleMapsLoaded) return Promise.resolve();
  if (googleMapsLoadPromise) return googleMapsLoadPromise;
  
  // Si pas de clé API, rejeter immédiatement
  if (!GOOGLE_MAPS_API_KEY) {
    console.warn('Aucune clé API Google Maps trouvée dans les variables d\'environnement');
    return Promise.reject(new Error('Clé API Google Maps manquante'));
  }
  
  googleMapsLoadPromise = new Promise((resolve, reject) => {
    // Fonction de callback pour Google Maps
    window.initGoogleMapsCallback = () => {
      googleMapsLoaded = true;
      resolve();
      console.log('Google Maps API loaded successfully');
    };
    
    // Créer le script
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&callback=initGoogleMapsCallback`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      reject(new Error('Échec du chargement de Google Maps API'));
    };
    
    // Ajouter le script au document
    document.head.appendChild(script);
  });
  
  return googleMapsLoadPromise;
};

// Déclarer la fonction de callback et les types Google Maps dans l'objet window
declare global {
  interface Window {
    initGoogleMapsCallback: () => void;
    google: typeof google;
  }
}

// Définir le namespace google pour TypeScript
declare namespace google {
  namespace maps {
    namespace places {
      enum PlacesServiceStatus {
        OK,
        ZERO_RESULTS,
        OVER_QUERY_LIMIT,
        REQUEST_DENIED,
        INVALID_REQUEST,
        UNKNOWN_ERROR,
        NOT_FOUND
      }
      
      class PlacesService {
        constructor(attrContainer: HTMLDivElement);
        findPlaceFromQuery(request: FindPlaceRequest, callback: (results: PlaceResult[], status: PlacesServiceStatus) => void): void;
        getDetails(request: PlaceDetailsRequest, callback: (result: PlaceResult, status: PlacesServiceStatus) => void): void;
      }
      
      interface FindPlaceRequest {
        query: string;
        fields: string[];
      }
      
      interface PlaceDetailsRequest {
        placeId: string;
        fields: string[];
      }
      
      interface PlaceResult {
        place_id: string;
        name?: string;
        formatted_address?: string;
        formatted_phone_number?: string;
        website?: string;
        price_level?: number;
        photos?: {
          getUrl: (options: { maxWidth: number; maxHeight: number }) => string;
        }[];
        types?: string[];
        user_ratings_total?: number;
        rating?: number;
        opening_hours?: any;
        url?: string;
      }
    }
  }
}

// Types pour les différentes métadonnées
export type EnrichedMetadata = {
  title: string;
  url?: string;
  info?: string;
  imageUrl?: string;
  _alternativeThumbnails?: string[]; // Thumbnails alternatifs pour les vidéos YouTube
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
export const getYouTubeMetadata = async (input: string): Promise<EnrichedMetadata> => {
  try {
    const isYoutubeUrl = input.includes('youtube.com') || input.includes('youtu.be');
    let videoId = null;
    let title = input;
    let url = input;
    
    if (isYoutubeUrl) {
      videoId = extractYouTubeVideoId(input);
    }

    if (!videoId) {
      if (!YOUTUBE_API_KEY) {
        throw new Error('Clé API YouTube manquante. Impossible de rechercher des vidéos.');
      }
      
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
      } catch (error) {
        throw new Error(`Erreur lors de la recherche YouTube: ${error.message}`);
      }
    }
    
    try {
      const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(oEmbedUrl, { 
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);
      
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
    } catch (error) {
      throw new Error(`Impossible de récupérer les métadonnées de la vidéo: ${error.message}`);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées YouTube:', error);
    throw error;
  }
};

/**
 * Récupère les métadonnées d'un film ou d'une série
 */
export const getMovieMetadata = async (title: string): Promise<EnrichedMetadata> => {
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
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées du film/série:', error);
    throw error;
  }
};

/**
 * Récupère les métadonnées d'un restaurant
 */
export const getRestaurantMetadata = async (name: string): Promise<EnrichedMetadata> => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Clé API Google Maps manquante. Impossible de récupérer les métadonnées de restaurants.');
  }

  try {
    await loadGoogleMapsAPI();
    
    return new Promise((resolve, reject) => {
      try {
        const placesDiv = document.createElement('div');
        const placesService = new google.maps.places.PlacesService(placesDiv);
        
        placesService.findPlaceFromQuery({
          query: name,
          fields: ['place_id', 'name', 'formatted_address']
        }, (results, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !results || results.length === 0) {
            reject(new Error(`Aucun restaurant trouvé pour "${name}"`));
            return;
          }
          
          const placeResult = results[0];
          
          placesService.getDetails({
            placeId: placeResult.place_id,
            fields: [
              'name', 'rating', 'formatted_address', 'formatted_phone_number', 
              'website', 'price_level', 'photos', 'types', 'user_ratings_total',
              'opening_hours', 'url'
            ]
          }, (placeDetails, detailStatus) => {
            if (detailStatus !== google.maps.places.PlacesServiceStatus.OK || !placeDetails) {
              reject(new Error(`Impossible de récupérer les détails pour "${name}"`));
              return;
            }
            
            // Utiliser directement les types retournés par Google sans mapping
            const restaurantType = placeDetails.types && placeDetails.types.length > 0 
              ? placeDetails.types[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
              : 'Restaurant';
            
            const priceSymbols = ['', '€', '€€', '€€€', '€€€€'];
            const price = placeDetails.price_level !== undefined ? priceSymbols[placeDetails.price_level] || '' : '';
            
            const rating = placeDetails.rating ? `${placeDetails.rating}` : 'N/A';
            const numberOfRatings = placeDetails.user_ratings_total ? ` (${placeDetails.user_ratings_total} avis)` : '';
            
            let imageUrl = '';
            if (placeDetails.photos && placeDetails.photos.length > 0) {
              imageUrl = placeDetails.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
            }
            
            const mapUrl = placeDetails.website || placeDetails.url || `https://www.google.com/maps/place/?q=place_id:${placeDetails.place_id}`;
            
            const address = placeDetails.formatted_address ? `${placeDetails.formatted_address}` : '';
            const phone = placeDetails.formatted_phone_number ? ` • Tél: ${placeDetails.formatted_phone_number}` : '';
            
            resolve({
              title: placeDetails.name || name,
              url: mapUrl,
              info: `${restaurantType} • ${price} • Note: ${rating}${numberOfRatings} • ${address}${phone}`,
              imageUrl: imageUrl
            });
          });
        });
      } catch (error) {
        reject(new Error(`Erreur lors de l'utilisation de Google Maps API: ${error.message}`));
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées du restaurant:', error);
    throw error;
  }
};

/**
 * Récupère les métadonnées d'une destination touristique
 */
export const getTourismMetadata = async (destination: string): Promise<EnrichedMetadata> => {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Clé API Google Maps manquante. Impossible de récupérer les métadonnées touristiques.');
  }

  try {
    await loadGoogleMapsAPI();
    
    return new Promise((resolve, reject) => {
      try {
        const placesDiv = document.createElement('div');
        const placesService = new google.maps.places.PlacesService(placesDiv);
        
        placesService.findPlaceFromQuery({
          query: destination,
          fields: ['place_id', 'name', 'formatted_address']
        }, (results, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !results || results.length === 0) {
            reject(new Error(`Aucune destination trouvée pour "${destination}"`));
            return;
          }
          
          const placeResult = results[0];
          
          placesService.getDetails({
            placeId: placeResult.place_id,
            fields: [
              'name', 'rating', 'formatted_address', 'photos', 'types',
              'user_ratings_total', 'website', 'url', 'international_phone_number'
            ]
          }, (placeDetails, detailStatus) => {
            if (detailStatus !== google.maps.places.PlacesServiceStatus.OK || !placeDetails) {
              reject(new Error(`Impossible de récupérer les détails pour "${destination}"`));
              return;
            }
            
            // Utiliser directement les types retournés par Google sans mapping
            const placeCategory = placeDetails.types && placeDetails.types.length > 0 
              ? placeDetails.types[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
              : 'Destination touristique';
            
            const rating = placeDetails.rating ? `Note: ${placeDetails.rating}` : '';
            const numberOfRatings = placeDetails.user_ratings_total ? ` (${placeDetails.user_ratings_total} avis)` : '';
            const ratingInfo = rating ? `${rating}${numberOfRatings} • ` : '';
            
            let imageUrl = '';
            if (placeDetails.photos && placeDetails.photos.length > 0) {
              imageUrl = placeDetails.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
            }
            
            const placeUrl = placeDetails.website || placeDetails.url || `https://www.google.com/maps/place/?q=place_id:${placeDetails.place_id}`;
            
            const address = placeDetails.formatted_address ? ` • ${placeDetails.formatted_address}` : '';
            
            resolve({
              title: placeDetails.name || destination,
              url: placeUrl,
              info: `${placeCategory} • ${ratingInfo}${address}`,
              imageUrl: imageUrl
            });
          });
        });
      } catch (error) {
        reject(new Error(`Erreur lors de l'utilisation de Google Maps API: ${error.message}`));
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées touristiques:', error);
    throw error;
  }
};

/**
 * Point d'entrée principal pour récupérer des métadonnées selon la catégorie
 */
export const getEnrichedMetadata = async (
  title: string,
  categoryId: string
): Promise<EnrichedMetadata> => {
  try {
    let result: EnrichedMetadata;
    
    switch(categoryId) {
      case 'c1': // YouTube
        result = await getYouTubeMetadata(title);
        break;
      case 'c2': // Séries & Films
        result = await getMovieMetadata(title);
        break;
      case 'c3': // Restaurants
        result = await getRestaurantMetadata(title);
        break;
      case 'c4': // Tourisme
        result = await getTourismMetadata(title);
        break;
      default:
        throw new Error('Catégorie non supportée pour l\'enrichissement automatique');
    }
    
    return {
      title: result.title || title,
      url: result.url || `https://www.google.com/search?q=${encodeURIComponent(title)}`,
      info: result.info || `Élément ajouté via l'ajout magique.`,
      imageUrl: result.imageUrl
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées:', error);
    throw error;
  }
};
