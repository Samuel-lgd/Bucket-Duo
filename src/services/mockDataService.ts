import type {Schema} from "../../amplify/data/resource";
import {v4 as uuidv4} from 'uuid';

let mockCategories: Schema["Category"]["type"][] = [
  {
    id: "c1",
    name: "Tourisme",
    system: true,
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c2",
    name: "Gastronomie",
    system: true,
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c3",
    name: "Bricolage",
    system: true,
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

let mockBuckets: Schema["Bucket"]["type"][] = [
  {
    id: "b1",
    name: "Voyage en Italie",
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "b2",
    name: "Recettes de cuisine",
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "b3",
    name: "Projets DIY",
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

let mockItems: Schema["Item"]["type"][] = [
  {
    id: "i1",
    title: "Colisée à Rome",
    url: "https://www.example.com/colisee",
    info: "Visiter le Colisée tôt le matin pour éviter les foules",
    bucketID: "b1",
    categoryID: "c1", // Catégorie Tourisme
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "i2",
    title: "Venise",
    url: "https://www.example.com/venise",
    info: "Penser à réserver un tour en gondole à l'avance",
    bucketID: "b1",
    categoryID: "c1", // Catégorie Tourisme
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "i3",
    title: "Pizza Margherita",
    url: "https://www.example.com/pizza",
    info: "Recette authentique napolitaine",
    bucketID: "b2",
    categoryID: "c2", // Catégorie Gastronomie
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "i4",
    title: "Tiramisu",
    url: "https://www.example.com/tiramisu",
    info: "Dessert italien classique",
    bucketID: "b2",
    categoryID: "c2", // Catégorie Gastronomie
    owner: "current-user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "i5",
    title: "Étagère flottante",
    url: "https://www.example.com/etagere",
    info: "Tutoriel pour fabriquer une étagère en bois",
    bucketID: "b3",
    categoryID: "c3", // Catégorie Bricolage
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
  listItems: async (filter?: { bucketID?: { eq: string }, categoryID?: { eq: string } }) => {
    await new Promise(resolve => setTimeout(resolve, 300));

    let filteredItems = [...mockItems];

    if (filter?.bucketID?.eq) {
      filteredItems = filteredItems.filter(item => item.bucketID === filter.bucketID.eq);
    }

    if (filter?.categoryID?.eq) {
      filteredItems = filteredItems.filter(item => item.categoryID === filter.categoryID.eq);
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