/**
 * Groups the array into a map by an extracted key
 *
 * @param {Array<T>} array array to be grouped
 * @param {keyExtractor<T, K>} keyExtractor key extractor
 * @return {Map<K, Array<T>>} grouped map
 * @template T, K
 */
function groupToMap(array, keyExtractor) {
  return array.reduce((map, arrayElement) => {
    const key = keyExtractor(arrayElement);
    map.get(key)?.push(arrayElement) ?? map.set(key, [arrayElement]);
    return map;
  }, new Map());
}

export default {groupToMap};
