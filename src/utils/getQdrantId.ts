// Note: This file now uses a default export for easier lazy-loading
const QDRANT_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

// This function must now be async
export const getQdrantId = async (mongoId: string) => {
  // Dynamically import uuid
  const { v5: uuidv5 } = await import('uuid');
  return uuidv5(mongoId, QDRANT_NAMESPACE);
}