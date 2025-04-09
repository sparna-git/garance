const jsonld = require('./jsonld.js')


exports.getProperties = function(nodeShape) {
  return nodeShape["sh:property"];
}

exports.getSortKeyOfShape = function(nodeShape) {
  let props = exports.getProperties(nodeShape)
  for (var i = 0; i < props.length; i++) {
    if(props[i]["dash:propertyRole"] && props[i]["dash:propertyRole"] === "dash:sortKeyRole") {
      return props[i]["sh:path"];
    }
  }
}

exports.sortByShOrder = function(propertyShapesArray) {
  return propertyShapesArray.sort((a, b) => {
    return a["sh:order"] - b["sh:order"];
  })
}

exports.getNodeShape = function(type, shapes) {
  return shapesWithTarget = shapes.graph.find(ns => ns["sh:targetClass"] == type);
}

exports.getPropertyShape = function(typeArray, predicateFullUri, shapes) {
  // 1. For each type...
  for (var i = 0; i < typeArray.length; i++) {
    // 2. Read the available properties of that type, using full URI
    var ns = exports.getNodeShape(typeArray[i], shapes);
    if(ns) {
      let thisShapeProps = exports.getProperties(ns);
      for (var i = 0; i < thisShapeProps.length; i++) {
        if(thisShapeProps[i]["sh:path"] === predicateFullUri) {
          // TODO : we return the first we find, but we may have multiple ones
          // if we have multiple NodeShapes
          return thisShapeProps[i];
        }
      }      
    }
  }

  return undefined;
}

/**
 * typeArray is always an array
 **/
exports.getSortedPredicatesOfTypes = function(typeArray, shapes) {
  var allProperties = [];
  // 1. For each type...
  for (var i = 0; i < typeArray.length; i++) {
    // 2. Read the available properties of that type, using full URI
    var ns = exports.getNodeShape(typeArray[i], shapes);
    if(ns) {
      let thisShapeProps = exports.getProperties(ns);
      for (var i = 0; i < thisShapeProps.length; i++) {
        // if the same property does not already exist, add it
        // because in case of multi-typing, the same property may come from multiple shapes
        if(!allProperties.find(item => item["sh:path"] === thisShapeProps[i]["sh:path"])) {
          allProperties.push(thisShapeProps[i])
        }
      }      
    }
  }

  // 3. Then merge into a single sorted array, by returning only the path
  return exports.sortByShOrder(allProperties).map(p => p["sh:path"]);
}

exports.sortPredicates = function(object, shapes, context) {
  let expandedKeys = new Map();
  Object.keys(object).forEach((key) => {
    // build a map of expanded URI to original key
    expandedKeys.set(jsonld.expandUri(key, context), key);
  });

  // now read the type or types of the object
  let types = jsonld.getTypes(object);

  // get the sorted list of predicates of these types
  // flat() ensures we always have an array
  // see https://stackoverflow.com/a/58553894
  let sortedPredicates = exports.getSortedPredicatesOfTypes([types].flat().map(t => jsonld.expandUri(t, context)), shapes);

  // then recreate an array by looking into our map, in order
  let result = [];
  sortedPredicates.forEach(p => {
    if(expandedKeys.has(p)) {
      result.push(expandedKeys.get(p));
    }
  })

  // then add all remaining keys not already in the result, at the end, as the default
  let unknownKeys = [];
  expandedKeys.forEach((value, key, map) => {
    if(!result.includes(value)) {
      unknownKeys.push(value);
    }
  });
  // sort them alphabetically
  unknownKeys.sort();
  // add type first
  result.push(...unknownKeys.filter(t => (t == "type" || t == "@type")));
  result.push(...unknownKeys.filter(t => (t != "type" && t != "@type")));

  return result;
}


exports.sortValues = function(array, shapes, context) {
  return array.sort((a, b) => {
    return exports.getSortKey(a, shapes, context).localeCompare(exports.getSortKey(b, shapes, context));
  });
}

exports.getSortKey = function(something, shapes, context) {
  let key = null;
  if(jsonld.isIriPrefixed(something, context)) {
    key = something;
  } else if(jsonld.isIriString(something, context)) {
    key = something;
  } else if(jsonld.isIriObjectWithOnlyOptionalType(something, context)) {
    key = jsonld.getId(something);
  } else if(jsonld.isLiteralString(something, context)) {
    key = something;
  } else if(jsonld.isObjectWithSingleLabelProperty(something, context)) {
    key = JSON.stringify(jsonld.extractFirstNonIdNonTypeProperty(something));
  } else {
    // check if a sort key is declared in the shapes for the object type
    let types = jsonld.getTypes(something);    
    let sortKey = exports.getSortKeyOfTypes([types].flat().map(t => jsonld.expandUri(t, context)), shapes);
    if(sortKey) {
      // try to read this property on the object
      let prop = jsonld.findPredicate(something, sortKey, context);
      // returns the property or the id if none exists
      key = prop?JSON.stringify(prop):jsonld.getId(something);
    } else {
      // default to the id
      key = jsonld.getId(something);
    }
  }

  // as a very last resort, default to string value of the something to be sorted
  // this can happen when it is an object with no id
  if(!key) {
    return JSON.stringify(something);
  }
  return key;
}


/**
 * typeArray is always an array
 **/
exports.getSortKeyOfTypes = function(typeArray, shapes) {
  // 1. For each type...
  for (var i = 0; i < typeArray.length; i++) {
    // 2. Read the sort key of that type, using full URI
    var ns = exports.getNodeShape(typeArray[i], shapes);
    if(ns) {
      let sortKey = exports.getSortKeyOfShape(ns);
      if(sortKey) {
        return sortKey;
      }
    }
  }
}

/**
 * Reads the volipi:class annotation on the property shape of the given predicate
 * on one of the provided type
 **/
exports.additionnalCssClass = function(predicate, object, shapes, context) {
  // read the type or types of the object
  let types = jsonld.getTypes(object);
  // read the property shape of the predicate in one of those types
  // flat() ensures we always have an array
  let propertyShape = exports.getPropertyShape(
    [types].flat().map(t => jsonld.expandUri(t, context)),
    jsonld.expandUri(predicate, context),
    shapes
  );

  // then see if this property shape has a volipi:class attribute
  if(propertyShape && propertyShape["volipi:class"]) {
    return propertyShape["volipi:class"];
  } else {
    return "";
  }
}