/**
 * @fileoverview descr
 * @author dark123us
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const {isPathRelative} = require("../helpers");
const path = require("path");
const micromatch = require("micromatch");
/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "descr",
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
          },
          ignoreImportPatterns: {
            type: 'array'
          }

        }
      },
    ], // Add a schema if the rule has options
  },

  create(context) {

    const layers = {
      'app': ['pages', 'widgets', 'features', 'entities', 'shared'],
      'pages': ['widgets', 'features', 'entities', 'shared'],
      'widgets': ['features', 'entities', 'shared'],
      'features': ['entities', 'shared'],
      'entities': ['entities', 'shared'],
      'shared': ['shared'],
    }

    const availableLayers = {
      'app': 'app',
      'pages': 'pages',
      'widgets': 'widgets',
      'features': 'features',
      'entities': 'entities',
      'shared': 'shared',
    }

    const {alias = '', ignoreImportPatterns = []}  = context.options[0] ?? {}
    const getCurrentFileLayer = () => {
      const currentFilePath = context.getFilename();
      const normalizedPath = path.toNamespacedPath(currentFilePath);
      const projectPath = normalizedPath?.split('src')[1];
      const segments = projectPath?.split(path.sep)
      return segments?.[1]
    }

    const getImportLayer = (value) => {
      const importTo = alias ? value.replace(`${alias}/`, ''): value
      const segments = importTo?.split('/')
      return segments?.[0]
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value
        const currentFileLayer = getCurrentFileLayer()
        const importLayer = getImportLayer(importPath)

        if (isPathRelative(importPath)){
          return
        }

        if(!availableLayers[importLayer] || !availableLayers[currentFileLayer]){
          return;
        }

        const isIgnored = ignoreImportPatterns.some(pattern => {
          return micromatch.isMatch(importPath, pattern)
        })
        if(isIgnored){
          return;
        }

        if(!layers[currentFileLayer]?.includes(importLayer)){
          context.report(node, 'Слой может импортировать в себя только нижележащие слои (shared, entities, features, widgets, pages, app)')
        }

      }
    }
  },
};
