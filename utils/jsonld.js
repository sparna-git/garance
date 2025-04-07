
/**
 * @constant {string} RDF_TYPE - The rdf:type URI.
 */
const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";

/**
 * @constant {string} SKOS_PREFLABEL - The SKOS preferred label URI.
 */
const SKOS_PREFLABEL = "http://www.w3.org/2004/02/skos/core#prefLabel";

/**
 * @constant {string} RDFS_LABEL - The RDFS label URI.
 */
const RDFS_LABEL = "http://www.w3.org/2000/01/rdf-schema#label";

/**
 * @constant {string} FOAF_NAME - The FOAF name URI.
 */
const FOAF_NAME = "http://xmlns.com/foaf/0.1/name";

/**
 * @constant {string} SCHEMA_NAME - The Schema.org name URI.
 */
const SCHEMA_NAME = "http://schema.org/name";

/**
 * @constant {string} DCTERMS_TITLE - The DCTerms title URI.
 */
const DCTERMS_TITLE = "http://purl.org/dc/terms/title";

/**
 * Gets the ID of an object.
 * @param {object} obj - The object to get the ID from.
 * @returns {string} The ID of the object.
 */
function getId(obj) {
  return (obj.id?obj.id:obj["@id"]);
}

/**
 * Gets the type of an object.
 * @param {object} obj - The object to get the type from.
 * @returns {string or array} The type or types of the object.
 */
function getTypes(obj) {
  return (obj.type?obj.type:obj["@type"]);
}

/**
 * Checks if a value is an IRI string.
 * @param {string} value - The value to check.
 * @param {object} context - The context to use for checking the IRI.
 * @returns {boolean} True if the value is an IRI string, false otherwise.
 */
function isIriString(value, context) {
  return typeof value === 'string' && value.startsWith("http") ;
}

/**
 * Checks if a value is an IRI prefixed string.
 * @param {string} value - The value to check.
 * @param {object} context - The context to use for checking the IRI prefix.
 * @returns {boolean} True if the value is an IRI prefixed string, false otherwise.
 */
function isIriPrefixed(value, context) {
  return typeof value === 'string' && Object.keys(context).some(key => (
    typeof context[key] === "string"
    &&
    context[key].startsWith("http")
    &&
    value.startsWith(key)
  ));
}

/**
 * Returns the expanded IRI of the object
 */
function getIriExpanded(obj, context) {
  if(typeof obj === 'object') {
    var iri = getId(obj);
    var expandedIri = expandUri(iri, context);
    return expandedIri;
  } else {
    return null;
  }
}

/**
 * Checks if an object is a literal string.
 * @param {any} obj - The object to check.
 * @returns {boolean} True if the object is a literal string, false otherwise.
 */
function isLiteralString(obj) {
  return typeof obj  === 'string'
}

/**
 * Checks if an object is a literal object.
 * @param {any} obj - The object to check.
 * @returns {boolean} True if the object is a literal object, false otherwise.
 */
function isLiteralObject(obj) {
  return (
    typeof obj === 'object'
    &&
    ('@value' in obj || 'value' in obj)
  )
}

/**
 * Checks if an object is a literal array with a single value.
 * @param {any} obj - The object to check.
 * @returns {boolean} True if the object is a literal array with a single value, false otherwise.
 */
function isLiteralArrayWithSingleValue(obj) {
  return (
    obj instanceof Array
    &&
    obj.length === 1
    &&
    (
      isLiteralString(obj[0])
      ||
      isLiteralObject(obj[0])
    )
  )
}

/**
 * Shortens a URI using the provided context.
 * @param {string} uri - The URI to shorten.
 * @param {object} context - The context to use for shortening the URI.
 * @returns {string} The shortened URI.
 */
function shortenUri(uri, context) {
  const contextEntry = Object.entries(context).find(([prefix, fullUri]) => uri.startsWith(fullUri));
  return contextEntry ? `${contextEntry[0]}:${uri.slice(contextEntry[1].length)}` : uri;
}

/**
 * Expands a QName using the provided context.
 * @param {string} qname - The QName to expand.
 * @param {object} context - The context to use for expanding the QName.
 * @returns {string} The expanded QName, or the value itself if it cannot be expanded
 */
function expandUri(qname, context) {
  if(qname == "id" || qname == "@id") {
    return qname;
  }
  if(qname == "type" || qname == "@type") {
    return RDF_TYPE;
  }

  var result = qname;
  if(qname in context) {
    if(typeof context[qname] === "string" && context[qname].startsWith('http')) {
      result = context[qname];
    } else if (typeof context[qname] === "string" && expandUriOnPrefixes(context[qname], context).startsWith('http')) {
      result = expandUriOnPrefixes(context[qname], context);
    } else if(typeof context[qname] === "object" && context[qname]['@id']) {
      result = expandUriOnPrefixes(context[qname]['@id'], context);
    } 
  } else {
    result = expandUriOnPrefixes(qname, context);
  }

  return result;
}

/**
 * Expands a QName using prefixes from the provided context.
 * @param {string} qname - The QName to expand.
 * @param {object} context - The context to use for expanding the QName.
 * @returns {string} The expanded QName.
 */
function expandUriOnPrefixes(qname, context) {

  result = qname;
  if(qname.includes(':') && qname.split(':').length === 2 && qname.split(':')[0] in context) {
    result = context[qname.split(':')[0]] + qname.split(':')[1];
  }
  return result;
}

function findById(jsonld, id) {
  let graph = (jsonld.graph)?jsonld.graph:jsonld["@graph"];
  if(graph) {
    let result = graph.filter(item => (getId(item) === id));
    if(result) return result[0];
  }
}

/**
 * Finds a predicate in an object using the provided context.
 * @param {object} object - The object to search for the predicate.
 * @param {string} predicateFullIri - The full IRI of the predicate to find.
 * @param {object} context - The context to use for finding the predicate.
 * @returns {any} The value of the predicate if found, null otherwise.
 */
function findPredicate(object, predicateFullIri, context) {
  const predicateKey = shortenUri(predicateFullIri, context);
  if(object[predicateFullIri]) {
    // either the full predicate URI is used directly as a key
    return object[predicateFullIri];
  } else if(object[predicateKey]) {
    // or (most common) the short URI is used as a key
    return object[predicateKey];
  } else {
    // or the context specifies a new JSON key remapped to this URI
    let uriMappings = Object.entries(context).find(([prefix, mapping]) => {
      return (
        typeof mapping === "object"
        &&
        (
          mapping["@id"] == predicateFullIri
          ||
          mapping["@id"] == predicateKey
        )
      )
    });
    if(uriMappings && uriMappings.length == 1) {
      return object[uriMappings[0]];
    } else {
      return null;
    }
  }
}

/**
 * Removes type keys from an object.
 * @param {object} obj - The object to remove type keys from.
 */
function removeTypeKey(obj) {
  if(obj && typeof obj === "object") {
    if(! ("@value" in obj || "value" in obj)) {
      delete obj.type;
      delete obj["@type"];
    }
    Object.entries(obj).forEach(([key, value]) => {
      removeTypeKey(value)
    });
  }
}

function isLabelPredicate(predicateKey, context) {
  var expanded = expandUri(predicateKey, context);
  return (
    expanded == RDFS_LABEL
    ||
    expanded == SKOS_PREFLABEL
    ||
    expanded == FOAF_NAME
    ||
    expanded == DCTERMS_TITLE
    ||
    expanded == SCHEMA_NAME
  )
}

module.exports = {
 
  getId: getId,
  getTypes: getTypes,

  /**
   * Checks if a value is an array.
   * @param {*} value - The value to check.
   * @returns {boolean} True if the value is an array, false otherwise.
   */
  isArray: function(value) {
    return Array.isArray(value);
  },

  /**
   * Unboxes an array if it contains a single value.
   * @param {Array} array - The array to unbox.
   * @returns {*} The unboxed value if the array contains a single value, the array otherwise.
   */
  unboxArray: function(array) {
      if (array && Array.isArray(array) && array.length === 1) {
          return array[0];
      }
      return array;
  },

  isIriString: isIriString,
  isIriPrefixed: isIriPrefixed,
  getIriExpanded: getIriExpanded,

  /**
   * Checks if a value is an IRI object with only possibly a type.
   * @param {object} value - The value to check.
   * @returns {boolean} True if the value is an IRI object, possibly with only a type, false otherwise.
   */
  isIriObjectWithOnlyOptionalType: function(value) {
    return (
      typeof value === 'object'
      &&
      (
        ('id' in value && !value["id"].startsWith("_:"))
        ||
        ('@id' in value && !value["@id"].startsWith("_:"))
      )
      &&
      (
        Object.keys(value).length === 1
        ||
        (
          Object.keys(value).length === 2
          &&
          ('type' in value || '@type' in value)
        )
      )
    )
  },
  
  isLiteralString: isLiteralString,
  
  isLiteralObject: isLiteralObject,

  isLiteralArrayWithSingleValue: isLiteralArrayWithSingleValue,

  /**
   * Checks if an object has a single label property.
   * @param {object} obj - The object to check.
   * @returns {boolean} True if the object has a single label property, false otherwise.
   */
  isObjectWithSingleLabelProperty: function(obj, context) {
    if(!obj || !(typeof obj === "object")) return false;
    const keys = Object.keys(obj);
    const valueKeys =  keys.filter(k => ( k !== 'id' && k !== '@id' && k !== 'type' && k !== '@type' ));
  
    return (
      (keys.includes('id') || keys.includes('@id'))
      &&
      valueKeys.length === 1
      &&
      obj[valueKeys[0]] !== null
      &&
      (
        isLiteralString(obj[valueKeys[0]])
        ||
        isLiteralObject(obj[valueKeys[0]])
        ||
        isLiteralArrayWithSingleValue(obj[valueKeys[0]])
      )
      &&
      isLabelPredicate(valueKeys[0], context)
    )
  },

  /**
   * Extracts the first non-ID, non-type property from an object.
   * @param {object} obj - The object to extract the property from.
   * @returns {*} The value of the first non-ID, non-type property.
   */
  extractFirstNonIdNonTypeProperty: function(obj) {
    const keys = Object.keys(obj);
    const valueKeys =  keys.filter(k => ( k !== 'id' && k !== '@id' && k !== 'type' && k !== '@type' ));
    if(valueKeys.length > 0) {
      return obj[valueKeys[0]];
    }
  },

  shortenUri: shortenUri,

  expandUri: expandUri,
  findPredicate: findPredicate,
  findById: findById,

  /**
   * Strips the HTML prefix from a literal.
   * @param {string} literal - The literal to strip the HTML prefix from.
   * @returns {string} The literal without the HTML prefix.
   */
  stripHtmlPrefix: function (literal) {
    return literal.replace(/<html:/g, '<').replace(/<\/html:/g, '</');
  },

  /**
   * Gets the display label of an object using the provided context.
   * @param {object} obj - The object to get the display label from.
   * @param {object} context - The context to use for getting the display label.
   * @returns {string} The display label of the object.
   */
  displayLabel: function(obj, context) {
    let dctermsTitle = findPredicate(obj, DCTERMS_TITLE, context);
    if(dctermsTitle) {
      return dctermsTitle
    } 
    let schemaName = findPredicate(obj, SCHEMA_NAME, context);
    if(schemaName) {
      return schemaName
    }
    let foafName = findPredicate(obj, FOAF_NAME, context);
    if(foafName) {
      return foafName
    }  
    let skosPrefLabel = findPredicate(obj, SKOS_PREFLABEL, context);
    if(skosPrefLabel) {
      return skosPrefLabel
    } 
    let rdfsLabel = findPredicate(obj, RDFS_LABEL, context);
    if(rdfsLabel) {
      return rdfsLabel
    } 

    return shortenUri(getId(obj), context)
  },

  /**
   * /!\ currently not used as this is applied at the framing step
   * Removes type keys from sublevels of an object.
   * @param {object} obj - The object to remove type keys from.
   * @returns {object} The object with type keys removed from sublevels.
   */
  removeTypeFromSublevels: function(obj) {
    Object.entries(obj).forEach(([key, value]) => {
      removeTypeKey(value)
    });
    return obj;
  }
    
}
