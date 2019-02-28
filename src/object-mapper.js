const flatten   = require('flat');
const unflatten = flatten.unflatten;

const ObjectMapper = class {

  /**
   * Low-level item mapping method
   * @param {object} sourceItem Item to map
   * @param {object} mapping Mapping rules
   * @returns {object} mapped item
   */
  static mapItem(sourceItem, mapping) {
    const flatItem = flatten(sourceItem);

    return unflatten(Object.entries(mapping)
      .map(([targetKey, sourceKey]) => {

        // Mapping without data transformation
        if (!(sourceKey instanceof Array)) {
          return ObjectMapper.findValue(flatItem, sourceKey, targetKey);
        }

        // Array = apply transformation(s) to source data
        // ex: ['data.bien.prix_ttc', value => parseFloat(value), value => value * 1]

        const [itemKey, ...transformations] = sourceKey;

        // Find values with key "itemKey" in object "flatItem"
        const values = Object.values(ObjectMapper.findValue(flatItem, itemKey, targetKey));

        const applyTransformations = (item, source) =>
          transformations.reduce((value, transform) => transform(value, item), source);

        if (targetKey.slice(-2) !== '[]') {

          // We only have 1 source/target value, hence values.pop()
          // ex: location => location: here
          return {[targetKey]: applyTransformations(sourceItem, values.pop())};

        } else {

          // We have an array of values as a source, and we want an array of values as a target
          // ex: images[] => images.0: 0.jpg, images.1: 1.jpg

          // First we apply the transformations to the found values
          const value = values.map(sourceValue => applyTransformations(sourceItem, sourceValue));

          // Then we create the output object with the right keys for unflatten
          // ex: ['a', 'b'] => { [targetKey].0: 'a', [targetKey].1: 'b' }
          return Object.entries(value)
            .map(([index, val]) => ({[targetKey.slice(0, -2) + '.' + index]: val}))
            .reduce((r, n) => Object.assign(r, n), {});

        }


      })
      // We remove empty and null values
      .filter(data => Object.values(data).filter(val => null !== val && '' !== val).length)
      .reduce((r, n) => Object.assign(r, n), {}));
  }

  /**
   * Low-level item property find and replace
   * @param {object} flatItem Flattened item
   * @param {string} sourceKey Name of the key to find
   * @param {string} targetKey New key name
   * @return {object} New item
   */
  static findValue(flatItem, sourceKey, targetKey) {

    // CASE 1: Exact match
    if ('undefined' !== typeof flatItem[sourceKey]) {
      return {[targetKey]: flatItem[sourceKey]};
    }

    let query;

    // CASE 2: Query
    // ex: details.any[name=livingarea].value.value
    query = sourceKey.match(/(.+?)\[([^=]+)=([^\]]+)](.*)/);

    if (query) {

      const [, haystackPath, whereKey, whereValue, needlePath] = query;

      const subset = Object.entries(flatItem)
      // ex: details.any.*.
        .filter(([itemKey]) => itemKey.match(`^${haystackPath}.[0-9]+.`));

      const children = subset
      // ex: details.any.8.name
        .filter(([itemKey]) => itemKey.match(`^${haystackPath}.[0-9]+.${whereKey}$`))
        // ex: livingarea
        .filter(([, itemVal]) => {
          if (typeof itemVal === 'number') {
            return String(itemVal) === whereValue;
          }
          return itemVal === whereValue;
        });

      const result = children.map(([childKey]) => {

        const parent = subset
        // ex: details.any.8.*
          .filter(([entryKey]) => entryKey.startsWith(childKey.slice(0, childKey.lastIndexOf(whereKey))))
          // ex: details.any.8.value.value
          .filter(([entryKey]) => entryKey.endsWith(needlePath))
          .pop();

        return Object.values(parent).pop();

      })
        .reduce((res, next) => res.concat(next), []);

      if (0 === result.length) {
        return {[targetKey]: null};
      }
      // Only one result
      if (1 === result.length) {
        return {[targetKey]: result.pop()};
      }

      return {[targetKey]: result};

    }

    // CASE 5: Object
    query = sourceKey.match(/(.+){}$/);
    if (query) {
      const haystackPath = query[1];

      // find value in flatItem that matches a key that starts with haystackPath
      // ex: haystackPath = brochureTexts
      // return brochureTexts.estate, brohureTexts.text2, ...
      const result = Object.entries(flatItem)
        .filter(([key]) => key.startsWith(haystackPath))
        .reduce((res, [key, value]) => Object.assign(res, ({[key]: value})), {});

      return flatten.unflatten(result);
    }

    // CASE 3: Array
    // ex: avis_client[].Date
    query = sourceKey.match(/(.+)\[](.*)/);

    // CASE 4: Undefined
    if (!query) {
      return {[targetKey]: null};
    }
    const [, haystackPath, needlePath] = query;

    // DEFAULT CASE: Range array
    return Object.entries(flatItem)
    // ex: avis_client.8.Date
      .filter(([key]) => key.match(haystackPath + '\.[0-9]+' + needlePath + '$'))
      .map(([entryKey, val]) => {
        // ex: num = 8
        const [, num] = entryKey.match(haystackPath + '\.([0-9]+)' + needlePath);
        const key     = targetKey.replace('[]', '.' + num);

        return [key, val];
      })
      .reduce((res, [key, val]) => Object.assign(res, {[key]: (res[key] || []).concat([val])}), {});
  }

};

module.exports = ObjectMapper;
