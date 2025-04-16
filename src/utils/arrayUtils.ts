
/**
 * Group array items by a key returned from the callback
 */
export function groupBy<T>(array: T[], keyFunction: (item: T) => string): Record<string, T[]> {
  return array.reduce((result: Record<string, T[]>, currentItem: T) => {
    const key = keyFunction(currentItem);
    if (!result[key]) {
      result[key] = [];
    }
    result[key].push(currentItem);
    return result;
  }, {});
}

/**
 * Sort an array based on the order of values in a reference array
 */
export function sortByReference<T>(
  array: T[], 
  valueFunction: (item: T) => any, 
  referenceArray: any[]
): T[] {
  return [...array].sort((a, b) => {
    const aValue = valueFunction(a);
    const bValue = valueFunction(b);
    return referenceArray.indexOf(aValue) - referenceArray.indexOf(bValue);
  });
}
