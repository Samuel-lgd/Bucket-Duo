/**
 * Service pour récupérer des métadonnées sur différents types de contenu
 * Utilise des APIs gratuites et des méthodes d'extraction simples
 */

// Constantes pour les APIs 
const YOUTUBE_API_KEY = 'AIzaSyDv-2F5HWx4G_hLra5P1c2SLoOO_6kXShk'; 
const TMDB_API_KEY = '17117ab9c18276d48d8634390c025df4'; // API Key pour The Movie Database
const GOOGLE_MAPS_API_KEY = 'AIzaSyBJqS9DSkGjGaX1TLK8ee-Qw3LuCOGwI8Y'; // Clé API Google Maps Platform valide

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
 * Extrait les données à partir de l'API oEmbed de YouTube qui est publique et ne nécessite pas de clé API
 */
export const getYouTubeMetadata = async (input: string): Promise<EnrichedMetadata> => {
  try {
    // Détecter si l'entrée est une URL YouTube ou un terme de recherche
    const isYoutubeUrl = input.includes('youtube.com') || input.includes('youtu.be');
    let videoId = null;
    let title = input;
    let url = input;
    
    if (isYoutubeUrl) {
      videoId = extractYouTubeVideoId(input);
    }
  // Si ce n'est pas une URL ou si nous n'avons pas pu extraire l'ID, considérer comme un terme de recherche
    if (!videoId) {
      // Si nous avons la clé API YouTube, on peut essayer de rechercher et récupérer la première vidéo
      if (YOUTUBE_API_KEY) {
        try {
          // Utiliser l'API YouTube Data pour rechercher
          const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(input)}&maxResults=1&type=video&key=${YOUTUBE_API_KEY}`;
          const response = await fetch(searchUrl);
          
          if (response.ok) {
            const data = await response.json();
            if (data.items && data.items.length > 0) {
              const firstVideo = data.items[0];
              videoId = firstVideo.id.videoId;
              
              // Maintenant que nous avons un ID, nous pouvons continuer comme si l'utilisateur avait entré une URL
              title = firstVideo.snippet.title;
              url = `https://www.youtube.com/watch?v=${videoId}`;
              
              // Continuer le traitement avec cet ID dans le code plus bas
              // La fonction va naturellement passer à la section suivante
            } else {
              throw new Error("Aucune vidéo trouvée");
            }
          } else {
            throw new Error(`Erreur API YouTube: ${response.status}`);
          }
        } catch (error) {
          console.warn("Erreur lors de la recherche YouTube:", error);
          // En cas d'erreur, revenir à la solution simple
          url = `https://www.youtube.com/results?search_query=${encodeURIComponent(input)}`;
          
          return {
            title: title,
            url: url,
            info: `Résultats de recherche YouTube pour: ${input}`,
            imageUrl: `https://via.placeholder.com/600x400/ff0000/ffffff?text=${encodeURIComponent('YouTube: ' + input)}` // Image stylisée YouTube
          };
        }
      } else {
        // Si pas de clé API, simplement renvoyer un lien de recherche
        url = `https://www.youtube.com/results?search_query=${encodeURIComponent(input)}`;
        
        return {
          title: title,
          url: url,
          info: `Résultats de recherche YouTube pour: ${input}`,
          imageUrl: `https://via.placeholder.com/600x400/ff0000/ffffff?text=${encodeURIComponent('YouTube: ' + input)}` // Image stylisée YouTube
        };
      }
    }
    
    // Avec un ID valide, nous utilisons l'API oEmbed pour récupérer les métadonnées
    try {
      // Construire une URL oEmbed - pas besoin de clé API
      const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      
      // Faire la requête
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes timeout
      
      const response = await fetch(oEmbedUrl, { 
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erreur lors de la récupération des métadonnées: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Utiliser des images différentes en cas d'échec de la première
      const thumbnailOptions = [
        `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`, // Meilleure qualité
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,     // Haute qualité
        `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,     // Qualité moyenne
        `https://i.ytimg.com/vi/${videoId}/default.jpg`        // Qualité standard
      ];
      
      return {
        title: data.title || title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        info: `Vidéo YouTube par ${data.author_name || 'Créateur inconnu'} • ${data.title || ''} • Ajoutée via l'ajout magique.`,
        imageUrl: thumbnailOptions[0], // Commencer par la meilleure qualité
        _alternativeThumbnails: thumbnailOptions // Stocké pour référence mais pas utilisé directement
      };
    } catch (error) {
      console.warn('Échec de récupération des métadonnées par oEmbed:', error);
      
      // Fallback avec les données de base
      return {
        title: title.includes('http') ? `Vidéo YouTube` : title,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        info: `Cette vidéo YouTube a été ajoutée via l'ajout magique.`,
        imageUrl: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` // Thumbnail standard comme fallback
      };
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées YouTube:', error);
    return {
      title: input,
      url: input.includes('http') ? input : `https://www.youtube.com/results?search_query=${encodeURIComponent(input)}`,
      info: 'Impossible de récupérer les métadonnées YouTube.',
      imageUrl: `https://via.placeholder.com/600x400/ff0000/ffffff?text=${encodeURIComponent('YouTube')}`
    };
  }
};

/**
 * Récupère les métadonnées d'un film ou d'une série
 * Utilise l'API The Movie Database (TMDB)
 */
export const getMovieMetadata = async (title: string): Promise<EnrichedMetadata> => {
  try {
    // Première étape : rechercher le film par titre avec l'API TMDB
    const searchUrl = `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(title)}&page=1&include_adult=false`;
    
    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      throw new Error(`Erreur API TMDB: ${searchResponse.status}`);
    }
    
    const searchData = await searchResponse.json();
    
    // Si on a trouvé des résultats
    if (searchData.results && searchData.results.length > 0) {
      // Prendre le premier résultat comme le plus pertinent
      const movie = searchData.results[0];
      
      // Base URL pour les images TMDB
      const imgBaseUrl = 'https://image.tmdb.org/t/p/w500';
      
      // Formater la date de sortie, si disponible
      const year = movie.release_date ? new Date(movie.release_date).getFullYear() : 'Date inconnue';
      
      // Récupérer les détails du film pour avoir le genre
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
      
      // Si on n'a pas pu récupérer les genres, utiliser une valeur par défaut
      if (!genreNames) {
        genreNames = 'Film';
      }
      
      return {
        title: movie.title || title,
        url: `https://www.themoviedb.org/movie/${movie.id}`,
        info: `${genreNames} • ${year} • Note: ${movie.vote_average.toFixed(1)}/10 • ${movie.overview ? movie.overview.substring(0, 100) + '...' : 'Pas de description disponible.'}`,
        imageUrl: movie.poster_path ? `${imgBaseUrl}${movie.poster_path}` : undefined
      };
    }
    
    // Si aucun résultat trouvé, utiliser une liste de films populaires pour un fallback
    const popularMovies = [
      {
        titlePattern: /(star wars|skywalker|jedi|sith|force)/i,
        genre: 'Sci-Fi',
        year: '1977-2023',
        rating: '8.4',
        imageUrl: 'https://lumiere-a.akamaihd.net/v1/images/star-wars-the-rise-of-skywalker-theatrical-poster-1000_ebc74357.jpeg'
      },
      {
        titlePattern: /(harry potter|hogwarts|wizard|magic)/i,
        genre: 'Fantasy',
        year: '2001-2011',
        rating: '8.1',
        imageUrl: 'https://m.media-amazon.com/images/I/71FQKrgx8TL._AC_UF894,1000_QL80_.jpg'
      },
      {
        titlePattern: /(lord of the rings|hobbit|tolkien|mordor)/i,
        genre: 'Fantasy',
        year: '2001-2003',
        rating: '8.9',
        imageUrl: 'https://m.media-amazon.com/images/I/71jLBXtWJWL._AC_UF894,1000_QL80_.jpg'
      },
      {
        titlePattern: /(marvel|avengers|thor|iron man|captain america|hulk)/i,
        genre: 'Action/Super-héros',
        year: '2008-2023',
        rating: '8.3',
        imageUrl: 'https://m.media-amazon.com/images/I/81F+s58uXiL._AC_UF894,1000_QL80_.jpg'
      },
      {
        titlePattern: /(jurassic park|dinosaur|jurassic world)/i,
        genre: 'Aventure/Science-fiction',
        year: '1993-2022',
        rating: '8.1',
        imageUrl: 'https://m.media-amazon.com/images/I/61RUzrE+23L._AC_UF894,1000_QL80_.jpg'
      },
      {
        titlePattern: /(titanic|ship|ocean|iceberg)/i,
        genre: 'Romance/Drame',
        year: '1997',
        rating: '7.9',
        imageUrl: 'https://m.media-amazon.com/images/I/71vwjqUFXjL._AC_UF894,1000_QL80_.jpg'
      }
    ];
    
    // Chercher une correspondance avec un film populaire
    const matchedMovie = popularMovies.find(movie => movie.titlePattern.test(title));
    
    if (matchedMovie) {
      return {
        title: title,
        url: `https://www.themoviedb.org/search?query=${encodeURIComponent(title)}`,
        info: `${matchedMovie.genre} • ${matchedMovie.year} • Note: ${matchedMovie.rating}/10 • Ce film a été ajouté via l'ajout magique.`,
        imageUrl: matchedMovie.imageUrl
      };
    }
    
    // Fallback final si vraiment rien n'est trouvé
    return {
      title: title,
      url: `https://www.themoviedb.org/search?query=${encodeURIComponent(title)}`,
      info: `Film ajouté via l'ajout magique. Pas d'informations trouvées pour "${title}".`,
      imageUrl: `https://source.unsplash.com/random/600x900/?movie,poster,cinema`
    };  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées du film/série:', error);
    return {
      title: title,
      url: `https://www.themoviedb.org/search?query=${encodeURIComponent(title)}`,
      info: 'Film ou série ajouté via l\'ajout magique. Erreur lors de la récupération des informations.',
      imageUrl: `https://source.unsplash.com/random/600x900/?movie,cinema` // Image générique de cinéma
    };
  }
};

/**
 * Récupère les métadonnées d'un restaurant
 * Utilise l'API Google Places
 */
export const getRestaurantMetadata = async (name: string): Promise<EnrichedMetadata> => {
  try {
    // Vérifier si la clé API Google Maps est disponible
    if (!GOOGLE_MAPS_API_KEY) {
      // Fallback si pas de clé API - utiliser l'ancienne logique
      console.warn("Clé API Google Maps non disponible, utilisation des données générées");
      // Liste des types de cuisine avec des mots-clés associés pour une détection intelligente
      const cuisineTypes = [
        { name: 'Italien', keywords: /(pizza|pasta|italian|italia|trattoria|pizzeria|foccacia|risotto)/i, images: ['pasta', 'pizza', 'italian-food'] },
        { name: 'Français', keywords: /(french|français|bistro|brasserie|gastronomique|france)/i, images: ['french-cuisine', 'french-restaurant', 'haute-cuisine'] },
        { name: 'Japonais', keywords: /(japan|sushi|ramen|japanese|japon|japonais|udon|sashimi|tempura)/i, images: ['sushi', 'japanese-food', 'ramen'] },
        { name: 'Mexicain', keywords: /(mexican|mexico|taco|burrito|mexique|mexicain|fajita|quesadilla)/i, images: ['mexican-food', 'tacos', 'burrito'] },
        { name: 'Indien', keywords: /(india|indian|curry|tandoori|inde|indien|naan|masala|tikka)/i, images: ['indian-food', 'curry', 'tandoori'] },
        { name: 'Thaïlandais', keywords: /(thai|thailand|thaï|thaïlande|thaïlandais|pad-thai)/i, images: ['thai-food', 'pad-thai', 'thai-curry'] },
        { name: 'Américain', keywords: /(american|burger|steak|bbq|états-unis|américain|grill)/i, images: ['burger', 'american-food', 'bbq'] },
        { name: 'Chinois', keywords: /(china|chinese|dim-sum|chine|chinois|wok|cantonais)/i, images: ['chinese-food', 'dim-sum', 'chinese-restaurant'] },
        { name: 'Grec', keywords: /(greek|greece|gyros|grèce|grec|pita|feta|souvlaki)/i, images: ['greek-food', 'souvlaki', 'gyros'] },
        { name: 'Espagnol', keywords: /(spain|spanish|tapas|paella|espagne|espagnol)/i, images: ['tapas', 'paella', 'spanish-food'] },
      ];
      
      // Générer un hash stable à partir du nom pour obtenir des résultats cohérents
      const nameHash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
      
      // Détecter la cuisine basée sur le nom du restaurant
      let cuisine = cuisineTypes.find(type => type.keywords.test(name));
      
      // Si aucune cuisine n'est détectée, utiliser une sélection pseudo-aléatoire mais cohérente
      if (!cuisine) {
        cuisine = cuisineTypes[nameHash % cuisineTypes.length];
      }
      
      // Sélectionner une image cohérente basée sur le type de cuisine
      const imageKeyword = cuisine.images[nameHash % cuisine.images.length];
      
      // Générer un prix cohérent (plus cher pour certains types de cuisine comme le français)
      const priceIndices = {
        'Français': [1, 2, 3],
        'Japonais': [1, 2, 3],
        'Italien': [0, 1, 2],
        'Américain': [0, 1],
        'Indien': [0, 1, 2],
        'Mexicain': [0, 1],
        'Thaïlandais': [0, 1, 2],
        'Chinois': [0, 1],
        'Grec': [0, 1, 2],
        'Espagnol': [1, 2],
      };
      
      const priceRanges = ['€', '€€', '€€€', '€€€€'];
      const priceIndicesForCuisine = priceIndices[cuisine.name] || [0, 1, 2, 3];
      const priceIndex = priceIndicesForCuisine[nameHash % priceIndicesForCuisine.length];
      const price = priceRanges[priceIndex];
      
      // Générer une note cohérente (plus haute pour certains types de cuisine)
      const baseRating = 3.7;
      const maxBonus = 1.2;
      const rating = (baseRating + (nameHash % 100) / 100 * maxBonus).toFixed(1);
      
      return {
        title: name,
        url: `https://www.google.com/maps/search/${encodeURIComponent(name)}`,
        info: `${cuisine.name} • ${price} • Note: ${rating}/5 • Restaurant ajouté via l'ajout magique.`,
        imageUrl: `https://source.unsplash.com/featured/800x450/?restaurant,${encodeURIComponent(imageKeyword)}`
      };
    }
    
    // Charger l'API Google Maps JavaScript au lieu d'appeler directement l'API Places
    await loadGoogleMapsAPI();
    
    // Utilisez l'API Places à travers l'API Google Maps JavaScript
    return new Promise((resolve, reject) => {
      try {
        // Créer une instance de PlacesService avec un élément DOM (peut être invisible)
        const placesDiv = document.createElement('div');
        const placesService = new google.maps.places.PlacesService(placesDiv);
        
        // 1. Rechercher le restaurant par nom
        placesService.findPlaceFromQuery({
          query: name,
          fields: ['place_id', 'name', 'formatted_address']
        }, (results, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !results || results.length === 0) {
            console.warn(`Aucun restaurant trouvé pour "${name}"`);
            // Fallback avec des données générées
            const fallbackData = generateFallbackRestaurantData(name);
            resolve(fallbackData);
            return;
          }
          
          const placeResult = results[0];
          
          // 2. Récupérer les détails du restaurant trouvé
          placesService.getDetails({
            placeId: placeResult.place_id,
            fields: [
              'name', 'rating', 'formatted_address', 'formatted_phone_number', 
              'website', 'price_level', 'photos', 'types', 'user_ratings_total',
              'opening_hours', 'url'
            ]
          }, (placeDetails, detailStatus) => {
            if (detailStatus !== google.maps.places.PlacesServiceStatus.OK || !placeDetails) {
              console.warn(`Impossible de récupérer les détails pour "${name}"`);
              // Fallback avec les données de base du lieu trouvé
              resolve({
                title: placeResult.name || name,
                url: `https://www.google.com/maps/search/${encodeURIComponent(name)}`,
                info: `Restaurant • ${placeResult.formatted_address || ''}`,
                imageUrl: `https://source.unsplash.com/featured/800x450/?restaurant,food`
              });
              return;
            }
            
            // Même traitement que précédemment mais avec les objets Google Maps
            // Déterminer le type de cuisine en se basant sur les types fournis par Google
            let cuisineType = '';
            const cuisineMapping: Record<string, string> = {
              'italian_restaurant': 'Italien',
              'french_restaurant': 'Français',
              'japanese_restaurant': 'Japonais',
              'mexican_restaurant': 'Mexicain',
              'indian_restaurant': 'Indien',
              'thai_restaurant': 'Thaïlandais',
              'chinese_restaurant': 'Chinois',
              'greek_restaurant': 'Grec',
              'spanish_restaurant': 'Espagnol',
              'american_restaurant': 'Américain',
              'restaurant': 'Restaurant',
              'food': 'Restaurant',
              'cafe': 'Café',
              'bar': 'Bar'
            };
            
            if (placeDetails.types) {
              for (const type of placeDetails.types) {
                if (cuisineMapping[type]) {
                  cuisineType = cuisineMapping[type];
                  break;
                }
              }
            }
            
            if (!cuisineType) cuisineType = 'Restaurant';
            
            // Formater le prix
            const priceSymbols = ['', '€', '€€', '€€€', '€€€€'];
            const price = priceSymbols[placeDetails.price_level] || '';
            
            // Formater la note
            const rating = placeDetails.rating ? `${placeDetails.rating}` : 'N/A';
            const numberOfRatings = placeDetails.user_ratings_total ? ` (${placeDetails.user_ratings_total} avis)` : '';
            
            // Récupérer l'image du restaurant si disponible
            let imageUrl = '';
            if (placeDetails.photos && placeDetails.photos.length > 0) {
              // L'API Google Maps JavaScript nous donne accès direct à la photo via getUrl()
              imageUrl = placeDetails.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
            } else {
              // Image par défaut si pas de photo disponible
              imageUrl = `https://source.unsplash.com/featured/800x450/?restaurant,${encodeURIComponent(cuisineType.toLowerCase())}`;
            }
            
            // Générer une URL pour Google Maps
            const mapUrl = placeDetails.website || placeDetails.url || `https://www.google.com/maps/place/?q=place_id:${placeDetails.place_id}`;
            
            // Générer les informations du restaurant
            const address = placeDetails.formatted_address ? `${placeDetails.formatted_address}` : '';
            const phone = placeDetails.formatted_phone_number ? ` • Tél: ${placeDetails.formatted_phone_number}` : '';
            
            resolve({
              title: placeDetails.name || name,
              url: mapUrl,
              info: `${cuisineType} • ${price} • Note: ${rating}${numberOfRatings} • ${address}${phone}`,
              imageUrl: imageUrl
            });
          });
        });
      } catch (error) {
        console.error('Erreur lors de l\'utilisation de Google Maps API:', error);
        const fallbackData = generateFallbackRestaurantData(name);
        resolve(fallbackData);
      }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées du restaurant:', error);
    return generateFallbackRestaurantData(name);
  }
};

/**
 * Génère des données de restaurant de secours en cas d'erreur
 */
const generateFallbackRestaurantData = (name: string): EnrichedMetadata => {
  return {
    title: name,
    url: `https://www.google.com/maps/search/${encodeURIComponent(name)}`,
    info: `Restaurant ajouté via l'ajout magique.`,
    imageUrl: `https://source.unsplash.com/featured/800x450/?restaurant,food`
  };
};

/**
 * Récupère les métadonnées d'une destination touristique
 * Utilise l'API Google Places
 */
export const getTourismMetadata = async (destination: string): Promise<EnrichedMetadata> => {
  try {
    // Vérifier si la clé API Google Maps est disponible
    if (!GOOGLE_MAPS_API_KEY) {
      // Fallback si pas de clé API - utiliser l'ancienne logique
      console.warn("Clé API Google Maps non disponible, utilisation des données générées");
      
      // Liste des destinations célèbres pour offrir des réponses spécifiques
      const famousDestinations = [
        { 
          pattern: /(paris|tour eiffel|eiffel tower|notre dame|louvre)/i, 
          info: `Paris, la ville lumière, est célèbre pour ses monuments emblématiques comme la Tour Eiffel, le Louvre et Notre-Dame. Explorez ses cafés, sa gastronomie et son ambiance romantique unique.`,
          imageUrl: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?q=80&w=2070' 
        },
        { 
          pattern: /(new york|nyc|big apple|times square|central park|statue of liberty)/i, 
          info: `New York, la ville qui ne dort jamais, offre une énergie incomparable avec ses gratte-ciels iconiques, Times Square, Central Park et sa diversité culturelle exceptionnelle.`,
          imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070' 
        },
        { 
          pattern: /(rome|roma|coliseum|colosseum|colisée|vatican)/i, 
          info: `Rome, la ville éternelle, vous plonge dans l'histoire avec le Colisée, le Forum romain et le Vatican. Savourez la dolce vita italienne, les pizzas et les gelati authentiques.`,
          imageUrl: 'https://images.unsplash.com/photo-1604580864964-0462f5d5b1a8?q=80&w=2070' 
        },
        { 
          pattern: /(tokyo|japon|japan)/i, 
          info: `Tokyo est un fascinant mélange d'ultramoderne et de traditionnel, des gratte-ciel futuristes aux temples séculaires. Découvrez sa gastronomie renommée et sa culture pop unique.`,
          imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2071' 
        },
        { 
          pattern: /(barcelone|barcelona|sagrada familia|gaudi|ramblas)/i, 
          info: `Barcelone séduit par son architecture moderniste unique de Gaudí, ses plages méditerranéennes et sa vie nocturne animée. La Sagrada Familia et le Parc Güell sont incontournables.`,
          imageUrl: 'https://images.unsplash.com/photo-1558642084-fd07fae5282e?q=80&w=2002' 
        },
        { 
          pattern: /(london|londres|big ben|tower bridge|buckingham)/i, 
          info: `Londres mêle histoire royale et culture avant-gardiste. Visitez Big Ben, le Tower Bridge et les musées de renommée mondiale, puis profitez de ses marchés et quartiers éclectiques.`,
          imageUrl: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?q=80&w=2070' 
        }
      ];
      
      // Chercher une correspondance dans les destinations célèbres
      const matchedDestination = famousDestinations.find(dest => dest.pattern.test(destination));
      
      if (matchedDestination) {
        return {
          title: destination,
          url: `https://www.tripadvisor.fr/Search?q=${encodeURIComponent(destination)}`,
          info: matchedDestination.info,
          imageUrl: matchedDestination.imageUrl
        };
      }
      
      // Générer des descriptions plus élaborées avec des détails spécifiques
      // basés sur des motifs de noms de lieux
      let specificInfo = '';
      let imageQuery = '';
      
      if (/(beach|plage|sea|mer|ocean|côte|coast)/i.test(destination)) {
        specificInfo = `${destination} offre des plages paradisiaques et des eaux cristallines idéales pour la détente et les sports nautiques. Profitez du soleil, des activités balnéaires et de la gastronomie locale.`;
        imageQuery = 'beach,paradise';
      } else if (/(mountain|montagne|alp|alps|alpes|hill)/i.test(destination)) {
        specificInfo = `${destination} est réputé pour ses paysages montagneux à couper le souffle, parfaits pour la randonnée en été et les sports d'hiver. L'air pur et les panoramas spectaculaires vous attendent.`;
        imageQuery = 'mountains,landscape';
      } else if (/(museum|musée|gallery|galerie|art)/i.test(destination)) {
        specificInfo = `${destination} est un haut lieu culturel avec ses collections artistiques remarquables et ses expositions innovantes. Une expérience enrichissante pour les amateurs d'art et d'histoire.`;
        imageQuery = 'museum,art,gallery';
      } else if (/(castle|château|palace|palais|fortress|fort)/i.test(destination)) {
        specificInfo = `${destination} vous transporte dans le temps avec son architecture médiévale impressionnante et son riche patrimoine historique. Explorez ses salles somptueuses et ses jardins élégants.`;
        imageQuery = 'castle,palace,historical';
      } else if (/(island|île|islande|tropical)/i.test(destination)) {
        specificInfo = `${destination} est un paradis insulaire offrant un parfait équilibre entre nature préservée et détente. Ses eaux turquoise et sa végétation luxuriante en font un lieu d'évasion idéal.`;
        imageQuery = 'island,tropical,paradise';
      } else {
        // Génération de descriptions génériques améliorées
        const descriptions = [
          `${destination} est une destination fascinante qui allie richesse culturelle, sites historiques remarquables et expériences authentiques. Idéal pour les voyageurs curieux de découvrir de nouveaux horizons.`,
          `Découvrez la magie de ${destination}, une destination qui séduit par la diversité de ses paysages, sa gastronomie locale et l'accueil chaleureux de ses habitants.`,
          `${destination} offre une expérience de voyage inoubliable entre monuments emblématiques, traditions vivantes et atmosphère unique. Une destination qui mérite pleinement sa réputation.`,
          `Visiter ${destination} est une aventure enrichissante à travers l'histoire, l'architecture et les saveurs locales. Chaque coin de rue révèle de nouvelles découvertes et surprises.`
        ];
        
        // Utiliser un hash pour obtenir un résultat cohérent basé sur le nom
        const nameHash = destination.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        specificInfo = descriptions[nameHash % descriptions.length];
        imageQuery = 'travel,destination,tourism';
      }
      
      return {
        title: destination,
        url: `https://www.google.com/travel/search?q=${encodeURIComponent(destination)}`,
        info: specificInfo,
        imageUrl: `https://source.unsplash.com/featured/800x500/?${encodeURIComponent(destination.toLowerCase())},${encodeURIComponent(imageQuery)}`
      };
    }
      // Si nous avons la clé API, utiliser l'API Google Maps JavaScript
    // Charger l'API Google Maps JavaScript
    await loadGoogleMapsAPI();
    
    // Utiliser l'API Places à travers l'API Google Maps JavaScript
    return new Promise((resolve, reject) => {
      try {
        // Créer une instance de PlacesService avec un élément DOM
        const placesDiv = document.createElement('div');
        const placesService = new google.maps.places.PlacesService(placesDiv);
        
        // Déterminer le type de recherche en fonction du nom de destination
        let placeType = null;
        
        if (/(beach|plage|sea|mer|ocean|côte|coast)/i.test(destination)) {
          placeType = 'tourist_attraction';
        } else if (/(mountain|montagne|alp|alps|alpes|hill)/i.test(destination)) {
          placeType = 'natural_feature';
        } else if (/(museum|musée|gallery|galerie|art)/i.test(destination)) {
          placeType = 'museum';
        } else if (/(castle|château|palace|palais|fortress|fort)/i.test(destination)) {
          placeType = 'tourist_attraction';
        } else if (/(island|île|islande|tropical)/i.test(destination)) {
          placeType = 'natural_feature';
        } else if (/(city|ville|town|capitale)/i.test(destination)) {
          placeType = 'locality';
        }
        
        // 1. Rechercher la destination par nom
        placesService.findPlaceFromQuery({
          query: destination,
          fields: ['place_id', 'name', 'formatted_address']
        }, (results, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !results || results.length === 0) {
            console.warn(`Aucune destination trouvée pour "${destination}"`);
            // Fallback avec des données générées
            const fallbackData = generateFallbackTourismData(destination);
            resolve(fallbackData);
            return;
          }
          
          const placeResult = results[0];
          
          // 2. Récupérer les détails de la destination trouvée
          placesService.getDetails({
            placeId: placeResult.place_id,
            fields: [
              'name', 'rating', 'formatted_address', 'photos', 'types',
              'user_ratings_total', 'website', 'url', 'international_phone_number'
            ]
          }, (placeDetails, detailStatus) => {
            if (detailStatus !== google.maps.places.PlacesServiceStatus.OK || !placeDetails) {
              console.warn(`Impossible de récupérer les détails pour "${destination}"`);
              // Fallback avec les données de base du lieu trouvé
              resolve({
                title: placeResult.name || destination,
                url: `https://www.google.com/travel/search?q=${encodeURIComponent(destination)}`,
                info: `Destination touristique • ${placeResult.formatted_address || ''}`,
                imageUrl: `https://source.unsplash.com/featured/800x500/?${encodeURIComponent(destination.toLowerCase())},travel`
              });
              return;
            }
            
            // Déterminer le type de lieu
            let placeCategory = 'Destination touristique';
            const placeTypeMapping: Record<string, string> = {
              'tourist_attraction': 'Attraction touristique',
              'natural_feature': 'Site naturel',
              'museum': 'Musée',
              'art_gallery': 'Galerie d\'art',
              'church': 'Église',
              'historical_landmark': 'Site historique',
              'castle': 'Château',
              'beach': 'Plage',
              'mountain': 'Montagne',
              'island': 'Île',
              'city': 'Ville',
              'country': 'Pays',
              'landmark': 'Monument',
              'park': 'Parc',
              'point_of_interest': 'Point d\'intérêt'
            };
            
            if (placeDetails.types) {
              for (const type of placeDetails.types) {
                if (placeTypeMapping[type]) {
                  placeCategory = placeTypeMapping[type];
                  break;
                }
              }
            }
            
            // Générer une description pour le lieu
            let description = '';
            // Note: Google.maps.places n'a pas d'editorial_summary, donc nous générons toujours
            const descriptions = [
              `${placeDetails.name} est une destination fascinante qui mérite d'être découverte. Profitez de ce lieu unique et créez des souvenirs inoubliables.`,
              `Explorez ${placeDetails.name} et immergez-vous dans son atmosphère incomparable. Une destination qui vous promet une expérience riche en découvertes.`,
              `${placeDetails.name} vous invite à découvrir ses merveilles et son charme unique. Une visite qui ne manquera pas de vous impressionner.`,
              `Destination prisée, ${placeDetails.name} offre une expérience authentique et des panoramas à couper le souffle. Un incontournable à ajouter à votre liste.`
            ];
            
            // Utiliser un hash pour obtenir un résultat cohérent basé sur le nom
            const nameHash = placeDetails.name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
            description = descriptions[nameHash % descriptions.length];
            
            // Formater la note si disponible
            const rating = placeDetails.rating ? `Note: ${placeDetails.rating}` : '';
            const numberOfRatings = placeDetails.user_ratings_total ? ` (${placeDetails.user_ratings_total} avis)` : '';
            const ratingInfo = rating ? `${rating}${numberOfRatings} • ` : '';
            
            // Récupérer l'image de la destination si disponible
            let imageUrl = '';
            if (placeDetails.photos && placeDetails.photos.length > 0) {
              // L'API Google Maps JavaScript nous donne accès direct à la photo via getUrl()
              imageUrl = placeDetails.photos[0].getUrl({ maxWidth: 800, maxHeight: 600 });
            } else {
              // Image par défaut si pas de photo disponible
              imageUrl = `https://source.unsplash.com/featured/800x500/?${encodeURIComponent(placeDetails.name.toLowerCase())},travel`;
            }
            
            // Générer une URL pour la destination
            const placeUrl = placeDetails.website || placeDetails.url || `https://www.google.com/maps/place/?q=place_id:${placeDetails.place_id}`;
            
            // Formater l'adresse
            const address = placeDetails.formatted_address ? ` • ${placeDetails.formatted_address}` : '';
            
            resolve({
              title: placeDetails.name || destination,
              url: placeUrl,
              info: `${placeCategory} • ${ratingInfo}${description}${address}`,
              imageUrl: imageUrl
            });
          });
        });
      } catch (error) {
        console.error('Erreur lors de l\'utilisation de Google Maps API:', error);
        const fallbackData = generateFallbackTourismData(destination);
        resolve(fallbackData);
      }
    });
      } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées touristiques:', error);
    return generateFallbackTourismData(destination);
  }
};

/**
 * Génère des données de destination touristique de secours en cas d'erreur
 */
const generateFallbackTourismData = (destination: string): EnrichedMetadata => {
  // Liste des destinations célèbres pour offrir des réponses spécifiques
  const famousDestinations = [
    { 
      pattern: /(paris|tour eiffel|eiffel tower|notre dame|louvre)/i, 
      info: `Paris, la ville lumière, est célèbre pour ses monuments emblématiques comme la Tour Eiffel, le Louvre et Notre-Dame. Explorez ses cafés, sa gastronomie et son ambiance romantique unique.`,
      imageUrl: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?q=80&w=2070' 
    },
    { 
      pattern: /(new york|nyc|big apple|times square|central park|statue of liberty)/i, 
      info: `New York, la ville qui ne dort jamais, offre une énergie incomparable avec ses gratte-ciels iconiques, Times Square, Central Park et sa diversité culturelle exceptionnelle.`,
      imageUrl: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?q=80&w=2070' 
    },
    { 
      pattern: /(rome|roma|coliseum|colosseum|colisée|vatican)/i, 
      info: `Rome, la ville éternelle, vous plonge dans l'histoire avec le Colisée, le Forum romain et le Vatican. Savourez la dolce vita italienne, les pizzas et les gelati authentiques.`,
      imageUrl: 'https://images.unsplash.com/photo-1604580864964-0462f5d5b1a8?q=80&w=2070' 
    },
    { 
      pattern: /(tokyo|japon|japan)/i, 
      info: `Tokyo est un fascinant mélange d'ultramoderne et de traditionnel, des gratte-ciel futuristes aux temples séculaires. Découvrez sa gastronomie renommée et sa culture pop unique.`,
      imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2071' 
    },
    { 
      pattern: /(barcelone|barcelona|sagrada familia|gaudi|ramblas)/i, 
      info: `Barcelone séduit par son architecture moderniste unique de Gaudí, ses plages méditerranéennes et sa vie nocturne animée. La Sagrada Familia et le Parc Güell sont incontournables.`,
      imageUrl: 'https://images.unsplash.com/photo-1558642084-fd07fae5282e?q=80&w=2002' 
    },
    { 
      pattern: /(london|londres|big ben|tower bridge|buckingham)/i, 
      info: `Londres mêle histoire royale et culture avant-gardiste. Visitez Big Ben, le Tower Bridge et les musées de renommée mondiale, puis profitez de ses marchés et quartiers éclectiques.`,
      imageUrl: 'https://images.unsplash.com/photo-1520986606214-8b456906c813?q=80&w=2070' 
    }
  ];
  
  // Chercher une correspondance dans les destinations célèbres
  const matchedDestination = famousDestinations.find(dest => dest.pattern.test(destination));
  
  if (matchedDestination) {
    return {
      title: destination,
      url: `https://www.tripadvisor.fr/Search?q=${encodeURIComponent(destination)}`,
      info: matchedDestination.info,
      imageUrl: matchedDestination.imageUrl
    };
  }
  
  // Générer des descriptions plus élaborées avec des détails spécifiques
  // basés sur des motifs de noms de lieux
  let specificInfo = '';
  let imageQuery = '';
  
  if (/(beach|plage|sea|mer|ocean|côte|coast)/i.test(destination)) {
    specificInfo = `${destination} offre des plages paradisiaques et des eaux cristallines idéales pour la détente et les sports nautiques. Profitez du soleil, des activités balnéaires et de la gastronomie locale.`;
    imageQuery = 'beach,paradise';
  } else if (/(mountain|montagne|alp|alps|alpes|hill)/i.test(destination)) {
    specificInfo = `${destination} est réputé pour ses paysages montagneux à couper le souffle, parfaits pour la randonnée en été et les sports d'hiver. L'air pur et les panoramas spectaculaires vous attendent.`;
    imageQuery = 'mountains,landscape';
  } else if (/(museum|musée|gallery|galerie|art)/i.test(destination)) {
    specificInfo = `${destination} est un haut lieu culturel avec ses collections artistiques remarquables et ses expositions innovantes. Une expérience enrichissante pour les amateurs d'art et d'histoire.`;
    imageQuery = 'museum,art,gallery';
  } else if (/(castle|château|palace|palais|fortress|fort)/i.test(destination)) {
    specificInfo = `${destination} vous transporte dans le temps avec son architecture médiévale impressionnante et son riche patrimoine historique. Explorez ses salles somptueuses et ses jardins élégants.`;
    imageQuery = 'castle,palace,historical';
  } else if (/(island|île|islande|tropical)/i.test(destination)) {
    specificInfo = `${destination} est un paradis insulaire offrant un parfait équilibre entre nature préservée et détente. Ses eaux turquoise et sa végétation luxuriante en font un lieu d'évasion idéal.`;
    imageQuery = 'island,tropical,paradise';
  } else {
    // Génération de descriptions génériques améliorées
    const descriptions = [
      `${destination} est une destination fascinante qui allie richesse culturelle, sites historiques remarquables et expériences authentiques. Idéal pour les voyageurs curieux de découvrir de nouveaux horizons.`,
      `Découvrez la magie de ${destination}, une destination qui séduit par la diversité de ses paysages, sa gastronomie locale et l'accueil chaleureux de ses habitants.`,
      `${destination} offre une expérience de voyage inoubliable entre monuments emblématiques, traditions vivantes et atmosphère unique. Une destination qui mérite pleinement sa réputation.`,
      `Visiter ${destination} est une aventure enrichissante à travers l'histoire, l'architecture et les saveurs locales. Chaque coin de rue révèle de nouvelles découvertes et surprises.`
    ];
    
    // Utiliser un hash pour obtenir un résultat cohérent basé sur le nom
    const nameHash = destination.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    specificInfo = descriptions[nameHash % descriptions.length];
    imageQuery = 'travel,destination,tourism';
  }
  
  return {
    title: destination,
    url: `https://www.google.com/travel/search?q=${encodeURIComponent(destination)}`,
    info: specificInfo,
    imageUrl: `https://source.unsplash.com/featured/800x500/?${encodeURIComponent(destination.toLowerCase())},${encodeURIComponent(imageQuery)}`
  };
};

/**
 * Point d'entrée principal pour récupérer des métadonnées selon la catégorie
 */
// Fonction pour générer une URL d'image de secours
const getFallbackImageUrl = (title: string, categoryId: string): string => {
  // Générer une valeur stable basée sur le titre pour avoir une image cohérente
  const seed = title.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  
  switch(categoryId) {
    case 'c1': // YouTube
      return 'https://i.ytimg.com/vi/jNQXAC9IVRw/maxresdefault.jpg'; // Premier vidéo YouTube
    case 'c2': // Films & Séries
      return `https://source.unsplash.com/featured/600x900/?movie,cinema,film`;
    case 'c3': // Restaurants
      return `https://source.unsplash.com/featured/800x450/?restaurant,food,dining`;
    case 'c4': // Tourisme
      return `https://source.unsplash.com/featured/800x500/?travel,destination,tourism`;
    default:
      // Utiliser des images thématiques basées sur le titre
      const themes = ['business', 'technology', 'nature', 'abstract', 'people', 'objects'];
      const theme = themes[seed % themes.length];
      return `https://source.unsplash.com/featured/800x600/?${encodeURIComponent(theme)}`;
  }
};

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
        // Catégorie personnalisée, créer un contenu générique
        const seed = title.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
        const themes = ['business', 'art', 'education', 'sport', 'technology', 'nature'];
        const theme = themes[seed % themes.length];
        
        result = {
          title: title,
          info: `Élément ajouté via l'ajout magique dans une catégorie personnalisée. Type: ${theme}`,
          url: `https://www.google.com/search?q=${encodeURIComponent(title)}`,
          imageUrl: `https://source.unsplash.com/featured/800x450/?${encodeURIComponent(theme)},${encodeURIComponent(title.split(' ')[0].toLowerCase())}`
        };
        break;
    }
    
    // S'assurer que toutes les propriétés sont définies et valides
    return {
      title: result.title || title,
      url: result.url || `https://www.google.com/search?q=${encodeURIComponent(title)}`,
      info: result.info || `Élément ajouté via l'ajout magique.`,
      imageUrl: result.imageUrl || getFallbackImageUrl(title, categoryId)
    };
    
  } catch (error) {
    console.error('Erreur lors de la récupération des métadonnées:', error);
    
    // En cas d'erreur, retourner des métadonnées minimales avec une image de secours
    return {
      title: title,
      url: `https://www.google.com/search?q=${encodeURIComponent(title)}`,
      info: `Élément ajouté via l'ajout magique.`,
      imageUrl: getFallbackImageUrl(title, categoryId)
    };
  }
};
