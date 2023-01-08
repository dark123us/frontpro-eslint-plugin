/**
 * @fileoverview descr
 * @author dark123us
 */
"use strict";
const {isPathRelative} = require("../helpers");
const path = require("path");
const micromatch = require('micromatch')


//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------




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
          testFilesPatterns: {
            type: 'array'
          }

        }
      },
    ], // Add a schema if the rule has options
  },

  create(context) {
    const {alias = '', testFilesPatterns = []}  = context.options[0] ?? {}

    const checkingLayers = {
      'entities': 'entities',
      'features': 'features',
      'widgets': 'widgets',
      'pages': 'pages',
      'app': 'app',
    }


    return {
      ImportDeclaration(node) {
        const value = node.source.value;
        const importTo = alias ? value.replace(`${alias}/`, ''): value

        if (isPathRelative(importTo)){
          return
        }

        const segments = importTo.split('/')
        const layer = segments[0];

        const isImportNotFromPublicApi = segments.length > 2;

        const isTestingPublicApi = segments[2] === 'testing' && segments.length < 4

        if (!checkingLayers[layer]){
          return;
        }


        if (isImportNotFromPublicApi  && !isTestingPublicApi){
          context.report(node, 'Абсолютный импорт разрешен только из Public API (index.ts)')
        }

        if(isTestingPublicApi) {
          const currentFilePath = context.getFilename();
          const normalizedPath = path.toNamespacedPath(currentFilePath);

          const isCurrentFileTesting = testFilesPatterns.some(
              pattern => micromatch.isMatch(normalizedPath, pattern)
          )

          if(!isCurrentFileTesting) {
            context.report(node, 'Тестовые данные необходимо импортировать из publicApi/testing.ts');
          }
        }

      }
    };
  },
};
