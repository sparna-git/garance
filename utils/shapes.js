const jsonld = require("./jsonld.js");

/**
 *
 * @param {*} nodeShape
 * @returns the property shapes of the provided node shape
 */
exports.getProperties = function (nodeShape) {
  return nodeShape["sh:property"];
};

/**
 *
 * @param {*} nodeShape
 * @returns the predicate of the property shape marked with dash:sortKeyRole inside the provided node shape
 */
exports.getSortKeyOfShape = function (nodeShape) {
  let props = exports.getProperties(nodeShape);
  for (var i = 0; i < props.length; i++) {
    if (
      props[i]["dash:propertyRole"] &&
      props[i]["dash:propertyRole"] === "dash:sortKeyRole"
    ) {
      return props[i]["sh:path"];
    }
  }
};

/**
 *
 * @param {*} propertyShapesArray
 * @returns The sorted property shapes array by the sh:order property
 */
exports.sortByShOrder = function (propertyShapesArray) {
  return propertyShapesArray.sort((a, b) => {
    return a["sh:order"] - b["sh:order"];
  });
};

/**
 *
 * @param {*} type
 * @param {*} shapes
 * @returns the node shape targeting the provided type with sh:targetClass
 */
exports.getNodeShape = function (type, shapes) {
  return (shapesWithTarget = shapes.graph.find(
    (ns) => ns["sh:targetClass"] == type
  ));
};

/**
 *
 * @param {*} typeArray
 * @param {*} predicateFullUri
 * @param {*} shapes
 * @returns The property shape describing the provided predicate in any of the provided types
 */
exports.getPropertyShape = function (typeArray, predicateFullUri, shapes) {
  // 1. For each type...
  for (var i = 0; i < typeArray.length; i++) {
    // 2. Read the available properties of that type, using full URI
    var ns = exports.getNodeShape(typeArray[i], shapes);
    if (ns) {
      let thisShapeProps = exports.getProperties(ns);
      for (var i = 0; i < thisShapeProps.length; i++) {
        if (thisShapeProps[i]["sh:path"] === predicateFullUri) {
          // TODO : we return the first we find, but we may have multiple ones
          // if we have multiple NodeShapes
          return thisShapeProps[i];
        }
      }
    }
  }

  return undefined;
};

/**
 * typeArray is always an array
 **/
exports.getSortedPredicatesOfTypes = function (typeArray, shapes) {
  var allProperties = [];
  // 1. For each type...
  for (var i = 0; i < typeArray.length; i++) {
    // 2. Read the available properties of that type, using full URI
    var ns = exports.getNodeShape(typeArray[i], shapes);
    if (ns) {
      let thisShapeProps = exports.getProperties(ns);
      for (var i = 0; i < thisShapeProps.length; i++) {
        // if the same property does not already exist, add it
        // because in case of multi-typing, the same property may come from multiple shapes
        if (
          !allProperties.find(
            (item) => item["sh:path"] === thisShapeProps[i]["sh:path"]
          )
        ) {
          allProperties.push(thisShapeProps[i]);
        }
      }
    }
  }

  // 3. Then merge into a single sorted array, by returning only the path
  return exports.sortByShOrder(allProperties).map((p) => p["sh:path"]);
};

exports.sortPredicates = function (object, shapes, context) {
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
  let sortedPredicates = exports.getSortedPredicatesOfTypes(
    [types].flat().map((t) => jsonld.expandUri(t, context)),
    shapes
  );

  // then recreate an array by looking into our map, in order
  let result = [];
  sortedPredicates.forEach((p) => {
    if (expandedKeys.has(p)) {
      result.push(expandedKeys.get(p));
    }
  });

  // then add all remaining keys not already in the result, at the end, as the default
  let unknownKeys = [];
  expandedKeys.forEach((value, key, map) => {
    if (!result.includes(value)) {
      unknownKeys.push(value);
    }
  });
  // sort them alphabetically
  unknownKeys.sort();
  // add type first
  result.push(...unknownKeys.filter((t) => t == "type" || t == "@type"));
  result.push(...unknownKeys.filter((t) => t != "type" && t != "@type"));

  return result;
};

exports.sortValues = function (array, shapes, context) {
  return array.sort((a, b) => {
    return exports
      .getSortKey(a, shapes, context)
      .localeCompare(exports.getSortKey(b, shapes, context));
  });
};

exports.getSortKey = function (something, shapes, context) {
  let key = null;
  if (jsonld.isIriPrefixed(something, context)) {
    key = something;
  } else if (jsonld.isIriString(something, context)) {
    key = something;
  } else if (jsonld.isIriObjectWithOnlyOptionalType(something, context)) {
    key = jsonld.getId(something);
  } else if (jsonld.isLiteralString(something, context)) {
    key = something;
  } else if (jsonld.isLiteralObject(something, context)) {
    // return '@value' if not null/undefined, otherwise returns 'value'
    key = something["@value"] ?? something["value"];
  } else if (jsonld.isObjectWithSingleLabelProperty(something, context)) {
    key = JSON.stringify(jsonld.extractFirstNonIdNonTypeProperty(something));
  } else if (jsonld.isLiteralObject(something)) {
    // check if the object is literal and sort string
    key = something.value;
  } else {
    // check if a sort key is declared in the shapes for the object type
    let types = jsonld.getTypes(something);
    let sortKey = exports.getSortKeyOfTypes(
      [types].flat().map((t) => jsonld.expandUri(t, context)),
      shapes
    );
    if (sortKey) {
      // try to read this property on the object
      let prop = jsonld.findPredicate(something, sortKey, context);
      // returns the property or the id if none exists
      key = prop ? JSON.stringify(prop) : jsonld.getId(something);
    } else {
      // default to the id
      key = jsonld.getId(something);
    }
  }

  // as a very last resort, default to string value of the something to be sorted
  // this can happen when it is an object with no id
  if (!key) {
    return JSON.stringify(something);
  }
  return key;
};

/**
 * typeArray is always an array
 **/
exports.getSortKeyOfTypes = function (typeArray, shapes) {
  // 1. For each type...
  for (var i = 0; i < typeArray.length; i++) {
    // 2. Read the sort key of that type, using full URI
    var ns = exports.getNodeShape(typeArray[i], shapes);
    if (ns) {
      let sortKey = exports.getSortKeyOfShape(ns);
      if (sortKey) {
        return sortKey;
      }
    }
  }
};

/**
 * Reads the volipi:class annotation on the property shape of the given predicate
 * on one of the provided type
 **/
exports.additionnalCssClass = function (predicate, object, shapes, context) {
  // read the type or types of the object
  let types = jsonld.getTypes(object);
  // read the property shape of the predicate in one of those types
  // flat() ensures we always have an array
  let propertyShape = exports.getPropertyShape(
    [types].flat().map((t) => jsonld.expandUri(t, context)),
    jsonld.expandUri(predicate, context),
    shapes
  );

  // then see if this property shape has a volipi:class attribute
  if (propertyShape && propertyShape["volipi:class"]) {
    return propertyShape["volipi:class"];
  } else {
    return "";
  }
};

exports.getCssClassesFromTypes = function (types, shapes, context) {
  const expandedTypes = [types].flat().map((t) => {
    // const expanded = expandManually(t, context); // forcé ici
    return (expanded = jsonld.expandUri(t, context));
  });

  const cssClasses = [];

  expandedTypes.forEach((type) => {
    const nodeShape = exports.getNodeShape(type, shapes);
    if (nodeShape && nodeShape["volipi:class"]) {
      cssClasses.push(`${nodeShape["volipi:class"]}`);
    }
  });

  return cssClasses.join(" ");
};

exports.getHeaderCssClasses = function (types, shapes, context) {
  const classes = exports.getCssClassesFromTypes(types, shapes, context);
  return classes;
};

/**
 * Récupère les attributs weight, meta, filter, exclude pour un prédicat donné,
 * en se basant sur le type du noeud (via jsonld.getTypes) et en cherchant
 * le PropertyShape correspondant (via getPropertyShape).
 *
 * @param {Object} object - L'objet RDF à analyser (pour lire son type)
 * @param {String} predicateUri - L'URI expandie du prédicat à chercher
 * @param {Object} shapes - L'ensemble des shapes (avec .graph)
 * @param {Object} context - Le contexte JSON-LD
 * @returns {Object} { weight, metaKeys, filter, exclude }
 */
exports.findShapeAttributes = function (object, predicateUri, shapes, context) {
  const expandUri = (uri) => jsonld.expandUri(uri, context);

  let weight = null;
  let metaKeys = [];
  let filter = [];
  let exclude = false;

  if (!shapes || !Array.isArray(shapes.graph)) {
    return { weight, metaKeys, filter, exclude };
  }

  // trouver le ou les types de l'objet
  const types = jsonld.getTypes(object);
  const expandedTypes = [types].flat().map((t) => expandUri(t));

  // trouver le PropertyShape correspondant au prédicat pour un des types
  const propertyShape = exports.getPropertyShape(
    expandedTypes,
    predicateUri,
    shapes
  );

  if (propertyShape) {
    // extraire les attributs souhaités
    if ("weight" in propertyShape) {
      weight = propertyShape.weight;
    }

    if ("meta" in propertyShape) {
      const metaValues = Array.isArray(propertyShape.meta)
        ? propertyShape.meta
        : [propertyShape.meta];
      metaKeys.push(...metaValues);
    }

    if ("filter" in propertyShape) {
      const filterValues = Array.isArray(propertyShape.filter)
        ? propertyShape.filter
        : [propertyShape.filter];
      filter.push(...filterValues);
    }

    if ("exclude" in propertyShape) {
      exclude = propertyShape.exclude;
    }
  }

  return { weight, metaKeys, filter, exclude };
};
