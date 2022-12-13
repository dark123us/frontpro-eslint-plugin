"use strict";

const path = require('path')


module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "feature sliced relative path checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
  },

  create(context) {

    return {
      ImportDeclaration(node) {
        const importTo = node.source.value
        const fromFilename = context.getFilename()

        if (shouldBeRelative(fromFilename, importTo)){
          context.report(node, 'В рамках одного слайса все пути должны быть относительны')
        }

      }
    };
  },
};

const isPathRelative = (path) => {
  return path === '.' || path.startsWith('./') || path.startsWith('../')
}

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

  //const fromArray = projectFrom.split('\\')
  // console.log(fromArray)

  const fromLayer = fromArray[1]
  const fromSlice = fromArray[2]

  if (!fromLayer || !fromSlice || !layers[fromLayer]){
    return false
  }

  return fromSlice === toSlice && fromLayer === toLayer

}

// console.log(isPathRelative('pages/ArticlesPage/ui/ArticlesPageFilters'))
// console.log(shouldBeRelative('D:\\projects\\frontpro\\src\\pages\\ArticlesPage\\ui\\ArticlesPage.tsx', 'pages/ArticlesPage/ui/ArticlesPageFilters'))
