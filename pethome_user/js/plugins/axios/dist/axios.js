// axios v0.35.0 Copyright (c) 2026 Matt Zabriskie
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.axios = factory());
})(this, (function () { 'use strict';

  var bind = function bind(fn, thisArg) {
    return function wrap() {
      return fn.apply(thisArg, arguments);
    };
  };

  // utils is a library of generic helper functions non-specific to axios

  var toString = Object.prototype.toString;

  // eslint-disable-next-line func-names
  var kindOf = (function(cache) {
    // eslint-disable-next-line func-names
    return function(thing) {
      var str = toString.call(thing);
      return cache[str] || (cache[str] = str.slice(8, -1).toLowerCase());
    };
  })(Object.create(null));

  function kindOfTest(type) {
    type = type.toLowerCase();
    return function isKindOf(thing) {
      return kindOf(thing) === type;
    };
  }

  /**
   * Determine if a value is an Array
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Array, otherwise false
   */
  function isArray(val) {
    return Array.isArray(val);
  }

  /**
   * Determine if a value is undefined
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if the value is undefined, otherwise false
   */
  function isUndefined(val) {
    return typeof val === 'undefined';
  }

  /**
   * Determine if a value is a Buffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Buffer, otherwise false
   */
  function isBuffer(val) {
    return (
      val !== null &&
      !isUndefined(val) &&
      val.constructor !== null &&
      !isUndefined(val.constructor) &&
      typeof val.constructor.isBuffer === 'function' &&
      val.constructor.isBuffer(val)
    );
  }

  /**
   * Determine if a value is an ArrayBuffer
   *
   * @function
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an ArrayBuffer, otherwise false
   */
  var isArrayBuffer = kindOfTest('ArrayBuffer');

  /**
   * Determine if a value is a view on an ArrayBuffer
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
   */
  function isArrayBufferView(val) {
    var result;
    if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView) {
      result = ArrayBuffer.isView(val);
    } else {
      result = val && val.buffer && isArrayBuffer(val.buffer);
    }
    return result;
  }

  /**
   * Determine if a value is a String
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a String, otherwise false
   */
  function isString(val) {
    return typeof val === 'string';
  }

  /**
   * Determine if a value is a Number
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Number, otherwise false
   */
  function isNumber(val) {
    return typeof val === 'number';
  }

  /**
   * Determine if a value is an Object
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is an Object, otherwise false
   */
  function isObject(val) {
    return val !== null && typeof val === 'object';
  }

  /**
   * Determine if a value is a plain Object
   *
   * @param {Object} val The value to test
   * @return {boolean} True if value is a plain Object, otherwise false
   */
  function isPlainObject(val) {
    if (kindOf(val) !== 'object') {
      return false;
    }

    var prototype = Object.getPrototypeOf(val);
    return prototype === null || prototype === Object.prototype;
  }

  /**
   * Determine if a value is a empty Object
   *
   * @param {Object} val The value to test
   * @return {boolean} True if value is a empty Object, otherwise false
   */
  function isEmptyObject(val) {
    if (!isPlainObject(val)) {
      return false;
    }
    for (var key in val) {
      if (Object.prototype.hasOwnProperty.call(val, key)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Determine if a value is a Date
   *
   * @function
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Date, otherwise false
   */
  var isDate = kindOfTest('Date');

  /**
   * Determine if a value is a File
   *
   * @function
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a File, otherwise false
   */
  var isFile = kindOfTest('File');

  /**
   * Determine if a value is a Blob
   *
   * @function
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Blob, otherwise false
   */
  var isBlob = kindOfTest('Blob');

  /**
   * Determine if a value is a FileList
   *
   * @function
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a File, otherwise false
   */
  var isFileList = kindOfTest('FileList');

  /**
   * Determine if a value is a Function
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Function, otherwise false
   */
  function isFunction(val) {
    return toString.call(val) === '[object Function]';
  }

  /**
   * Determine if a value is a Stream
   *
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a Stream, otherwise false
   */
  function isStream(val) {
    return isObject(val) && isFunction(val.pipe);
  }

  /**
   * Determine if a value is a FormData
   *
   * @param {Object} thing The value to test
   * @returns {boolean} True if value is an FormData, otherwise false
   */
  function isFormData(thing) {
    var pattern = '[object FormData]';
    if (!thing) return false;
    if (typeof FormData === 'function' && thing instanceof FormData) return true;
    // Reject non-objects (strings, numbers, booleans) up front — Object.getPrototypeOf
    // throws a TypeError on primitives in ES5 environments.
    if (!isObject(thing)) return false;
    // Reject plain objects inheriting directly from Object.prototype so prototype-pollution gadgets can't spoof FormData.
    var proto = Object.getPrototypeOf(thing);
    if (!proto || proto === Object.prototype) return false;
    if (!isFunction(thing.append)) return false;
    return (
      toString.call(thing) === pattern ||
      (isFunction(thing.toString) && thing.toString() === pattern)
    );
  }

  /**
   * Determine if a value is a URLSearchParams object
   * @function
   * @param {Object} val The value to test
   * @returns {boolean} True if value is a URLSearchParams object, otherwise false
   */
  var isURLSearchParams = kindOfTest('URLSearchParams');

  /**
   * Trim excess whitespace off the beginning and end of a string
   *
   * @param {String} str The String to trim
   * @returns {String} The String freed of excess whitespace
   */
  function trim(str) {
    return str.trim
      ? str.trim()
      : str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  }

  /**
   * Determine if we're running in a standard browser environment
   *
   * This allows axios to run in a web worker, and react-native.
   * Both environments support XMLHttpRequest, but not fully standard globals.
   *
   * web workers:
   *  typeof window -> undefined
   *  typeof document -> undefined
   *
   * react-native:
   *  navigator.product -> 'ReactNative'
   * nativescript
   *  navigator.product -> 'NativeScript' or 'NS'
   */
  function isStandardBrowserEnv() {
    var product;
    if (
      typeof navigator !== 'undefined' &&
      ((product = navigator.product) === 'ReactNative' ||
        product === 'NativeScript' ||
        product === 'NS')
    ) {
      return false;
    }

    return typeof window !== 'undefined' && typeof document !== 'undefined';
  }

  /**
   * Iterate over an Array or an Object invoking a function for each item.
   *
   * If `obj` is an Array callback will be called passing
   * the value, index, and complete array for each item.
   *
   * If 'obj' is an Object callback will be called passing
   * the value, key, and complete object for each property.
   *
   * @param {Object|Array} obj The object to iterate
   * @param {Function} fn The callback to invoke for each item
   */
  function forEach(obj, fn) {
    // Don't bother if no value provided
    if (obj === null || typeof obj === 'undefined') {
      return;
    }

    // Force an array if not already something iterable
    if (typeof obj !== 'object') {
      /*eslint no-param-reassign:0*/
      obj = [obj];
    }

    if (isArray(obj)) {
      // Iterate over array values
      for (var i = 0, l = obj.length; i < l; i++) {
        fn.call(null, obj[i], i, obj);
      }
    } else {
      // Iterate over object keys
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          fn.call(null, obj[key], key, obj);
        }
      }
    }
  }

  /**
   * Accepts varargs expecting each argument to be an object, then
   * immutably merges the properties of each object and returns result.
   *
   * When multiple objects contain the same key the later object in
   * the arguments list will take precedence.
   *
   * Example:
   *
   * ```js
   * var result = merge({foo: 123}, {foo: 456});
   * console.log(result.foo); // outputs 456
   * ```
   *
   * @param {Object} obj1 Object to merge
   * @returns {Object} Result of all merge properties
   */
  function merge(/* obj1, obj2, obj3, ... */) {
    var result = Object.create(null);
    function assignValue(val, key) {
      var target;

      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        return;
      }

      target = Object.prototype.hasOwnProperty.call(result, key)
        ? result[key]
        : undefined;

      if (isPlainObject(target) && isPlainObject(val)) {
        result[key] = merge(target, val);
      } else if (isPlainObject(val)) {
        result[key] = merge({}, val);
      } else if (isArray(val)) {
        result[key] = val.slice();
      } else {
        result[key] = val;
      }
    }

    for (var i = 0, l = arguments.length; i < l; i++) {
      forEach(arguments[i], assignValue);
    }
    return result;
  }

  /**
   * Extends object a by mutably adding to it the properties of object b.
   *
   * @param {Object} a The object to be extended
   * @param {Object} b The object to copy properties from
   * @param {Object} thisArg The object to bind function to
   * @return {Object} The resulting value of object a
   */
  function extend(a, b, thisArg) {
    forEach(b, function assignValue(val, key) {
      if (thisArg && typeof val === 'function') {
        a[key] = bind(val, thisArg);
      } else {
        a[key] = val;
      }
    });
    return a;
  }

  /**
   * Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
   *
   * @param {string} content with BOM
   * @return {string} content value without BOM
   */
  function stripBOM(content) {
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }
    return content;
  }

  function defineOwnProperty(target, key, value) {
    var descriptor = Object.create(null);
    descriptor.value = value;
    descriptor.writable = true;
    descriptor.enumerable = true;
    descriptor.configurable = true;
    Object.defineProperty(target, key, descriptor);
  }

  /**
   * Inherit the prototype methods from one constructor into another
   * @param {function} constructor
   * @param {function} superConstructor
   * @param {object} [props]
   * @param {object} [descriptors]
   */
  function inherits(constructor, superConstructor, props, descriptors) {
    constructor.prototype = Object.create(
      superConstructor.prototype,
      descriptors
    );
    if (Object.prototype.hasOwnProperty.call(constructor.prototype, 'constructor')) {
      constructor.prototype.constructor = constructor;
    } else {
      defineOwnProperty(constructor.prototype, 'constructor', constructor);
    }

    if (props) {
      var keys = Object.keys(props);
      if (Object.getOwnPropertySymbols) {
        keys = keys.concat(Object.getOwnPropertySymbols(props).filter(function(key) {
          return Object.prototype.propertyIsEnumerable.call(props, key);
        }));
      }
      keys.forEach(function(key) {
        var value = props[key];
        if (Object.prototype.hasOwnProperty.call(constructor.prototype, key)) {
          constructor.prototype[key] = value;
        } else {
          // Assignment would invoke an inherited setter or fail on a read-only
          // property installed by another library, such as Error.prototype.toJSON.
          defineOwnProperty(constructor.prototype, key, value);
        }
      });
    }
  }

  /**
   * Resolve object with deep prototype chain to a flat object
   * @param {Object} sourceObj source object
   * @param {Object} [destObj]
   * @param {Function|Boolean} [filter]
   * @param {Function} [propFilter]
   * @returns {Object}
   */

  function toFlatObject(sourceObj, destObj, filter, propFilter) {
    var props;
    var i;
    var prop;
    var merged = {};

    destObj = destObj || {};
    // eslint-disable-next-line no-eq-null,eqeqeq
    if (sourceObj == null) return destObj;

    do {
      props = Object.getOwnPropertyNames(sourceObj);
      i = props.length;
      while (i-- > 0) {
        prop = props[i];
        if (
          (!propFilter || propFilter(prop, sourceObj, destObj)) &&
          !merged[prop]
        ) {
          destObj[prop] = sourceObj[prop];
          merged[prop] = true;
        }
      }
      sourceObj = filter !== false && Object.getPrototypeOf(sourceObj);
    } while (
      sourceObj &&
      (!filter || filter(sourceObj, destObj)) &&
      sourceObj !== Object.prototype
    );

    return destObj;
  }

  /*
   * determines whether a string ends with the characters of a specified string
   * @param {String} str
   * @param {String} searchString
   * @param {Number} [position= 0]
   * @returns {boolean}
   */
  function endsWith(str, searchString, position) {
    str = String(str);
    if (position === undefined || position > str.length) {
      position = str.length;
    }
    position -= searchString.length;
    var lastIndex = str.indexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
  }

  /**
   * Returns new array from array like object or null if failed
   * @param {*} [thing]
   * @returns {?Array}
   */
  function toArray(thing) {
    if (!thing) return null;
    if (isArray(thing)) return thing;
    var i = thing.length;
    if (typeof i !== 'number' || i < 0 || i > 0xffffffff || Math.floor(i) !== i) return null;

    // Legacy FileList hosts expose indexed reads without reflecting their keys.
    if (isFileList(thing)) {
      var files = [];
      while (i-- > 0) {
        var file = thing[i];
        if (file === null || isUndefined(file)) return null;
        defineOwnProperty(files, i, file);
      }
      return files;
    }

    // Count actual indexes, including hidden collection properties, before
    // allocating from the declared length. Box primitives for ES5 object APIs.
    var source = Object(thing);
    var indexes = Object.create(null);
    var count = 0;
    var seen = [];
    var owns = Object.prototype.hasOwnProperty;

    while (source && count < i) {
      if (seen.indexOf(source) !== -1) return null;
      defineOwnProperty(seen, seen.length, source);

      if (source === Object.prototype) break;

      var prototype = Object.getPrototypeOf(source);
      if (prototype === null) {
        var constructorDescriptor = Object.getOwnPropertyDescriptor(source, 'constructor');
        var constructorValue = constructorDescriptor && owns.call(constructorDescriptor, 'value') &&
          constructorDescriptor.value;
        var constructorPrototype = typeof constructorValue === 'function' &&
          Object.getOwnPropertyDescriptor(constructorValue, 'prototype');

        // Recognize another realm's Object.prototype without excluding
        // application-defined null-prototype parents or invoking accessors.
        if (
          constructorPrototype && owns.call(constructorPrototype, 'value') &&
          constructorPrototype.value === source &&
          Function.prototype.toString.call(constructorValue) === Function.prototype.toString.call(Object)
        ) {
          break;
        }
      }

      var keys = Object.getOwnPropertyNames(source);
      for (var j = 0; j < keys.length; j++) {
        var key = keys[j];
        var index = +key;
        if (
          index >= 0 &&
          index < i &&
          Math.floor(index) === index &&
          String(index) === key &&
          owns.call(source, key) &&
          !indexes[key]
        ) {
          indexes[key] = true;
          count++;
        }
      }
      source = prototype;
    }

    if (count !== i) return null;
    var arr = new Array(i);
    while (i-- > 0) {
      defineOwnProperty(arr, i, thing[i]);
    }
    return arr;
  }

  // eslint-disable-next-line func-names
  var isTypedArray = (function(TypedArray) {
    // eslint-disable-next-line func-names
    return function(thing) {
      return TypedArray && thing instanceof TypedArray;
    };
  })(typeof Uint8Array !== 'undefined' && Object.getPrototypeOf(Uint8Array));

  function forEachEntry(obj, fn) {
    var generator = obj && obj[Symbol.iterator];

    var iterator = generator.call(obj);

    var result;

    while ((result = iterator.next()) && !result.done) {
      var pair = result.value;
      fn.call(obj, pair[0], pair[1]);
    }
  }

  function matchAll(regExp, str) {
    var matches;
    var arr = [];

    while ((matches = regExp.exec(str)) !== null) {
      arr.push(matches);
    }

    return arr;
  }

  var isHTMLForm = kindOfTest('HTMLFormElement');

  var hasOwnProperty = (function resolver(_hasOwnProperty) {
    return function(obj, prop) {
      return _hasOwnProperty.call(obj, prop);
    };
  })(Object.prototype.hasOwnProperty);

  var utils = {
    isArray: isArray,
    isArrayBuffer: isArrayBuffer,
    isBuffer: isBuffer,
    isFormData: isFormData,
    isArrayBufferView: isArrayBufferView,
    isString: isString,
    isNumber: isNumber,
    isObject: isObject,
    isPlainObject: isPlainObject,
    isEmptyObject: isEmptyObject,
    isUndefined: isUndefined,
    isDate: isDate,
    isFile: isFile,
    isBlob: isBlob,
    isFunction: isFunction,
    isStream: isStream,
    isURLSearchParams: isURLSearchParams,
    isStandardBrowserEnv: isStandardBrowserEnv,
    forEach: forEach,
    merge: merge,
    extend: extend,
    trim: trim,
    stripBOM: stripBOM,
    inherits: inherits,
    defineOwnProperty: defineOwnProperty,
    toFlatObject: toFlatObject,
    kindOf: kindOf,
    kindOfTest: kindOfTest,
    endsWith: endsWith,
    toArray: toArray,
    isTypedArray: isTypedArray,
    isFileList: isFileList,
    forEachEntry: forEachEntry,
    matchAll: matchAll,
    isHTMLForm: isHTMLForm,
    hasOwnProperty: hasOwnProperty
  };

  var defaultRedactKeys = ['authorization', 'proxy-authorization', 'cookie', 'set-cookie', 'x-api-key', 'password'];

  var REDACTED_VALUE = '[REDACTED ****]';

  function makeValueDescriptor(value) {
    var descriptor = Object.create(null);
    descriptor.value = value;
    return descriptor;
  }

  function getRedactKeys(config) {
    // An empty array is treated as "no override" so an upstream `redact: []` cannot
    // silently disable redaction. To opt out, pass non-string values or unset keys.
    var override = config && utils.isArray(config.redact) && config.redact.length ? config.redact : null;
    var redact = override || defaultRedactKeys;
    var keys = {};

    utils.forEach(redact, function eachRedactKey(key) {
      if (typeof key === 'string') {
        keys[key.toLowerCase()] = true;
      }
    });

    return keys;
  }

  function shouldRedact(key, keys) {
    return typeof key === 'string' && keys[key.toLowerCase()];
  }

  var CIRCULAR_VALUE = '[Circular]';

  function serializeConfigValue(value, keys, key, seen) {
    var result;

    if (shouldRedact(key, keys)) {
      return REDACTED_VALUE;
    }

    if (utils.isArray(value)) {
      if (seen.indexOf(value) !== -1) {
        return CIRCULAR_VALUE;
      }
      seen.push(value);
      result = [];
      utils.forEach(value, function eachArrayValue(item, index) {
        result[index] = serializeConfigValue(item, keys, index, seen);
      });
      seen.pop();
      return result;
    }

    if (utils.isPlainObject(value)) {
      if (seen.indexOf(value) !== -1) {
        return CIRCULAR_VALUE;
      }
      seen.push(value);
      result = {};
      utils.forEach(value, function eachObjectValue(item, itemKey) {
        result[itemKey] = serializeConfigValue(item, keys, itemKey, seen);
      });
      seen.pop();
      return result;
    }

    return value;
  }

  function serializeConfig(config) {
    if (!config) {
      return config;
    }

    return serializeConfigValue(config, getRedactKeys(config), undefined, []);
  }

  /**
   * Create an Error with the specified message, config, error code, request and response.
   *
   * @param {string} message The error message.
   * @param {string} [code] The error code (for example, 'ECONNABORTED').
   * @param {Object} [config] The config.
   * @param {Object} [request] The request.
   * @param {Object} [response] The response.
   * @returns {Error} The created error.
   */
  function AxiosError(message, code, config, request, response) {
    Error.call(this);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = (new Error()).stack;
    }

    this.message = message;
    this.name = 'AxiosError';
    code && (this.code = code);
    config && (this.config = config);
    request && (this.request = request);
    response && (this.response = response);
  }

  utils.inherits(AxiosError, Error, {
    toJSON: function toJSON() {
      return {
        // Standard
        message: this.message,
        name: this.name,
        // Microsoft
        description: this.description,
        number: this.number,
        // Mozilla
        fileName: this.fileName,
        lineNumber: this.lineNumber,
        columnNumber: this.columnNumber,
        stack: this.stack,
        // Axios
        config: serializeConfig(this.config),
        code: this.code,
        status: this.response && this.response.status ? this.response.status : null
      };
    }
  });

  var prototype$1 = AxiosError.prototype;
  var descriptors = Object.create(null);

  [
    'ERR_BAD_OPTION_VALUE',
    'ERR_BAD_OPTION',
    'ECONNABORTED',
    'ETIMEDOUT',
    'ERR_NETWORK',
    'ERR_FR_TOO_MANY_REDIRECTS',
    'ERR_DEPRECATED',
    'ERR_BAD_RESPONSE',
    'ERR_BAD_REQUEST',
    'ERR_CANCELED',
    'ERR_NOT_SUPPORT',
    'ERR_INVALID_URL',
    'ERR_FORM_DATA_DEPTH_EXCEEDED'
  // eslint-disable-next-line func-names
  ].forEach(function(code) {
    descriptors[code] = makeValueDescriptor(code);
  });

  Object.defineProperties(AxiosError, descriptors);
  Object.defineProperty(prototype$1, 'isAxiosError', makeValueDescriptor(true));

  // eslint-disable-next-line func-names
  AxiosError.from = function(error, code, config, request, response, customProps) {
    var axiosError = Object.create(prototype$1);

    utils.toFlatObject(error, axiosError, function filter(obj) {
      return obj !== Error.prototype;
    });

    AxiosError.call(axiosError, error.message, code, config, request, response);

    axiosError.cause = error;

    axiosError.name = error.name;

    customProps && Object.assign(axiosError, customProps);

    return axiosError;
  };

  var AxiosError_1 = AxiosError;

  /* eslint-env browser */
  var browser$1 = typeof self === 'object' ? self.FormData : window.FormData;

  // eslint-disable-next-line strict
  var FormData$1 = browser$1;

  function isVisitable(thing) {
    return utils.isPlainObject(thing) || utils.isArray(thing);
  }

  function removeBrackets(key) {
    return utils.endsWith(key, '[]') ? key.slice(0, -2) : key;
  }

  function renderKey(path, key, dots) {
    if (!path) return key;
    return path.concat(key).map(function each(token, i) {
      // eslint-disable-next-line no-param-reassign
      token = removeBrackets(token);
      return !dots && i ? '[' + token + ']' : token;
    }).join(dots ? '.' : '');
  }

  function isFlatArray(arr) {
    return utils.isArray(arr) && !arr.some(isVisitable);
  }

  var predicates = utils.toFlatObject(utils, {}, null, function filter(prop) {
    return /^is[A-Z]/.test(prop);
  });

  function isSpecCompliant(thing) {
    return thing && utils.isFunction(thing.append) && thing[Symbol.toStringTag] === 'FormData' && thing[Symbol.iterator];
  }

  var UNSAFE_OPTION_KEYS = ['__proto__', 'constructor', 'prototype'];

  // Materialises the serializer options onto a null-prototype object. Reading the
  // options from a plain object let a polluted Object.prototype supply a visitor,
  // a depth limit, a Blob implementation or key-format flags that the caller never
  // asked for, and also let a polluted key mask an option the caller did set.
  // Only own, defined properties of the caller's options are carried over.
  function toFormDataOptions(source) {
    var options = Object.create(null);

    options.metaTokens = true;
    options.dots = false;
    options.indexes = false;

    // eslint-disable-next-line no-eq-null,eqeqeq
    if (source == null) {
      return options;
    }

    var names = Object.getOwnPropertyNames(source);

    for (var i = 0; i < names.length; i++) {
      var name = names[i];

      if (UNSAFE_OPTION_KEYS.indexOf(name) !== -1 || utils.isUndefined(source[name])) {
        continue;
      }

      options[name] = source[name];
    }

    return options;
  }

  /**
   * Convert a data object to FormData
   * @param {Object} obj
   * @param {?Object} [formData]
   * @param {?Object} [options]
   * @param {Function} [options.visitor]
   * @param {Boolean} [options.metaTokens = true]
   * @param {Boolean} [options.dots = false]
   * @param {?Boolean} [options.indexes = false]
   * @returns {Object}
   **/

  function toFormData(obj, formData, options) {
    if (!utils.isObject(obj)) {
      throw new TypeError('target must be an object');
    }

    // eslint-disable-next-line no-param-reassign
    formData = formData || new (FormData$1 || FormData)();

    // eslint-disable-next-line no-param-reassign
    options = toFormDataOptions(options);

    var metaTokens = options.metaTokens;
    // eslint-disable-next-line no-use-before-define
    var visitor = options.visitor || defaultVisitor;
    var dots = options.dots;
    var indexes = options.indexes;
    var _Blob = options.Blob || typeof Blob !== 'undefined' && Blob;
    var maxDepth = options.maxDepth === undefined ? 100 : options.maxDepth;
    var useBlob = _Blob && isSpecCompliant(formData);

    if (!utils.isFunction(visitor)) {
      throw new TypeError('visitor must be a function');
    }

    function convertValue(value) {
      if (value === null) return '';

      if (utils.isDate(value)) {
        return value.toISOString();
      }

      if (!useBlob && utils.isBlob(value)) {
        throw new AxiosError_1('Blob is not supported. Use a Buffer instead.');
      }

      if (utils.isArrayBuffer(value) || utils.isTypedArray(value)) {
        return useBlob && typeof Blob === 'function' ? new Blob([value]) : Buffer.from(value);
      }

      return value;
    }

    var stack = [];

    function assertValueDepth(value, depth) {
      if (depth > maxDepth) {
        throw new AxiosError_1(
          'Maximum object depth of ' + maxDepth + ' exceeded (got ' + depth + ' levels)',
          AxiosError_1.ERR_FORM_DATA_DEPTH_EXCEEDED
        );
      }

      if (!utils.isObject(value) || stack.indexOf(value) !== -1) {
        return;
      }

      utils.defineOwnProperty(stack, stack.length, value);

      utils.forEach(value, function each(el) {
        assertValueDepth(el, depth + 1);
      });

      stack.pop();
    }

    /**
     *
     * @param {*} value
     * @param {String|Number} key
     * @param {Array<String|Number>} path
     * @this {FormData}
     * @returns {boolean} return true to visit the each prop of the value recursively
     */
    function defaultVisitor(value, key, path) {
      var arr = value;

      if (value && !path && typeof value === 'object') {
        if (utils.endsWith(key, '{}')) {
          // eslint-disable-next-line no-param-reassign
          key = metaTokens ? key : key.slice(0, -2);
          assertValueDepth(value, 1);
          // eslint-disable-next-line no-param-reassign
          value = JSON.stringify(value);
        } else if (
          (utils.isArray(value) && isFlatArray(value)) ||
          ((utils.isFileList(value) || utils.endsWith(key, '[]')) && (arr = utils.toArray(value)))
        ) {
          // eslint-disable-next-line no-param-reassign
          key = removeBrackets(key);

          arr.forEach(function each(el, index) {
            !(utils.isUndefined(el) || el === null) && formData.append(
              // eslint-disable-next-line no-nested-ternary
              indexes === true ? renderKey([key], index, dots) : (indexes === null ? key : key + '[]'),
              convertValue(el)
            );
          });
          return false;
        }
      }

      if (isVisitable(value)) {
        return true;
      }

      formData.append(renderKey(path, key, dots), convertValue(value));

      return false;
    }

    var exposedHelpers = Object.assign(predicates, {
      defaultVisitor: defaultVisitor,
      convertValue: convertValue,
      isVisitable: isVisitable
    });

    function build(value, path, depth) {
      if (utils.isUndefined(value)) return;

      // eslint-disable-next-line no-param-reassign
      depth = depth || 0;

      if (depth > maxDepth) {
        throw new AxiosError_1(
          'Maximum object depth of ' + maxDepth + ' exceeded (got ' + depth + ' levels)',
          AxiosError_1.ERR_FORM_DATA_DEPTH_EXCEEDED
        );
      }

      if (stack.indexOf(value) !== -1) {
        throw Error('Circular reference detected in ' + path.join('.'));
      }

      utils.defineOwnProperty(stack, stack.length, value);

      utils.forEach(value, function each(el, key) {
        var result = !(utils.isUndefined(el) || el === null) && visitor.call(
          formData, el, utils.isString(key) ? key.trim() : key, path, exposedHelpers
        );

        if (result === true) {
          build(el, path ? path.concat(key) : [key], depth + 1);
        }
      });

      stack.pop();
    }

    if (!utils.isObject(obj)) {
      throw new TypeError('data must be an object');
    }

    build(obj, null, 0);

    return formData;
  }

  var toFormData_1 = toFormData;

  function encode$1(str) {
    // Do not map `%00` back to a raw null byte: that reversed
    // the safe percent-encoding from encodeURIComponent and enabled null byte injection.
    var charMap = {
      '!': '%21',
      "'": '%27',
      '(': '%28',
      ')': '%29',
      '~': '%7E',
      '%20': '+'
    };
    return encodeURIComponent(str).replace(
      /[!'\(\)~]|%20/g,
      function replacer(match) {
        return charMap[match];
      }
    );
  }

  function AxiosURLSearchParams(params, options) {
    this._pairs = [];

    params && toFormData_1(params, this, options);
  }

  var prototype = AxiosURLSearchParams.prototype;

  prototype.append = function append(name, value) {
    this._pairs.push([name, value]);
  };

  prototype.toString = function toString(encoder) {
    var _encode = encoder
      ? function(value) {
        return encoder.call(this, value, encode$1);
      }
      : encode$1;

    return this._pairs
      .map(function each(pair) {
        return _encode(pair[0]) + '=' + _encode(pair[1]);
      }, '')
      .join('&');
  };

  var AxiosURLSearchParams_1 = AxiosURLSearchParams;

  function encode(val) {
    return encodeURIComponent(val).
      replace(/%3A/gi, ':').
      replace(/%24/g, '$').
      replace(/%2C/gi, ',').
      replace(/%20/g, '+').
      replace(/%5B/gi, '[').
      replace(/%5D/gi, ']');
  }

  /**
   * Build a URL by appending params to the end
   *
   * @param {string} url The base of the url (e.g., http://www.google.com)
   * @param {object} [params] The params to be appended
   * @param {?object} options
   * @returns {string} The formatted url
   */
  var buildURL = function buildURL(url, params, options) {
    /*eslint no-param-reassign:0*/
    if (!params) {
      return url;
    }

    var hashmarkIndex = url.indexOf('#');

    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    var _encode = encode;
    var serializeFn;

    if (options) {
      if (utils.isFunction(options)) {
        serializeFn = options;
      } else {
        _encode = utils.hasOwnProperty(options, 'encode') && options.encode || encode;
        serializeFn = utils.hasOwnProperty(options, 'serialize') ? options.serialize : undefined;
      }
    }

    var serializedParams;

    if (serializeFn) {
      serializedParams = serializeFn(params, options);
    } else {
      serializedParams = utils.isURLSearchParams(params) ?
        params.toString() :
        new AxiosURLSearchParams_1(params, options).toString(_encode);
    }

    if (serializedParams) {
      url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
    }

    return url;
  };

  function InterceptorManager() {
    this.handlers = [];
  }

  /**
   * Add a new interceptor to the stack
   *
   * @param {Function} fulfilled The function to handle `then` for a `Promise`
   * @param {Function} rejected The function to handle `reject` for a `Promise`
   *
   * @return {Number} An ID used to remove interceptor later
   */
  InterceptorManager.prototype.use = function use(fulfilled, rejected, options) {
    this.handlers.push({
      fulfilled: fulfilled,
      rejected: rejected,
      synchronous: options ? options.synchronous : false,
      runWhen: options ? options.runWhen : null
    });
    return this.handlers.length - 1;
  };

  /**
   * Remove an interceptor from the stack
   *
   * @param {Number} id The ID that was returned by `use`
   */
  InterceptorManager.prototype.eject = function eject(id) {
    if (this.handlers[id]) {
      this.handlers[id] = null;
    }
  };

  /**
   * Clear all interceptors from the stack
   */
  InterceptorManager.prototype.clear = function clear() {
    if (this.handlers) {
      this.handlers = [];
    }
  };

  /**
   * Iterate over all the registered interceptors
   *
   * This method is particularly useful for skipping over any
   * interceptors that may have become `null` calling `eject`.
   *
   * @param {Function} fn The function to call for each interceptor
   */
  InterceptorManager.prototype.forEach = function forEach(fn) {
    utils.forEach(this.handlers, function forEachHandler(h) {
      if (h !== null) {
        fn(h);
      }
    });
  };

  var InterceptorManager_1 = InterceptorManager;

  var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
    utils.forEach(headers, function processHeader(value, name) {
      if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
        headers[normalizedName] = value;
        delete headers[name];
      }
    });
  };

  var transitional = {
    silentJSONParsing: true,
    forcedJSONParsing: true,
    clarifyTimeoutError: false
  };

  var URLSearchParams_1 = typeof URLSearchParams !== 'undefined' ? URLSearchParams : AxiosURLSearchParams_1;

  var FormData_1 = FormData;

  var browser = {
    isBrowser: true,
    classes: {
      URLSearchParams: URLSearchParams_1,
      FormData: FormData_1,
      Blob: Blob
    },
    protocols: ['http', 'https', 'file', 'blob', 'url', 'data']
  };

  var platform = browser;

  var toURLEncodedForm = function toURLEncodedForm(data, options) {
    return toFormData_1(data, new platform.classes.URLSearchParams(), Object.assign({
      visitor: function(value, key, path, helpers) {
        if (platform.isNode && utils.isBuffer(value)) {
          this.append(key, value.toString('base64'));
          return false;
        }

        return helpers.defaultVisitor.apply(this, arguments);
      }
    }, options));
  };

  var MAX_FORM_DATA_TO_JSON_DEPTH = 100;

  function assertPathDepth(path) {
    var depth = path.length - 1;

    if (depth > MAX_FORM_DATA_TO_JSON_DEPTH) {
      throw new AxiosError_1(
        'Maximum object depth of ' + MAX_FORM_DATA_TO_JSON_DEPTH + ' exceeded (got ' + depth + ' levels)',
        AxiosError_1.ERR_FORM_DATA_DEPTH_EXCEEDED
      );
    }
  }

  function parsePropPath(name) {
    // foo[x][y][z]
    // foo.x.y.z
    // foo-x-y-z
    // foo x y z
    return utils.matchAll(/\w+|\[(\w*)]/g, name).map(function(match) {
      return match[0] === '[]' ? '' : match[1] || match[0];
    });
  }

  function arrayToObject(arr) {
    var obj = {};
    var keys = Object.keys(arr);
    var i;
    var len = keys.length;
    var key;
    for (i = 0; i < len; i++) {
      key = keys[i];
      obj[key] = arr[key];
    }
    return obj;
  }

  function normalizeArray(value) {
    if (!utils.isArray(value)) return value;

    var keys = Object.keys(value);
    if (keys.length !== value.length) return arrayToObject(value);

    for (var i = 0; i < keys.length; i++) {
      var index = +keys[i];
      if (
        index < 0 || index >= value.length ||
        Math.floor(index) !== index || String(index) !== keys[i]
      ) {
        return arrayToObject(value);
      }
    }

    return value;
  }

  function normalizeArrays(obj) {
    var pending = [obj];
    function normalizeEntry(target, key) {
      var value = target[key] = normalizeArray(target[key]);
      if (utils.isArray(value) || utils.isPlainObject(value)) {
        pending.push(value);
      }
    }
    while (pending.length) {
      var target = pending.pop();
      var keys = Object.keys(target);
      for (var i = 0; i < keys.length; i++) {
        normalizeEntry(target, keys[i]);
      }
    }
    return obj;
  }

  function formDataToJSON(formData) {
    function buildPath(path, value, target, index) {
      var name = path[index++];

      if (name === '__proto__') return true;

      var isNumericKey = isFinite(+name);
      var isLast = index >= path.length;
      name = !name && utils.isArray(target) ? target.length : name;

      if (isLast) {
        if (utils.hasOwnProperty(target, name)) {
          target[name] = [target[name], value];
        } else {
          target[name] = value;
        }

        return !isNumericKey;
      }

      if (!utils.hasOwnProperty(target, name) || !utils.isObject(target[name])) {
        target[name] = [];
      }

      var result = buildPath(path, value, target[name], index);

      if (result && utils.isArray(target[name])) {
        target[name] = arrayToObject(target[name]);
      }

      return !isNumericKey;
    }

    if (utils.isFormData(formData) && utils.isFunction(formData.entries)) {
      var obj = {};

      utils.forEachEntry(formData, function(name, value) {
        var path = parsePropPath(name);

        assertPathDepth(path);
        buildPath(path, value, obj, 0);
      });

      return normalizeArrays(obj);
    }

    return null;
  }

  var formDataToJSON_1 = formDataToJSON;

  /**
   * Resolve or reject a Promise based on response status.
   *
   * @param {Function} resolve A function that resolves the promise.
   * @param {Function} reject A function that rejects the promise.
   * @param {object} response The response.
   */
  var settle = function settle(resolve, reject, response) {
    var validateStatus = response.config.validateStatus;
    if (!response.status || !validateStatus || validateStatus(response.status)) {
      resolve(response);
    } else {
      reject(new AxiosError_1(
        'Request failed with status code ' + response.status,
        [AxiosError_1.ERR_BAD_REQUEST, AxiosError_1.ERR_BAD_RESPONSE][Math.floor(response.status / 100) - 4],
        response.config,
        response.request,
        response
      ));
    }
  };

  var cookies = (
    utils.isStandardBrowserEnv() ?

    // Standard browser envs support document.cookie
      (function standardBrowserEnv() {
        return {
          write: function write(name, value, expires, path, domain, secure) {
            var cookie = [];
            cookie.push(name + '=' + encodeURIComponent(value));

            if (utils.isNumber(expires)) {
              cookie.push('expires=' + new Date(expires).toGMTString());
            }

            if (utils.isString(path)) {
              cookie.push('path=' + path);
            }

            if (utils.isString(domain)) {
              cookie.push('domain=' + domain);
            }

            if (secure === true) {
              cookie.push('secure');
            }

            document.cookie = cookie.join('; ');
          },

          read: function read(name) {
            var nameEQ = name + '=';
            var cookies = document.cookie.split(';');
            var cookie;

            for (var i = 0; i < cookies.length; i++) {
              cookie = cookies[i];
              while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1);
              }
              if (cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length));
              }
            }

            return null;
          },

          remove: function remove(name) {
            this.write(name, '', Date.now() - 86400000);
          }
        };
      })() :

    // Non standard browser env (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return {
          write: function write() {},
          read: function read() { return null; },
          remove: function remove() {}
        };
      })()
  );

  /**
   * Determines whether the specified URL is absolute
   *
   * @param {string} url The URL to test
   * @returns {boolean} True if the specified URL is absolute, otherwise false
   */
  var isAbsoluteURL = function isAbsoluteURL(url) {
    // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
    // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
    // by any combination of letters, digits, plus, period, or hyphen.
    return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
  };

  /**
   * Creates a new URL by combining the specified URLs
   *
   * @param {string} baseURL The base URL
   * @param {string} relativeURL The relative URL
   * @returns {string} The combined URL
   */
  var combineURLs = function combineURLs(baseURL, relativeURL) {
    return relativeURL
      ? baseURL.replace(/\/?\/$/, '') + '/' + relativeURL.replace(/^\/+/, '')
      : baseURL;
  };

  /**
   * Creates a new URL by combining the baseURL with the requestedURL,
   * only when the requestedURL is not already an absolute URL.
   * If the requestURL is absolute, this function returns the requestedURL untouched.
   *
   * @param {string} baseURL The base URL
   * @param {string} requestedURL Absolute or relative URL to combine
   * @param {boolean} allowAbsoluteUrls Set to true to allow absolute URLs
   *
   * @returns {string} The combined full path
   */
  var buildFullPath = function buildFullPath(baseURL, requestedURL, allowAbsoluteUrls) {
    var isRelativeURL = !isAbsoluteURL(requestedURL);
    if (baseURL && (isRelativeURL || allowAbsoluteUrls === false)) {
      return combineURLs(baseURL, requestedURL);
    }
    return requestedURL;
  };

  // Headers whose duplicates are ignored by node
  // c.f. https://nodejs.org/api/http.html#http_message_headers
  var ignoreDuplicateOf = [
    'age', 'authorization', 'content-length', 'content-type', 'etag',
    'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
    'last-modified', 'location', 'max-forwards', 'proxy-authorization',
    'referer', 'retry-after', 'user-agent'
  ];

  /**
   * Parse headers into an object
   *
   * ```
   * Date: Wed, 27 Aug 2014 08:58:49 GMT
   * Content-Type: application/json
   * Connection: keep-alive
   * Transfer-Encoding: chunked
   * ```
   *
   * @param {String} headers Headers needing to be parsed
   * @returns {Object} Headers parsed into an object
   */
  var parseHeaders = function parseHeaders(headers) {
    var parsed = {};
    var key;
    var val;
    var i;

    if (!headers) { return parsed; }

    utils.forEach(headers.split('\n'), function parser(line) {
      i = line.indexOf(':');
      key = utils.trim(line.slice(0, i)).toLowerCase();
      val = utils.trim(line.slice(i + 1));

      if (key) {
        if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
          return;
        }
        if (key === 'set-cookie') {
          parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
        } else {
          parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
        }
      }
    });

    return parsed;
  };

  var isURLSameOrigin = (
    utils.isStandardBrowserEnv() ?

    // Standard browser envs have full support of the APIs needed to test
    // whether the request URL is of the same origin as current location.
      (function standardBrowserEnv() {
        var msie = /(msie|trident)/i.test(navigator.userAgent);
        var urlParsingNode = document.createElement('a');
        var originURL;

        /**
        * Parse a URL to discover it's components
        *
        * @param {String} url The URL to be parsed
        * @returns {Object}
        */
        function resolveURL(url) {
          var href = url;

          if (msie) {
            // IE needs attribute set twice to normalize properties
            urlParsingNode.setAttribute('href', href);
            href = urlParsingNode.href;
          }

          urlParsingNode.setAttribute('href', href);

          // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
          return {
            href: urlParsingNode.href,
            protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
            host: urlParsingNode.host,
            search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
            hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
            hostname: urlParsingNode.hostname,
            port: urlParsingNode.port,
            pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
              urlParsingNode.pathname :
              '/' + urlParsingNode.pathname
          };
        }

        originURL = resolveURL(window.location.href);

        /**
        * Determine if a URL shares the same origin as the current location
        *
        * @param {String} requestURL The URL to test
        * @returns {boolean} True if URL shares the same origin, otherwise false
        */
        return function isURLSameOrigin(requestURL) {
          var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
          return (parsed.protocol === originURL.protocol &&
              parsed.host === originURL.host);
        };
      })() :

      // Non standard browser envs (web workers, react-native) lack needed support.
      (function nonStandardBrowserEnv() {
        return function isURLSameOrigin() {
          return true;
        };
      })()
  );

  /**
   * A `CanceledError` is an object that is thrown when an operation is canceled.
   *
   * @class
   * @param {string=} message The message.
   * @param {Object=} config The config.
   * @param {Object=} request The request.
   */
  function CanceledError(message, config, request) {
    // eslint-disable-next-line no-eq-null,eqeqeq
    AxiosError_1.call(this, message == null ? 'canceled' : message, AxiosError_1.ERR_CANCELED, config, request);
    this.name = 'CanceledError';
  }

  utils.inherits(CanceledError, AxiosError_1, {
    __CANCEL__: true
  });

  var CanceledError_1 = CanceledError;

  var fromSignal = function fromSignal(signal, config, request) {
    var error = new CanceledError_1(null, config, request);

    if (signal) {
      try {
        var reason = signal.reason;
        if (reason !== undefined) {
          error.reason = reason;
        }
      } catch (e) {
        // A custom signal getter must not prevent cancellation.
      }
    }

    return error;
  };

  var parseProtocol = function parseProtocol(url) {
    var match = /^([-+\w]{1,25})(:?\/\/|:)/.exec(url);
    return match && match[1] || '';
  };

  var xhr = function xhrAdapter(config) {
    return new Promise(function dispatchXhrRequest(resolve, reject) {
      var requestData = config.data;
      var requestHeaders = config.headers;
      var responseType = config.responseType;
      // Guard against prototype pollution: only honor own properties.
      var withXSRFToken = utils.hasOwnProperty(config, 'withXSRFToken')
        ? config.withXSRFToken
        : undefined;
      var onCanceled;
      function done() {
        if (config.cancelToken) {
          config.cancelToken.unsubscribe(onCanceled);
        }

        if (config.signal) {
          config.signal.removeEventListener('abort', onCanceled);
        }
      }

      if (utils.isFormData(requestData) && utils.isStandardBrowserEnv()) {
        delete requestHeaders['Content-Type']; // Let the browser set it
      }

      var request = new XMLHttpRequest();

      // HTTP basic authentication
      var configAuth = utils.hasOwnProperty(config, 'auth') ? config.auth : undefined;
      if (configAuth) {
        var username = utils.hasOwnProperty(configAuth, 'username') ? configAuth.username || '' : '';
        var password = utils.hasOwnProperty(configAuth, 'password') && configAuth.password
          ? unescape(encodeURIComponent(configAuth.password))
          : '';
        requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
      }

      var fullPath = buildFullPath(
        config.baseURL,
        config.url,
        config.allowAbsoluteUrls
      );

      request.open(
        config.method.toUpperCase(),
        buildURL(
          fullPath,
          config.params,
          utils.hasOwnProperty(config, 'paramsSerializer') ? config.paramsSerializer : undefined
        ),
        true
      );

      // Set the request timeout in MS
      request.timeout = config.timeout;

      function onloadend() {
        if (!request) {
          return;
        }
        // Prepare the response
        var responseHeaders =
          'getAllResponseHeaders' in request
            ? parseHeaders(request.getAllResponseHeaders())
            : null;
        var responseData =
          !responseType || responseType === 'text' || responseType === 'json'
            ? request.responseText
            : request.response;
        var response = {
          data: responseData,
          status: request.status,
          statusText: request.statusText,
          headers: responseHeaders,
          config: config,
          request: request
        };

        settle(
          function _resolve(value) {
            resolve(value);
            done();
          },
          function _reject(err) {
            reject(err);
            done();
          },
          response
        );

        // Clean up request
        request = null;
      }

      if ('onloadend' in request) {
        // Use onloadend if available
        request.onloadend = onloadend;
      } else {
        // Listen for ready state to emulate onloadend
        request.onreadystatechange = function handleLoad() {
          if (!request || request.readyState !== 4) {
            return;
          }

          // The request errored out and we didn't get a response, this will be
          // handled by onerror instead
          // With one exception: request that using file: protocol, most browsers
          // will return status as 0 even though it's a successful request
          if (
            request.status === 0 &&
            !(request.responseURL && request.responseURL.indexOf('file:') === 0)
          ) {
            return;
          }
          // readystate handler is calling before onerror or ontimeout handlers,
          // so we should call onloadend on the next 'tick'
          setTimeout(onloadend);
        };
      }

      // Handle browser request cancellation (as opposed to a manual cancellation)
      request.onabort = function handleAbort() {
        if (!request) {
          return;
        }

        reject(
          new AxiosError_1(
            'Request aborted',
            AxiosError_1.ECONNABORTED,
            config,
            request
          )
        );

        // Clean up request
        request = null;
      };

      // Handle low level network errors
      request.onerror = function handleError() {
        // Real errors are hidden from us by the browser
        // onerror should only fire if it's a network error
        reject(
          new AxiosError_1(
            'Network Error',
            AxiosError_1.ERR_NETWORK,
            config,
            request
          )
        );

        // Clean up request
        request = null;
      };

      // Handle timeout
      request.ontimeout = function handleTimeout() {
        var timeoutErrorMessage = config.timeout
          ? 'timeout of ' + config.timeout + 'ms exceeded'
          : 'timeout exceeded';
        var transitional$1 = config.transitional || transitional;
        if (config.timeoutErrorMessage) {
          timeoutErrorMessage = config.timeoutErrorMessage;
        }
        reject(
          new AxiosError_1(
            timeoutErrorMessage,
            transitional$1.clarifyTimeoutError
              ? AxiosError_1.ETIMEDOUT
              : AxiosError_1.ECONNABORTED,
            config,
            request
          )
        );

        // Clean up request
        request = null;
      };

      // Add xsrf header
      // This is only done if running in a standard browser environment.
      // Specifically not if we're in a web worker, or react-native.
      if (utils.isStandardBrowserEnv()) {
        // Add xsrf header
        if (utils.isFunction(withXSRFToken)) {
          withXSRFToken = withXSRFToken(config);
        }
        // Strict boolean check: only `true` short-circuits the same-origin guard.
        if (
          withXSRFToken === true ||
          (withXSRFToken !== false && isURLSameOrigin(fullPath))
        ) {
          // Add xsrf header
          var xsrfValue =
            config.xsrfHeaderName &&
            config.xsrfCookieName &&
            cookies.read(config.xsrfCookieName);
          if (xsrfValue) {
            requestHeaders[config.xsrfHeaderName] = xsrfValue;
          }
        }
      }

      // Add headers to the request
      if ('setRequestHeader' in request) {
        utils.forEach(requestHeaders, function setRequestHeader(val, key) {
          if (
            typeof requestData === 'undefined' &&
            key.toLowerCase() === 'content-type'
          ) {
            // Remove Content-Type if data is undefined
            delete requestHeaders[key];
          } else {
            // Otherwise add header to the request
            request.setRequestHeader(key, val);
          }
        });
      }

      // Add withCredentials to request if needed
      if (!utils.isUndefined(config.withCredentials)) {
        request.withCredentials = !!config.withCredentials;
      }

      // Add responseType to request if needed
      if (responseType && responseType !== 'json') {
        request.responseType = config.responseType;
      }

      // Handle progress if needed
      if (typeof config.onDownloadProgress === 'function') {
        request.addEventListener('progress', config.onDownloadProgress);
      }

      // Not all browsers support upload events
      if (typeof config.onUploadProgress === 'function' && request.upload) {
        request.upload.addEventListener('progress', config.onUploadProgress);
      }

      if (config.cancelToken || config.signal) {
        // Handle cancellation
        // eslint-disable-next-line func-names
        onCanceled = function(cancel) {
          if (!request) {
            return;
          }
          reject(
            !cancel || cancel.type
              ? fromSignal(config.signal, config, request)
              : cancel
          );
          request.abort();
          request = null;
        };

        config.cancelToken && config.cancelToken.subscribe(onCanceled);
        if (config.signal) {
          config.signal.aborted
            ? onCanceled()
            : config.signal.addEventListener('abort', onCanceled);
        }
      }

      // false, 0 (zero number), and '' (empty string) are valid JSON values
      if (
        !requestData &&
        requestData !== false &&
        requestData !== 0 &&
        requestData !== ''
      ) {
        requestData = null;
      }

      var protocol = parseProtocol(fullPath);

      if (protocol && platform.protocols.indexOf(protocol) === -1) {
        reject(
          new AxiosError_1(
            'Unsupported protocol ' + protocol + ':',
            AxiosError_1.ERR_BAD_REQUEST,
            config
          )
        );
        return;
      }

      // Send the request
      request.send(requestData);
    });
  };

  var DEFAULT_CONTENT_TYPE = {
    'Content-Type': 'application/x-www-form-urlencoded'
  };

  function setContentTypeIfUnset(headers, value) {
    if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
      headers['Content-Type'] = value;
    }
  }

  function getDefaultAdapter() {
    var adapter;
    if (typeof XMLHttpRequest !== 'undefined') {
      // For browsers use XHR adapter
      adapter = xhr;
    } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
      // For node use HTTP adapter
      adapter = xhr;
    }
    return adapter;
  }

  function stringifySafely(rawValue, parser, encoder) {
    if (utils.isString(rawValue)) {
      try {
        (parser || JSON.parse)(rawValue);
        return utils.trim(rawValue);
      } catch (e) {
        if (e.name !== 'SyntaxError') {
          throw e;
        }
      }
    }

    return (encoder || JSON.stringify)(rawValue);
  }

  var defaults = {

    transitional: transitional,

    adapter: getDefaultAdapter(),

    transformRequest: [function transformRequest(data, headers) {
      normalizeHeaderName(headers, 'Accept');
      normalizeHeaderName(headers, 'Content-Type');

      var contentType = headers && headers['Content-Type'] || '';
      var hasJSONContentType = contentType.indexOf('application/json') > -1;
      var isObjectPayload = utils.isObject(data);

      if (isObjectPayload && utils.isHTMLForm(data)) {
        data = new FormData(data);
      }

      var isFormData = utils.isFormData(data);

      if (isFormData) {
        return hasJSONContentType ? JSON.stringify(formDataToJSON_1(data)) : data;
      }

      if (utils.isArrayBuffer(data) ||
        utils.isBuffer(data) ||
        utils.isStream(data) ||
        utils.isFile(data) ||
        utils.isBlob(data)
      ) {
        return data;
      }
      if (utils.isArrayBufferView(data)) {
        return data.buffer;
      }
      if (utils.isURLSearchParams(data)) {
        setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
        return data.toString();
      }

      var isFileList;

      if (isObjectPayload) {
        var formSerializer = utils.hasOwnProperty(this, 'formSerializer') ? this.formSerializer : undefined;
        var envOption = utils.hasOwnProperty(this, 'env') ? this.env : undefined;

        if (contentType.indexOf('application/x-www-form-urlencoded') !== -1) {
          return toURLEncodedForm(data, formSerializer).toString();
        }

        if ((isFileList = utils.isFileList(data)) || contentType.indexOf('multipart/form-data') > -1) {
          var _FormData = envOption && envOption.FormData;

          return toFormData_1(
            isFileList ? {'files[]': data} : data,
            _FormData && new _FormData(),
            formSerializer
          );
        }
      }

      if (isObjectPayload || hasJSONContentType ) {
        setContentTypeIfUnset(headers, 'application/json');
        return stringifySafely(data);
      }

      return data;
    }],

    transformResponse: [function transformResponse(data) {
      var transitional = this.transitional || defaults.transitional;
      var forcedJSONParsing = transitional && transitional.forcedJSONParsing;
      var JSONRequested = this.responseType === 'json';

      if (data && utils.isString(data) && ((forcedJSONParsing && !this.responseType) || JSONRequested)) {
        var silentJSONParsing = transitional && transitional.silentJSONParsing;
        var strictJSONParsing = !silentJSONParsing && JSONRequested;

        try {
          return JSON.parse(data);
        } catch (e) {
          if (strictJSONParsing) {
            if (e.name === 'SyntaxError') {
              throw AxiosError_1.from(e, AxiosError_1.ERR_BAD_RESPONSE, this, null, this.response);
            }
            throw e;
          }
        }
      }

      return data;
    }],

    /**
     * A timeout in milliseconds to abort a request. If set to 0 (default) a
     * timeout is not created.
     */
    timeout: 0,

    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',

    maxContentLength: -1,
    maxBodyLength: -1,

    redact: defaultRedactKeys.slice(),

    env: {
      FormData: platform.classes.FormData,
      Blob: platform.classes.Blob
    },

    validateStatus: function validateStatus(status) {
      return status >= 200 && status < 300;
    },

    headers: {
      common: {
        'Accept': 'application/json, text/plain, */*'
      }
    }
  };

  utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
    defaults.headers[method] = {};
  });

  utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
  });

  var defaults_1 = defaults;

  /**
   * Transform the data for a request or a response
   *
   * @param {Object|String} data The data to be transformed
   * @param {Array} headers The headers for the request or response
   * @param {Number} status HTTP status code
   * @param {Array|Function} fns A single function or Array of functions
   * @returns {*} The resulting transformed data
   */
  var transformData = function transformData(data, headers, status, fns) {
    var context = this || defaults_1;
    /*eslint no-param-reassign:0*/
    utils.forEach(fns, function transform(fn) {
      data = fn.call(context, data, headers, status);
    });

    return data;
  };

  var isCancel = function isCancel(value) {
    return !!(value && value.__CANCEL__);
  };

  var INVALID_HEADER_VALUE_RE = /[^\x09\x20-\x7E\x80-\xFF]/g;
  var BOUNDARY_WHITESPACE_RE = /^[\x09\x20]+|[\x09\x20]+$/g;

  function sanitizeHeaderValue(value) {
    if (value === false || value == null) {
      return value;
    }

    if (utils.isArray(value)) {
      return value.map(sanitizeHeaderValue);
    }

    return String(value)
      .replace(INVALID_HEADER_VALUE_RE, '')
      .replace(BOUNDARY_WHITESPACE_RE, '');
  }

  var sanitizeHeaderValue_1 = sanitizeHeaderValue;

  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  function throwIfCancellationRequested(config) {
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }

    if (config.signal && config.signal.aborted) {
      throw fromSignal(config.signal, config);
    }
  }

  /**
   * Dispatch a request to the server using the configured adapter.
   *
   * @param {object} config The config that is to be used for the request
   * @returns {Promise} The Promise to be fulfilled
   */
  var dispatchRequest = function dispatchRequest(config) {
    throwIfCancellationRequested(config);

    // Ensure headers exist. A request interceptor may return a replacement config
    // that inherits from Object.prototype, so only an own headers value is used.
    config.headers = (utils.hasOwnProperty(config, 'headers') && config.headers) || {};

    // Transform request data
    config.data = transformData.call(
      config,
      config.data,
      config.headers,
      null,
      config.transformRequest
    );

    normalizeHeaderName(config.headers, 'Accept');
    normalizeHeaderName(config.headers, 'Content-Type');

    // Flatten headers
    var commonHeaders = utils.hasOwnProperty(config.headers, 'common') && config.headers.common
      ? config.headers.common
      : {};
    var methodHeaders = config.method &&
      utils.hasOwnProperty(config.headers, config.method) &&
      config.headers[config.method]
      ? config.headers[config.method]
      : {};

    config.headers = utils.merge(commonHeaders, methodHeaders, config.headers);

    utils.forEach(
      ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
      function cleanHeaderConfig(method) {
        delete config.headers[method];
      }
    );

    utils.forEach(config.headers, function sanitizeHeaderConfigValue(value, header) {
      config.headers[header] = sanitizeHeaderValue_1(value);
    });

    var adapter = config.adapter || defaults_1.adapter;

    return adapter(config).then(function onAdapterResolution(response) {
      throwIfCancellationRequested(config);

      // Transform response data
      response.data = transformData.call(
        config,
        response.data,
        response.headers,
        response.status,
        config.transformResponse
      );

      return response;
    }, function onAdapterRejection(reason) {
      if (!isCancel(reason)) {
        throwIfCancellationRequested(config);

        // Transform response data
        if (reason && reason.response) {
          reason.response.data = transformData.call(
            config,
            reason.response.data,
            reason.response.headers,
            reason.response.status,
            config.transformResponse
          );
        }
      }

      return Promise.reject(reason);
    });
  };

  // Match numeric array reads without scanning unoccupied slots or metadata.
  function arrayIndexes(array) {
    var length = array.length;
    var indexes = Object.create(null);
    var keys = [];
    var source = array;
    var fast = array;
    while (source) {
      var names = Object.getOwnPropertyNames(source);
      for (var i = 0; i < names.length; i++) {
        var key = names[i];
        var index = +key;
        if (index >= 0 && index < length && Math.floor(index) === index &&
          String(index) === key && !indexes[key]) {
          indexes[key] = true;
          keys.push(key);
        }
      }
      source = Object.getPrototypeOf(source);
      // Detect unusual cyclic prototype chains with constant memory.
      fast = fast && Object.getPrototypeOf(fast);
      fast = fast && Object.getPrototypeOf(fast);
      if (source && source === fast) {
        throw new AxiosError_1('Circular prototype chain in params', AxiosError_1.ERR_BAD_OPTION_VALUE);
      }
    }
    return keys.sort(function(a, b) { return a - b; });
  }

  var assertParamsDepth = function assertParamsDepth(params) {
    if (!utils.isObject(params)) return;
    var pending = [{ value: params, depth: 0, complete: false }];
    var ancestors = [];
    var visited = null;
    if (typeof WeakMap === 'function') {
      visited = new WeakMap();
    } else if (typeof Map === 'function') {
      visited = new Map();
    }
    // Older runtimes can only compare immutable object identities by scanning.
    // Keep that scan bounded; recently completed subgraphs avoid repeated work,
    // while evicted shared subgraphs may be visited again.
    var cacheSize = 128;
    var visitedValues = [];
    var visitedDepths = [];
    var nextCacheIndex = 0;
    while (pending.length) {
      var entry = pending.pop();
      var value = entry.value;
      var index;
      if (entry.complete) {
        ancestors.pop();
        if (visited) {
          visited.set(value, entry.depth);
        } else {
          index = visitedValues.indexOf(value);
          if (index === -1) {
            index = nextCacheIndex;
            nextCacheIndex = (nextCacheIndex + 1) % cacheSize;
          }
          visitedValues[index] = value;
          visitedDepths[index] = entry.depth;
        }
        continue;
      }
      // The serializer enumerates any object at its root, then recursively
      // visits only plain objects and arrays below that root.
      if (entry.depth === 0 ? !utils.isObject(value) :
        !utils.isPlainObject(value) && !utils.isArray(value)) {
        continue;
      }
      if (entry.depth > 100) {
        throw new AxiosError_1('params exceed the maximum depth of 100', AxiosError_1.ERR_BAD_OPTION_VALUE);
      }
      // The depth cap bounds this ancestry scan independently of params width.
      if (ancestors.indexOf(value) !== -1) {
        throw new AxiosError_1('Circular reference detected in params', AxiosError_1.ERR_BAD_OPTION_VALUE);
      }
      if (visited) {
        if (visited.has(value) && visited.get(value) >= entry.depth) continue;
      } else {
        index = visitedValues.indexOf(value);
        if (index !== -1 && visitedDepths[index] >= entry.depth) continue;
      }
      ancestors.push(value);
      pending.push({ value: value, depth: entry.depth, complete: true });
      var keys = utils.isArray(value) ? arrayIndexes(value) : Object.keys(value);
      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (key !== '__proto__' && key !== 'constructor' && key !== 'prototype') {
          pending.push({ value: value[key], depth: entry.depth + 1, complete: false });
        }
      }
    }
  };

  /**
   * Config-specific merge-function which creates a new config-object
   * by merging two configuration objects together.
   *
   * @param {Object} config1
   * @param {Object} config2
   * @returns {Object} New object resulting from merging config2 to config1
   */
  var mergeConfig = function mergeConfig(config1, config2) {
    // eslint-disable-next-line no-param-reassign
    config2 = config2 || {};
    assertParamsDepth(utils.hasOwnProperty(config1, 'params') ? config1.params : undefined);
    assertParamsDepth(utils.hasOwnProperty(config2, 'params') ? config2.params : undefined);
    // Use a null-prototype object so a polluted Object.prototype cannot leak
    // values (e.g. transport, adapter) into the returned config via inheritance.
    var config = Object.create(null);

    function getOwn(source, prop) {
      return utils.hasOwnProperty(source, prop) ? source[prop] : undefined;
    }

    function hasOwn(source, prop) {
      return utils.hasOwnProperty(source, prop);
    }

    function getMergedValue(target, source) {
      if (utils.isPlainObject(target) && utils.isPlainObject(source)) {
        return utils.merge(target, source);
      } else if (utils.isEmptyObject(source)) {
        return utils.merge({}, target);
      } else if (utils.isPlainObject(source)) {
        return utils.merge({}, source);
      } else if (utils.isArray(source)) {
        return source.slice();
      }
      return source;
    }

    // eslint-disable-next-line consistent-return
    function mergeDeepProperties(prop) {
      if (hasOwn(config2, prop) && !utils.isUndefined(config2[prop])) {
        return getMergedValue(getOwn(config1, prop), config2[prop]);
      } else if (hasOwn(config1, prop) && !utils.isUndefined(config1[prop])) {
        return getMergedValue(undefined, config1[prop]);
      }
    }

    // eslint-disable-next-line consistent-return
    function valueFromConfig2(prop) {
      if (hasOwn(config2, prop) && !utils.isUndefined(config2[prop])) {
        return getMergedValue(undefined, config2[prop]);
      }
    }

    // eslint-disable-next-line consistent-return
    function defaultToConfig2(prop) {
      if (hasOwn(config2, prop) && !utils.isUndefined(config2[prop])) {
        return getMergedValue(undefined, config2[prop]);
      } else if (hasOwn(config1, prop) && !utils.isUndefined(config1[prop])) {
        return getMergedValue(undefined, config1[prop]);
      }
    }

    function defaultToConfig2Reference(prop) {
      var value = getOwn(config2, prop);
      return utils.isUndefined(value) ? getOwn(config1, prop) : value;
    }

    // eslint-disable-next-line consistent-return
    function mergeDirectKeys(prop) {
      if (hasOwn(config2, prop)) {
        return getMergedValue(getOwn(config1, prop), config2[prop]);
      } else if (hasOwn(config1, prop)) {
        return getMergedValue(undefined, config1[prop]);
      }
    }

    var mergeMap = {
      'url': valueFromConfig2,
      'method': valueFromConfig2,
      'data': valueFromConfig2,
      'baseURL': defaultToConfig2,
      'transformRequest': defaultToConfig2,
      'transformResponse': defaultToConfig2,
      'paramsSerializer': defaultToConfig2,
      'timeout': defaultToConfig2,
      'timeoutMessage': defaultToConfig2,
      'withCredentials': defaultToConfig2,
      'withXSRFToken': defaultToConfig2,
      'adapter': defaultToConfig2,
      'responseType': defaultToConfig2,
      'xsrfCookieName': defaultToConfig2,
      'xsrfHeaderName': defaultToConfig2,
      'onUploadProgress': defaultToConfig2,
      'onDownloadProgress': defaultToConfig2,
      'decompress': defaultToConfig2,
      'maxContentLength': defaultToConfig2,
      'maxBodyLength': defaultToConfig2,
      'beforeRedirect': defaultToConfig2,
      'transport': defaultToConfig2,
      'httpAgent': defaultToConfig2,
      'httpsAgent': defaultToConfig2,
      'cancelToken': defaultToConfig2,
      // Signals are live objects; cloning them snapshots getters and reasons.
      'signal': defaultToConfig2Reference,
      'socketPath': defaultToConfig2,
      'allowedSocketPaths': defaultToConfig2,
      'responseEncoding': defaultToConfig2,
      'validateStatus': mergeDirectKeys
    };

    utils.forEach(Object.keys(config1).concat(Object.keys(config2)), function computeConfigValue(prop) {
      if (prop === '__proto__' || prop === 'constructor' || prop === 'prototype') {
        return;
      }
      var merge = utils.hasOwnProperty(mergeMap, prop) ? mergeMap[prop] : mergeDeepProperties;
      var configValue = merge(prop);
      (utils.isUndefined(configValue) && merge !== mergeDirectKeys) || (config[prop] = configValue);
    });

    return config;
  };

  var data = {
    "version": "0.35.0"
  };

  var VERSION = data.version;


  var validators$1 = {};

  // eslint-disable-next-line func-names
  ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function(type, i) {
    validators$1[type] = function validator(thing) {
      return typeof thing === type || 'a' + (i < 1 ? 'n ' : ' ') + type;
    };
  });

  var deprecatedWarnings = {};

  /**
   * Transitional option validator
   * @param {function|boolean?} validator - set to false if the transitional option has been removed
   * @param {string?} version - deprecated version / removed since version
   * @param {string?} message - some message with additional info
   * @returns {function}
   */
  validators$1.transitional = function transitional(validator, version, message) {
    function formatMessage(opt, desc) {
      return '[Axios v' + VERSION + '] Transitional option \'' + opt + '\'' + desc + (message ? '. ' + message : '');
    }

    // eslint-disable-next-line func-names
    return function(value, opt, opts) {
      if (validator === false) {
        throw new AxiosError_1(
          formatMessage(opt, ' has been removed' + (version ? ' in ' + version : '')),
          AxiosError_1.ERR_DEPRECATED
        );
      }

      if (version && !deprecatedWarnings[opt]) {
        deprecatedWarnings[opt] = true;
        // eslint-disable-next-line no-console
        console.warn(
          formatMessage(
            opt,
            ' has been deprecated since v' + version + ' and will be removed in the near future'
          )
        );
      }

      return validator ? validator(value, opt, opts) : true;
    };
  };

  /**
   * Assert object's properties type
   * @param {object} options
   * @param {object} schema
   * @param {boolean?} allowUnknown
   */

  function assertOptions(options, schema, allowUnknown) {
    if (typeof options !== 'object') {
      throw new AxiosError_1('options must be an object', AxiosError_1.ERR_BAD_OPTION_VALUE);
    }
    var keys = Object.keys(options);
    var i = keys.length;
    while (i-- > 0) {
      var opt = keys[i];
      var validator = schema[opt];
      if (validator) {
        var value = options[opt];
        var result = value === undefined || validator(value, opt, options);
        if (result !== true) {
          throw new AxiosError_1('option ' + opt + ' must be ' + result, AxiosError_1.ERR_BAD_OPTION_VALUE);
        }
        continue;
      }
      if (allowUnknown !== true) {
        throw new AxiosError_1('Unknown option ' + opt, AxiosError_1.ERR_BAD_OPTION);
      }
    }
  }

  var validator = {
    assertOptions: assertOptions,
    validators: validators$1
  };

  var validators = validator.validators;

  function captureCallerStack(boundary) {
    var caller = {};
    try {
      if (Error.captureStackTrace) {
        Error.captureStackTrace(caller, boundary);
      } else {
        caller = new Error();
      }
    } catch (e) {
      // Stack hooks must not prevent a request from being sent.
    }
    return caller;
  }

  function attachCallerStack(promise, caller) {
    if (!caller) {
      return promise;
    }

    return promise.then(null, function onRequestRejected(error) {
      try {
        if (error instanceof Error || Object.prototype.toString.call(error) === '[object Error]') {
          // Capture at dispatch time, but only format the stack on failure.
          // Capturing in this callback would lose callers using .then/.catch.
          var stack = caller.stack;
          if (typeof stack === 'string') {
            var newline = stack.indexOf('\n');
            stack = newline === -1 ? '' : stack.slice(newline + 1);
            var original = error.stack;
            if (stack && (original === undefined || original === null || original === '')) {
              error.stack = stack;
            } else if (stack && typeof original === 'string' && original.indexOf(stack) === -1) {
              error.stack = original + '\n' + stack;
            }
          }
        }
      } catch (e) {
        // Frozen errors and custom stack accessors must retain their rejection.
      }
      return Promise.reject(error);
    });
  }

  function dispatchAfterRecovery(config) {
    return function dispatchRecoveredRequest() {
      return dispatchRequest(config);
    };
  }

  /**
   * Create a new instance of Axios
   *
   * @param {Object} instanceConfig The default config for the instance
   */
  function Axios(instanceConfig) {
    this.defaults = instanceConfig;
    this.interceptors = {
      request: new InterceptorManager_1(),
      response: new InterceptorManager_1()
    };
  }

  /**
   * Dispatch a request
   *
   * @param {String|Object} configOrUrl The config specific for this request (merged with this.defaults)
   * @param {?Object} config
   */
  Axios.prototype.request = function request(configOrUrl, config) {
    /*eslint no-param-reassign:0*/
    // Allow for axios('example/url'[, config]) a la fetch API
    if (typeof configOrUrl === 'string') {
      config = config || {};
      config.url = configOrUrl;
    } else {
      config = configOrUrl || {};
    }

    try {
      config = mergeConfig(this.defaults, config);
    } catch (error) {
      return Promise.reject(error);
    }
    var caller = config.captureCallerStack === true ? captureCallerStack(request) : null;

    // Set config.method. The merged config is null-prototype, but instance
    // defaults may be an ordinary object, so the fallback is read as an own
    // property to keep an inherited value from choosing the request method.
    if (config.method) {
      config.method = config.method.toLowerCase();
    } else if (utils.hasOwnProperty(this.defaults, 'method') && this.defaults.method) {
      config.method = this.defaults.method.toLowerCase();
    } else {
      config.method = 'get';
    }

    var transitional = config.transitional;

    if (transitional !== undefined) {
      validator.assertOptions(transitional, {
        silentJSONParsing: validators.transitional(validators.boolean),
        forcedJSONParsing: validators.transitional(validators.boolean),
        clarifyTimeoutError: validators.transitional(validators.boolean)
      }, false);
    }

    var paramsSerializer = config.paramsSerializer;

    if (paramsSerializer != null) {
      if (utils.isFunction(paramsSerializer)) {
        config.paramsSerializer = {
          serialize: paramsSerializer
        };
      } else {
        validator.assertOptions(paramsSerializer, {
          encode: validators.function,
          serialize: validators.function
        }, true);
      }
    }

    // filter out skipped interceptors
    var requestInterceptorChain = [];
    var synchronousRequestInterceptors = true;
    this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
      if (typeof interceptor.runWhen === 'function' && interceptor.runWhen(config) === false) {
        return;
      }

      synchronousRequestInterceptors = synchronousRequestInterceptors && interceptor.synchronous;

      requestInterceptorChain.unshift(interceptor.fulfilled, interceptor.rejected);
    });

    var responseInterceptorChain = [];
    this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
      responseInterceptorChain.push(interceptor.fulfilled, interceptor.rejected);
    });

    var promise;

    if (!synchronousRequestInterceptors) {
      var chain = [dispatchRequest, undefined];

      Array.prototype.unshift.apply(chain, requestInterceptorChain);
      chain = chain.concat(responseInterceptorChain);

      promise = Promise.resolve(config);
      while (chain.length) {
        promise = promise.then(chain.shift(), chain.shift());
      }

      return attachCallerStack(promise, caller);
    }


    var newConfig = config;
    while (requestInterceptorChain.length) {
      var onFulfilled = requestInterceptorChain.shift();
      var onRejected = requestInterceptorChain.shift();
      try {
        newConfig = onFulfilled ? onFulfilled(newConfig) : newConfig;
      } catch (error) {
        if (!onRejected) {
          promise = Promise.reject(error);
          break;
        }
        try {
          var recovery = onRejected(error);
          if (recovery && typeof recovery.then === 'function') {
            promise = Promise.resolve(recovery).then(dispatchAfterRecovery(newConfig));
          }
        } catch (rejectedError) {
          promise = Promise.reject(rejectedError);
        }
        break;
      }
    }

    if (!promise) {
      try {
        promise = dispatchRequest(newConfig);
      } catch (error) {
        // Dispatch errors, including pre-aborted signals, still go through the
        // response interceptors registered below.
        promise = Promise.reject(error);
      }
    }

    while (responseInterceptorChain.length) {
      promise = promise.then(responseInterceptorChain.shift(), responseInterceptorChain.shift());
    }

    return attachCallerStack(promise, caller);
  };

  Axios.prototype.getUri = function getUri(config) {
    config = mergeConfig(this.defaults, config);
    var fullPath = buildFullPath(config.baseURL, config.url, config.allowAbsoluteUrls);
    return buildURL(fullPath, config.params, config.paramsSerializer);
  };

  // Provide aliases for supported request methods
  utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
    /*eslint func-names:0*/
    Axios.prototype[method] = function(url, config) {
      var requestConfig = config || {};

      try {
        requestConfig = mergeConfig(requestConfig, {
          method: method,
          url: url,
          data: utils.hasOwnProperty(requestConfig, 'data') ? requestConfig.data : undefined
        });
      } catch (error) {
        return Promise.reject(error);
      }
      return this.request(requestConfig);
    };
  });

  utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
    /*eslint func-names:0*/

    function generateHTTPMethod(isForm) {
      return function httpMethod(url, data, config) {
        var requestConfig;
        try {
          requestConfig = mergeConfig(config || {}, {
            method: method,
            headers: isForm ? {
              'Content-Type': 'multipart/form-data'
            } : {},
            url: url,
            data: data
          });
        } catch (error) {
          return Promise.reject(error);
        }
        return this.request(requestConfig);
      };
    }

    Axios.prototype[method] = generateHTTPMethod();

    Axios.prototype[method + 'Form'] = generateHTTPMethod(true);
  });

  var Axios_1 = Axios;

  /**
   * A `CancelToken` is an object that can be used to request cancellation of an operation.
   *
   * @class
   * @param {Function} executor The executor function.
   */
  function CancelToken(executor) {
    if (typeof executor !== 'function') {
      throw new TypeError('executor must be a function.');
    }

    var resolvePromise;

    this.promise = new Promise(function promiseExecutor(resolve) {
      resolvePromise = resolve;
    });

    var token = this;

    // eslint-disable-next-line func-names
    this.promise.then(function(cancel) {
      if (!token._listeners) return;

      var i = token._listeners.length;

      while (i-- > 0) {
        token._listeners[i](cancel);
      }
      token._listeners = null;
    });

    // eslint-disable-next-line func-names
    this.promise.then = function(onfulfilled) {
      var _resolve;
      // eslint-disable-next-line func-names
      var promise = new Promise(function(resolve) {
        token.subscribe(resolve);
        _resolve = resolve;
      }).then(onfulfilled);

      promise.cancel = function reject() {
        token.unsubscribe(_resolve);
      };

      return promise;
    };

    executor(function cancel(message, config, request) {
      if (token.reason) {
        // Cancellation has already been requested
        return;
      }

      token.reason = new CanceledError_1(message, config, request);
      resolvePromise(token.reason);
    });
  }

  /**
   * Throws a `CanceledError` if cancellation has been requested.
   */
  CancelToken.prototype.throwIfRequested = function throwIfRequested() {
    if (this.reason) {
      throw this.reason;
    }
  };

  /**
   * Subscribe to the cancel signal
   */

  CancelToken.prototype.subscribe = function subscribe(listener) {
    if (this.reason) {
      listener(this.reason);
      return;
    }

    if (this._listeners) {
      this._listeners.push(listener);
    } else {
      this._listeners = [listener];
    }
  };

  /**
   * Unsubscribe from the cancel signal
   */

  CancelToken.prototype.unsubscribe = function unsubscribe(listener) {
    if (!this._listeners) {
      return;
    }
    var index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  };

  /**
   * Returns an object that contains a new `CancelToken` and a function that, when called,
   * cancels the `CancelToken`.
   */
  CancelToken.source = function source() {
    var cancel;
    var token = new CancelToken(function executor(c) {
      cancel = c;
    });
    return {
      token: token,
      cancel: cancel
    };
  };

  var CancelToken_1 = CancelToken;

  /**
   * Syntactic sugar for invoking a function and expanding an array for arguments.
   *
   * Common use case would be to use `Function.prototype.apply`.
   *
   *  ```js
   *  function f(x, y, z) {}
   *  var args = [1, 2, 3];
   *  f.apply(null, args);
   *  ```
   *
   * With `spread` this example can be re-written.
   *
   *  ```js
   *  spread(function(x, y, z) {})([1, 2, 3]);
   *  ```
   *
   * @param {Function} callback
   * @returns {Function}
   */
  var spread = function spread(callback) {
    return function wrap(arr) {
      return callback.apply(null, arr);
    };
  };

  /**
   * Determines whether the payload is an error thrown by Axios
   *
   * @param {*} payload The value to test
   * @returns {boolean} True if the payload is an error thrown by Axios, otherwise false
   */
  var isAxiosError = function isAxiosError(payload) {
    return utils.isObject(payload) && (payload.isAxiosError === true);
  };

  /**
   * Create an instance of Axios
   *
   * @param {Object} defaultConfig The default config for the instance
   * @return {Axios} A new instance of Axios
   */
  function createInstance(defaultConfig) {
    var context = new Axios_1(defaultConfig);
    var instance = bind(Axios_1.prototype.request, context);

    // Copy axios.prototype to instance
    utils.extend(instance, Axios_1.prototype, context);

    // Copy context to instance
    utils.extend(instance, context);

    // Factory for creating new instances
    instance.create = function create(instanceConfig) {
      return createInstance(mergeConfig(defaultConfig, instanceConfig));
    };

    return instance;
  }

  // Create the default instance to be exported
  var axios = createInstance(defaults_1);

  // Expose Axios class to allow class inheritance
  axios.Axios = Axios_1;

  // Expose Cancel & CancelToken
  axios.CanceledError = CanceledError_1;
  axios.CancelToken = CancelToken_1;
  axios.isCancel = isCancel;
  axios.VERSION = data.version;
  axios.toFormData = toFormData_1;

  // Expose AxiosError class
  axios.AxiosError = AxiosError_1;

  // alias for CanceledError for backward compatibility
  axios.Cancel = axios.CanceledError;

  // Expose all/spread
  axios.all = function all(promises) {
    return Promise.all(promises);
  };
  axios.spread = spread;

  // Expose isAxiosError
  axios.isAxiosError = isAxiosError;

  axios.formToJSON = function(thing) {
    return formDataToJSON_1(utils.isHTMLForm(thing) ? new FormData(thing) : thing);
  };

  var axios_1 = axios;

  // Allow use of default import syntax in TypeScript
  var _default = axios;
  axios_1.default = _default;

  return axios_1;

}));
//# sourceMappingURL=axios.js.map
