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

  static objectValue(flatItem, sourceKey, targetKey) {

    const [, haystackPath] = sourceKey.match(ObjectMapper.OBJECT_PATTERN);

    // find value in flatItem that matches a key that starts with haystackPath
    // ex: haystackPath = brochureTexts
    // return brochureTexts.estate, brohureTexts.text2, ...
    const result = Object.entries(flatItem)
      .filter(([key]) => key.startsWith(haystackPath))
      .reduce((res, [key, value]) => Object.assign(res, ({[key]: value})), {});

    return flatten.unflatten(result);

  }

  static arrayValue(flatItem, sourceKey, targetKey) {

    const [, haystackPath, needlePath] = sourceKey.match(ObjectMapper.ARRAY_PATTERN);

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
      .reduce((res, [key, val]) => {

        // If it ends with a number, it will be unflattened correctly already
        if (key.match(/\.[0-9]+$/)) {
          return Object.assign(res, {[key]: val});
        }

        // If it doesn't end with a number, push it into a new array
        return Object.assign(res, ({[key]: (res[key] || []).concat(val)}));

      }, {});

  }

  static queryValue(flatItem, sourceKey, targetKey) {

    const [, haystackPath, whereKey, whereValue, needlePath] = sourceKey.match(ObjectMapper.QUERY_PATTERN);

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

    // CASE 2: Query
    // ex: details.any[name=livingarea].value.value
    if (sourceKey.match(ObjectMapper.QUERY_PATTERN)) {
      return ObjectMapper.queryValue(flatItem, sourceKey, targetKey);
    }

    // CASE 3: Object
    if (sourceKey.match(ObjectMapper.OBJECT_PATTERN)) {
      return ObjectMapper.objectValue(flatItem, sourceKey, targetKey);
    }

    // CASE 4: Array
    // ex: avis_client[].Date
    if (sourceKey.match(ObjectMapper.ARRAY_PATTERN)) {
      return ObjectMapper.arrayValue(flatItem, sourceKey, targetKey);
    }

    // CASE 5: Undefined
    return {[targetKey]: null};
  }

};

ObjectMapper.QUERY_PATTERN  = /(.+?)\[([^=]+)=([^\]]+)](.*)/;
ObjectMapper.OBJECT_PATTERN = /(.+){}$/;
ObjectMapper.ARRAY_PATTERN  = /(.+)\[](.*)/;

module.exports = ObjectMapper;
