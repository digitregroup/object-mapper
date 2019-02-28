/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ({

/***/ "./node_modules/flat/index.js":
/*!************************************!*\
  !*** ./node_modules/flat/index.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

var isBuffer = __webpack_require__(/*! is-buffer */ "./node_modules/flat/node_modules/is-buffer/index.js")

module.exports = flatten
flatten.flatten = flatten
flatten.unflatten = unflatten

function flatten (target, opts) {
  opts = opts || {}

  var delimiter = opts.delimiter || '.'
  var maxDepth = opts.maxDepth
  var output = {}

  function step (object, prev, currentDepth) {
    currentDepth = currentDepth || 1
    Object.keys(object).forEach(function (key) {
      var value = object[key]
      var isarray = opts.safe && Array.isArray(value)
      var type = Object.prototype.toString.call(value)
      var isbuffer = isBuffer(value)
      var isobject = (
        type === '[object Object]' ||
        type === '[object Array]'
      )

      var newKey = prev
        ? prev + delimiter + key
        : key

      if (!isarray && !isbuffer && isobject && Object.keys(value).length &&
        (!opts.maxDepth || currentDepth < maxDepth)) {
        return step(value, newKey, currentDepth + 1)
      }

      output[newKey] = value
    })
  }

  step(target)

  return output
}

function unflatten (target, opts) {
  opts = opts || {}

  var delimiter = opts.delimiter || '.'
  var overwrite = opts.overwrite || false
  var result = {}

  var isbuffer = isBuffer(target)
  if (isbuffer || Object.prototype.toString.call(target) !== '[object Object]') {
    return target
  }

  // safely ensure that the key is
  // an integer.
  function getkey (key) {
    var parsedKey = Number(key)

    return (
      isNaN(parsedKey) ||
      key.indexOf('.') !== -1 ||
      opts.object
    ) ? key
      : parsedKey
  }

  var sortedKeys = Object.keys(target).sort(function (keyA, keyB) {
    return keyA.length - keyB.length
  })

  sortedKeys.forEach(function (key) {
    var split = key.split(delimiter)
    var key1 = getkey(split.shift())
    var key2 = getkey(split[0])
    var recipient = result

    while (key2 !== undefined) {
      var type = Object.prototype.toString.call(recipient[key1])
      var isobject = (
        type === '[object Object]' ||
        type === '[object Array]'
      )

      // do not write over falsey, non-undefined values if overwrite is false
      if (!overwrite && !isobject && typeof recipient[key1] !== 'undefined') {
        return
      }

      if ((overwrite && !isobject) || (!overwrite && recipient[key1] == null)) {
        recipient[key1] = (
          typeof key2 === 'number' &&
          !opts.object ? [] : {}
        )
      }

      recipient = recipient[key1]
      if (split.length > 0) {
        key1 = getkey(split.shift())
        key2 = getkey(split[0])
      }
    }

    // unflatten again for 'messy objects'
    recipient[key1] = unflatten(target[key], opts)
  })

  return result
}


/***/ }),

/***/ "./node_modules/flat/node_modules/is-buffer/index.js":
/*!***********************************************************!*\
  !*** ./node_modules/flat/node_modules/is-buffer/index.js ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

module.exports = function isBuffer (obj) {
  return obj != null && obj.constructor != null &&
    typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}


/***/ }),

/***/ "./src/object-mapper.js":
/*!**************************!*\
  !*** ./src/object-mapper.js ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var flatten = __webpack_require__(/*! flat */ "./node_modules/flat/index.js");

var unflatten = flatten.unflatten;

var ObjectMapper =
/*#__PURE__*/
function () {
  function ObjectMapper() {
    _classCallCheck(this, ObjectMapper);
  }

  _createClass(ObjectMapper, null, [{
    key: "mapItem",

    /**
     * Low-level item mapping method
     * @param {object} sourceItem Item to map
     * @param {object} mapping Mapping rules
     * @returns {object} mapped item
     */
    value: function mapItem(sourceItem, mapping) {
      var flatItem = flatten(sourceItem);
      return unflatten(Object.entries(mapping).map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            targetKey = _ref2[0],
            sourceKey = _ref2[1];

        // Mapping without data transformation
        if (!(sourceKey instanceof Array)) {
          return ObjectMapper.findValue(flatItem, sourceKey, targetKey);
        } // Array = apply transformation(s) to source data
        // ex: ['data.bien.prix_ttc', value => parseFloat(value), value => value * 1]


        var _sourceKey = _toArray(sourceKey),
            itemKey = _sourceKey[0],
            transformations = _sourceKey.slice(1); // Find values with key "itemKey" in object "flatItem"


        var values = Object.values(ObjectMapper.findValue(flatItem, itemKey, targetKey));

        var applyTransformations = function applyTransformations(item, source) {
          return transformations.reduce(function (value, transform) {
            return transform(value, item);
          }, source);
        };

        if (targetKey.slice(-2) !== '[]') {
          // We only have 1 source/target value, hence values.pop()
          // ex: location => location: here
          return _defineProperty({}, targetKey, applyTransformations(sourceItem, values.pop()));
        } else {
          // We have an array of values as a source, and we want an array of values as a target
          // ex: images[] => images.0: 0.jpg, images.1: 1.jpg
          // First we apply the transformations to the found values
          var value = values.map(function (sourceValue) {
            return applyTransformations(sourceItem, sourceValue);
          }); // Then we create the output object with the right keys for unflatten
          // ex: ['a', 'b'] => { [targetKey].0: 'a', [targetKey].1: 'b' }

          return Object.entries(value).map(function (_ref4) {
            var _ref5 = _slicedToArray(_ref4, 2),
                index = _ref5[0],
                val = _ref5[1];

            return _defineProperty({}, targetKey.slice(0, -2) + '.' + index, val);
          }).reduce(function (r, n) {
            return Object.assign(r, n);
          }, {});
        }
      }) // We remove empty and null values
      .filter(function (data) {
        return Object.values(data).filter(function (val) {
          return null !== val && '' !== val;
        }).length;
      }).reduce(function (r, n) {
        return Object.assign(r, n);
      }, {}));
    }
    /**
     * Low-level item property find and replace
     * @param {object} flatItem Flattened item
     * @param {string} sourceKey Name of the key to find
     * @param {string} targetKey New key name
     * @return {object} New item
     */

  }, {
    key: "findValue",
    value: function findValue(flatItem, sourceKey, targetKey) {
      // CASE 1: Exact match
      if ('undefined' !== typeof flatItem[sourceKey]) {
        return _defineProperty({}, targetKey, flatItem[sourceKey]);
      }

      var query; // CASE 2: Query
      // ex: details.any[name=livingarea].value.value

      query = sourceKey.match(/(.+?)\[([^=]+)=([^\]]+)](.*)/);

      if (query) {
        var _query = query,
            _query2 = _slicedToArray(_query, 5),
            _keyToFind = _query2[1],
            matchKey = _query2[2],
            matchValue = _query2[3],
            _resultKey = _query2[4];

        var subset = Object.entries(flatItem) // ex: details.any.*.
        .filter(function (_ref8) {
          var _ref9 = _slicedToArray(_ref8, 1),
              itemKey = _ref9[0];

          return itemKey.match("^".concat(_keyToFind, ".[0-9]+."));
        });
        var children = subset // ex: details.any.8.name
        .filter(function (_ref10) {
          var _ref11 = _slicedToArray(_ref10, 1),
              itemKey = _ref11[0];

          return itemKey.match("^".concat(_keyToFind, ".[0-9]+.").concat(matchKey, "$"));
        }) // ex: livingarea
        .filter(function (_ref12) {
          var _ref13 = _slicedToArray(_ref12, 2),
              itemVal = _ref13[1];

          return itemVal === matchValue;
        });
        var result = children.map(function (_ref14) {
          var _ref15 = _slicedToArray(_ref14, 1),
              childKey = _ref15[0];

          var parent = subset // ex: details.any.8.*
          .filter(function (_ref16) {
            var _ref17 = _slicedToArray(_ref16, 1),
                entryKey = _ref17[0];

            return entryKey.startsWith(childKey.slice(0, childKey.lastIndexOf(matchKey)));
          }) // ex: details.any.8.value.value
          .filter(function (_ref18) {
            var _ref19 = _slicedToArray(_ref18, 1),
                entryKey = _ref19[0];

            return entryKey.endsWith(_resultKey);
          }).pop();
          return Object.values(parent).pop();
        }).reduce(function (res, next) {
          return res.concat(next);
        }, []);
        if (0 === result.length) return _defineProperty({}, targetKey, null);
        if (1 === result.length) return _defineProperty({}, targetKey, result.pop());
        return _defineProperty({}, targetKey, result);
      } // CASE 5: Object


      query = sourceKey.match(/(.+){}$/);

      if (query) {
        var _keyToFind2 = query[1]; // find value in flatItem that matches a key that starts with keyToFind
        // ex: keyToFind = brochureTexts
        // return brochureTexts.estate, brohureTexts.text2, ...

        var _result = Object.entries(flatItem).filter(function (_ref23) {
          var _ref24 = _slicedToArray(_ref23, 1),
              key = _ref24[0];

          return key.startsWith(_keyToFind2);
        }).reduce(function (res, _ref25) {
          var _ref26 = _slicedToArray(_ref25, 2),
              key = _ref26[0],
              value = _ref26[1];

          return Object.assign(res, _defineProperty({}, key, value));
        }, {});

        return flatten.unflatten(_result);
      } // CASE 3: Array
      // ex: avis_client[].Date


      query = sourceKey.match(/(.+)\[](.*)/); // CASE 4: Undefined

      if (!query) {
        return _defineProperty({}, targetKey, null);
      }

      var _query3 = query,
          _query4 = _slicedToArray(_query3, 3),
          keyToFind = _query4[1],
          resultKey = _query4[2]; // DEFAULT CASE: Range array


      return Object.entries(flatItem) // ex: avis_client.8.Date
      .filter(function (_ref28) {
        var _ref29 = _slicedToArray(_ref28, 1),
            key = _ref29[0];

        return key.match(keyToFind + '\.[0-9]+' + resultKey + '$');
      }).map(function (_ref30) {
        var _ref31 = _slicedToArray(_ref30, 2),
            entryKey = _ref31[0],
            val = _ref31[1];

        // ex: num = 8
        var _entryKey$match = entryKey.match(keyToFind + '\.([0-9]+)' + resultKey),
            _entryKey$match2 = _slicedToArray(_entryKey$match, 2),
            num = _entryKey$match2[1];

        var key = targetKey.replace('[]', '.' + num);
        return [key, val];
      }).reduce(function (res, _ref32) {
        var _ref33 = _slicedToArray(_ref32, 2),
            key = _ref33[0],
            val = _ref33[1];

        return Object.assign(res, _defineProperty({}, key, (res[key] || []).concat([val])));
      }, {});
    }
  }]);

  return ObjectMapper;
}();

module.exports = ObjectMapper;

/***/ }),

/***/ 0:
/*!********************************!*\
  !*** multi ./src/object-mapper.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! C:\Users\julien.bouisset\dev\object-mapper\src\object-mapper.js */"./src/object-mapper.js");


/***/ })

/******/ });
