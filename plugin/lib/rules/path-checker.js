"use strict";

const path = require('path')
const {isPathRelative} = require("../helpers");


module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    messages: {
      'link':'В рамках одного слайса все пути должны быть относительными'
    },
    docs: {
      description: "feature sliced relative path checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [
        {
          type: 'object',
          properties: {
            alias: {
              type: 'string'
            }
          }
        },
    ], // Add a schema if the rule has options
  },

  create(context) {
    const alias  = context.options[0]?.alias ?? ''
    return {
      ImportDeclaration(node) {
        const value = node.source.value;
        const importTo = alias ? value.replace(`${alias}/`, ''): value
        const fromFilename = context.getFilename()
        if (shouldBeRelative(fromFilename, importTo)){
          context.report({node, messageId: 'link'})
        }
      }
    };
  },
};


const layers = {
  'shared': 'shared',
  'entities': 'entities',
  'features': 'features',
  'widgets': 'widgets',
  'pages': 'pages',
  'app': 'app',
}

const shouldBeRelative = (from, to) => {
  if (isPathRelative(to)) {
    return false
  }
  const toArray = to.split('/')
  const toLayer = toArray[0]
  const toSlice = toArray[1]

  if (!toLayer || !toSlice || !layers[toLayer]){
    return false
  }

  const normPath = path.toNamespacedPath(from)
  const projectFrom = normPath.split('src')[1]
  const fromArray = projectFrom.split(path.sep)

  const fromLayer = fromArray[1]
  const fromSlice = fromArray[2]
  if (!fromLayer || !fromSlice || !layers[fromLayer]){
    return false
  }
  return fromSlice === toSlice && fromLayer === toLayer
}
