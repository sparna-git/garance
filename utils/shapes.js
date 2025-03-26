const jsonld = require('./jsonld.js')


exports.getProperties = function(nodeShape) {
  return nodeShape["sh:property"];
}

exports.sortByShOrder = function(propertyShapesArray) {
  return propertyShapesArray.sort((a, b) => {
    return a["sh:order"] - b["sh:order"];
  })
}

exports.getNodeShape = function(type, shapes) {
  return shapesWithTarget = shapes.graph.find(ns => ns["sh:targetClass"] == type);
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
      allProperties.push(...exports.getProperties(ns))
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
  result.push(...unknownKeys)

  return result;
}
