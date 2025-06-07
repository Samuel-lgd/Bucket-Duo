// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import type {Schema} from "../../amplify/data/resource";
import {v4 as uuidv4} from 'uuid';

let mockCategories: Schema["Category"]["type"][] = [
  {
    id: "c1",
    name: "Youtube",
    system: true,
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c2",
    name: "Séries & Films",
    system: true,
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c3",
    name: "Restaurants",
    system: true,
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c4",
    name: "Tourisme",
    system: true,
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

let mockBuckets: Schema["Bucket"]["type"][] = [
  {
    id: "b1",
    name: "Samuel & Laura",
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let mockItems: Schema["Item"]["type"][] = [
  // Catégorie Youtube
  {
    id: "i1",
    title: "100 jours à manger bleu - L'Effet Papillon",
    url: "https://www.youtube.com/watch?v=mBcDDDEK8f8",
    info: "Reportage sur une expérience alimentaire extrême",
    imageUrl: "https://i.ytimg.com/vi/mBcDDDEK8f8/hqdefault.jpg",
    bucketID: "b1",
    categoryID: "c1",
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "i2",
    title: "Vilbrequin : On fait un moteur de F1 en LEGO !",
    url: "https://www.youtube.com/watch?v=DKJ8E8Qo9lA",
    info: "Vidéo de construction et test d'un moteur de F1 en LEGO",
    imageUrl: "https://i.ytimg.com/vi/DKJ8E8Qo9lA/hqdefault.jpg",
    bucketID: "b1",
    categoryID: "c1",
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "i3",
    title: "Squeezie - Qui est l'imposteur ?",
    url: "https://www.youtube.com/watch?v=QnDWIZuWYW8",
    info: "Vidéo gameplay très fun avec un concept intéressant",
    imageUrl: "https://i.ytimg.com/vi/QnDWIZuWYW8/hqdefault.jpg",
    bucketID: "b1",
    categoryID: "c1",
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Catégorie Séries & Films
  {
    id: "i4",
    title: "Stranger Things - Saison 5",
    url: "https://www.netflix.com/title/80057281",
    info: "Sortie prévue fin 2024, dernier épisode de la série",
    imageUrl: "https://m.media-amazon.com/images/M/MV5BMDZkYmVhNjMtNWU4MC00MDQxLWE3MjYtNWYyMzBhYzMyMmRiXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg",
    bucketID: "b1",
    categoryID: "c2",
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "i5",
    title: "The Bear - Saison 3",
    url: "https://www.disneyplus.com/series/the-bear/69SWl0Uj1EQR",
    info: "Nouvelle saison disponible en streaming, à regarder ensemble",
    bucketID: "b1",
    categoryID: "c2",
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "i6",
    title: "Dune : Deuxième Partie",
    url: "https://www.allocine.fr/film/fichefilm_gen_cfilm=275274.html",
    info: "Film à voir au cinéma ou en streaming, adaptation du roman de Frank Herbert",
    bucketID: "b1",
    categoryID: "c2",
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Catégorie Restaurants
  {
    id: "i7",
    title: "Le Petit Cambodge",
    url: "https://www.petitcambodge.fr/",
    info: "Restaurant cambodgien à Paris, spécialité : Bo bun",
    bucketID: "b1",
    categoryID: "c3",
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "i8",
    title: "La Brigade du Tigre",
    url: "https://www.labrigadedutigre.fr/",
    info: "Cuisine asiatique moderne, à essayer pour l'anniversaire de Laura",
    bucketID: "b1",
    categoryID: "c3",
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "i9",
    title: "Le Café des Chats",
    url: "https://www.lecafedeschats.fr/",
    info: "Café où l'on peut caresser des chats en buvant un thé/café",
    bucketID: "b1",
    categoryID: "c3",
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Catégorie Tourisme
  {
    id: "i10",
    title: "Week-end à Lisbonne",
    url: "https://www.routard.com/guide/code_dest/lisbonne.htm",
    info: "Idée de city-trip pour cet été, facile d'accès en avion depuis Paris",
    bucketID: "b1",
    categoryID: "c4",
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "i11",
    title: "Randonnée autour du Mont-Blanc",
    url: "https://www.montourdumontblanc.com/fr/index.aspx",
    info: "À programmer sur une semaine, possibilité de réserver les refuges à l'avance",
    bucketID: "b1",
    categoryID: "c4",
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "i12",
    title: "Journée au Parc de Versailles",
    url: "https://www.chateauversailles.fr/",
    info: "Prévoir pique-nique et vélos pour faire le tour du Grand Canal",
    bucketID: "b1",
    categoryID: "c4",
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// Service de données mockées qui imite l'API GraphQL
export const mockDataService = {
  // CATEGORY OPERATIONS
  listCategories: async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: [...mockCategories] };
  },

  createCategory: async (input: Partial<Schema["Category"]["type"]>) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newCategory: Schema["Category"]["type"] = {
      id: uuidv4(),
      name: input.name || "Nouvelle catégorie",
      system: input.system || false,
      owner: input.owner || "current-user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockCategories.push(newCategory);
    return { data: newCategory };
  },

  updateCategory: async (input: Partial<Schema["Category"]["type"]>) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockCategories.findIndex(c => c.id === input.id);

    if (index === -1) {
      throw new Error("Category not found");
    }

    const updatedCategory = {
      ...mockCategories[index],
      ...input,
      updatedAt: new Date().toISOString()
    };

    mockCategories[index] = updatedCategory;
    return { data: updatedCategory };
  },

  deleteCategory: async (input: { id: string }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const initialLength = mockCategories.length;
    mockCategories = mockCategories.filter(c => c.id !== input.id);
    return { success: mockCategories.length < initialLength };
  },

  // BUCKET OPERATIONS
  listBuckets: async () => {
    // Simuler la latence du réseau
    await new Promise(resolve => setTimeout(resolve, 300));
    return { data: [...mockBuckets] };
  },

  createBucket: async (input: Partial<Schema["Bucket"]["type"]>) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newBucket: Schema["Bucket"]["type"] = {
      id: uuidv4(),
      name: input.name || "Nouveau bucket",
      owner: input.owner || "current-user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockBuckets.push(newBucket);
    return { data: newBucket };
  },

  updateBucket: async (input: Partial<Schema["Bucket"]["type"]>) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockBuckets.findIndex(b => b.id === input.id);

    if (index === -1) {
      throw new Error("Bucket not found");
    }

    const updatedBucket = {
      ...mockBuckets[index],
      ...input,
      updatedAt: new Date().toISOString()
    };

    mockBuckets[index] = updatedBucket;
    return { data: updatedBucket };
  },

  deleteBucket: async (input: { id: string }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const initialLength = mockBuckets.length;
    mockBuckets = mockBuckets.filter(b => b.id !== input.id);

    // Supprimer également les items associés à ce bucket
    mockItems = mockItems.filter(i => i.bucketID !== input.id);

    return { success: mockBuckets.length < initialLength };
  },

  // ITEM OPERATIONS
  listItems: async (options?: { filter?: { bucketID?: { eq: string }, categoryID?: { eq: string } } }) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredItems = [...mockItems];

    if (options?.filter?.bucketID?.eq) {
      filteredItems = filteredItems.filter(item => item.bucketID === options.filter.bucketID.eq);
    }

    if (options?.filter?.categoryID?.eq) {
      filteredItems = filteredItems.filter(item => item.categoryID === options.filter.categoryID.eq);
    }

    return { data: filteredItems };
  },

  createItem: async (input: Partial<Schema["Item"]["type"]>) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newItem: Schema["Item"]["type"] = {
      id: uuidv4(),
      title: input.title || "Nouvel item",
      url: input.url,
      info: input.info,
      imageUrl: input.imageUrl,
      bucketID: input.bucketID || "",
      categoryID: input.categoryID || "c1", // Catégorie par défaut
      owner: input.owner || "current-user",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockItems.push(newItem);
    return { data: newItem };
  },

  updateItem: async (input: Partial<Schema["Item"]["type"]>) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const index = mockItems.findIndex(i => i.id === input.id);

    if (index === -1) {
      throw new Error("Item not found");
    }

    const updatedItem = {
      ...mockItems[index],
      ...input,
      updatedAt: new Date().toISOString()
    };

    mockItems[index] = updatedItem;
    return { data: updatedItem };
  },

  deleteItem: async (input: { id: string }) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const initialLength = mockItems.length;
    mockItems = mockItems.filter(i => i.id !== input.id);
    return { success: mockItems.length < initialLength };
  }
};

// Service client qui peut basculer entre mock et API réelle
export function createDataService(useMock = false) {
  if (useMock) {
    return {
      models: {
        Category: {
          list: mockDataService.listCategories,
          create: mockDataService.createCategory,
          update: mockDataService.updateCategory,
          delete: mockDataService.deleteCategory
        },
        Bucket: {
          list: mockDataService.listBuckets,
          create: mockDataService.createBucket,
          update: mockDataService.updateBucket,
          delete: mockDataService.deleteBucket
        },
        Item: {
          list: mockDataService.listItems,
          create: mockDataService.createItem,
          update: mockDataService.updateItem,
          delete: mockDataService.deleteItem
        }
      }
    };
  } else {
    // Utiliser le vrai client Amplify
    return import('aws-amplify/data').then(
      amplifyData => amplifyData.generateClient<Schema>()
    );
  }
}
