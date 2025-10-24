import { v5 as uuidv5 } from 'uuid';

const QDRANT_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

export const getQdrantId = (mongoId: string) => {
  return uuidv5(mongoId, QDRANT_NAMESPACE);
}