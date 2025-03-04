const uriLabelTable = {
  // Predefined table for URI labels
  "prefLabel": "Preferred Label",
  "broader": "Broader Concept",
  // Add more as needed
};

const uriDescriptionTable = {
  // Predefined table for URI descriptions
  "prefLabel": "The preferred label of a concept.",
  "broader": "A broader concept in a taxonomy.",
  // Add more as needed
};

const shortenUri = (uri, context) => {
  // This function shortens URIs using the context
  const contextEntry = Object.entries(context).find(([prefix, fullUri]) => uri.startsWith(fullUri));
  return contextEntry ? `${contextEntry[0]}:${uri.slice(contextEntry[1].length)}` : uri;
};

const expandUri = (qname, context) => {
  if(qname == "id" || qname == "@id" || qname == "type" || qname == "@type") {
    return qname;
  }

  // This function expands shortened URIs using the context
  var result = qname;
  if(qname.includes(':') && qname.split(':').length === 2 && qname.split(':')[0] in context) {
    result = context[qname.split(':')[0]] + qname.split(':')[1];
  } else if(qname in context) {
    if(typeof context[qname] === "string" && context[qname].startsWith('http')) {
      result = context[qname];
    } else if (typeof context[qname] === "string" && expandUri(context[qname], context).startsWith('http')) {
      result = expandUri(context[qname], context);
    } else if(typeof context[qname] === "object" && context[qname]['@id']) {
      result = expandUri(context[qname]['@id'], context);
    } 
  }

  return result;
};

// Main render function
function render(value, context) {

  if (!value) {
    return "null"
  }

  // unbox array
  if (Array.isArray(value) && value.length === 1) {
    return render(value[0], context);
  }

  if(isIriPrefixed(value, context)){
    // qname corresponding to a URI
    return renderPlainUri(expandUri(value, context), context);
  } else if (isIriString(value)) {
    // Single URI, plain
    return renderPlainUri(value, context);
  } else if (isIriObjectWithOnlyType(value)) {
      // Single URI object
      return renderPlainUri(value.id, context);
  } else if (isLiteral(value)) {
    // Literal case
    return renderLiteral(value);
  } else if(isObjectWithSingleLabelProperty(value)){
    // nested object with a single label
    var labelProperty = extractFirstNonIdNonTypeProperty(value);

    var labelValue;
    if(isLiteralString(labelProperty)){
      labelValue = labelProperty;
    } else if(isLiteralObject(labelProperty)){
      labelValue = labelProperty['@value'] || labelProperty['value'];
    } else if(isLiteralArrayWithSingleValue(labelProperty)){
      if(isLiteralString(labelProperty[0])){ 
        labelValue = labelProperty[0];
      } else if(isLiteralObject(labelProperty[0])){
        labelValue = labelProperty[0]['@value'] || labelProperty[0]['value'];
      }
    }
    const labelHtml = renderLiteral(labelValue);
    return renderLabelledUri(expandUri(value.id, context), labelHtml);
  } else {
    // nested object
    return renderObject(value, context);
  }
}



function renderObject(entity, context) {
  let htmlRows = '';

  for (const [predicate, value] of Object.entries(entity)) {
    if (value != null && Array.isArray(value)) {
      value.forEach((item, index) => {
        if(index == 0)
          htmlRows += renderRow(predicate, item, context);
        else
          htmlRows += renderRowWithoutPredicate(item, context);
      });
    } else {
      htmlRows += renderRow(predicate, value, context);
    }
  }

  return `<div class="entity">${htmlRows}</div>`;
}

const renderLiteral = (literal) => {
  if (typeof literal === 'string') {
    return `<span class="literal">${literal}</span>`;
  } else if ('@language' in literal || '@type' in literal || 'language' in literal || 'type' in literal) {
    const value = literal['@value'] || literal['value']
    const langOrType = literal['@language'] || literal['@type'] || literal['language'] || literal['type'];
    return `<span class="literal">${stripHtmlPrefixes(value)}&nbsp;<sup>(${langOrType})</sup></span>`;
  }
};

const stripHtmlPrefixes = (literal) => {
  return literal.replace(/<html:/g, '<').replace(/<\/html:/g, '</');
};

function renderPlainUri(uri, context) {
  const formattedUri = shortenUri(uri, context);
  return `<a href="${uri}" class="hyperlink">${formattedUri}</a>`;
}

function renderLabelledUri(uri, labelHtml, context) {
  return `<a href="${uri}" class="hyperlink">${labelHtml}</a>`;
}

function renderRow(predicate, value, context) {
  const valueHtml = render(value, context);

  return `
  <div class="entity-row">
    <div class="cell predicate">
      ${renderPredicate(predicate, context)}
    </div>
    <div class="cell value">
      ${valueHtml}
    </div>
  </div>
`;
}

function renderRowWithoutPredicate(value, context) {
  const valueHtml = render(value, context);

  return `
  <div class="entity-row">
    <div class="cell predicate">&nbsp;</div>
    <div class="cell value">
      ${valueHtml}
    </div>
  </div>
`;
}

function renderPredicate(predicate, context) {
  const label = uriLabelTable[predicate] || predicate;
  const description = uriDescriptionTable[predicate] || '';

  const formattedPredicate = shortenUri(expandUri(predicate, context), context);
  return `
      <span class="label" title="${description}" data-comment="${description}" data-label="${label}">${label}</span>
      <br />
      <code class="uri">(${formattedPredicate})</code>
      <!-- <span class="info-icon" title="${description}">ℹ️</span> -->
`;
}


function isObjectWithSingleLabelProperty(obj) {
  // Checks if the object has an ID and a simple label
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
      // array with single entry 
      isLiteralArrayWithSingleValue(obj[valueKeys[0]])
    )
  )
}

function extractFirstNonIdNonTypeProperty(obj) {
  const keys = Object.keys(obj);
  const valueKeys =  keys.filter(k => ( k !== 'id' && k !== '@id' && k !== 'type' && k !== '@type' ));
  if(valueKeys.length > 0) {
    return obj[valueKeys[0]];
  }
}

function isIriObjectWithOnlyType(value) {
  return (
    typeof value === 'object'
    &&
    ('id' in value || '@id' in value)
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
}

function isIriPrefixed(value, context) {
  return typeof value === 'string' && Object.keys(context).some(key => (
    typeof context[key] === "string"
    &&
    context[key].startsWith("http")
    &&
    value.startsWith(key)
  ));
}

function isIriString(value) {
  return typeof value === 'string' && value.startsWith("http") ;
}

function isLiteral(value) {
  return isLiteralString(value) || isLiteralObject(value);
}

let isLiteralString = function(obj) {
  return typeof obj  === 'string'
}

let isLiteralObject = function(obj) {
  return (
    typeof obj === 'object'
    &&
    ('@value' in obj || 'value' in obj)
  )
}

let isLiteralArrayWithSingleValue = function(obj) {
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


module.exports = { render };