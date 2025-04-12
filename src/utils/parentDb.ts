
// This file is kept for backward compatibility
// It re-exports all functions from the refactored modules

import { 
  fetchParentInfoById,
  createParentInfo,
  saveParentInfo,
  updateParentInfoFields,
  clearParentCache,
  clearAllParentCache
} from './parent';

export {
  fetchParentInfoById,
  createParentInfo,
  saveParentInfo,
  updateParentInfoFields,
  clearParentCache,
  clearAllParentCache
};
