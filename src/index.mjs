import chalk from "chalk";

import { parse, print } from "graphql";

import MergeSchema from 'merge-graphql-schemas';

import path from 'path';
import fs from 'fs';

const moduleURL = new URL(import.meta.url);

const __dirname = path.dirname(moduleURL.pathname);

const { createWriteStream, unlinkSync } = fs;

const { fileLoader, mergeTypes } = MergeSchema


export default class PrismaModule {

  constructor(options = {}) {

    const {
      modules = [],
    } = options;

    this.mergeModules(modules);

  }


  mergeModules(modules) {

    this.modules = this.modules || [];

    modules.map(module => {

      this.modules.push(new module())

    })

  }


  getResolvers() {


    let Query = {};
    let Mutation = {};
    let Subscription = {};
    let OtherResolvers = {};


    this.getModules().map(n => {

      const {
        Query: ModuleQuery,
        Mutation: ModuleMutation,
        Subscription: ModuleSubscription,
        ...ModuleOtherResolvers
      } = n.getResolvers() || {};

      Object.assign(Query, ModuleQuery);
      Object.assign(Mutation, ModuleMutation);
      Object.assign(Subscription, ModuleSubscription);
      Object.assign(OtherResolvers, ModuleOtherResolvers);

    });

    return {
      ...OtherResolvers,
      Query,
      Mutation,
      Subscription,
    }
  }


  getSchema(types = []) {

    let typesArray = [];

    this.getModules().map(n => {

      const moduleTypes = n.getSchema();

      if (moduleTypes) {
        typesArray = typesArray.concat(moduleTypes);
      }

    });

    return mergeTypes(typesArray.concat(types), { all: true });
  }


  getApiSchema(types = [], excludeTypes = []) {

    let typesArray = [];


    let baseSchema = mergeTypes(types, { all: true });


    excludeTypes = excludeTypes.concat(this.getExcludableApiTypes());

    excludeTypes = [... new Set(excludeTypes)]


    // console.log(chalk.green("getApiSchema excludeTypes"), excludeTypes);

    baseSchema = this.cleanupApiSchema(baseSchema, excludeTypes);


    this.getModules().map(n => {

      const moduleTypes = n.getApiSchema();

      if (moduleTypes) {
        typesArray = typesArray.concat(moduleTypes);
      }

    });


    let apiSchema = mergeTypes([baseSchema].concat(typesArray), { all: true });

    return apiSchema;

  }


  cleanupApiSchema(baseSchema, excludeTypes = []) {

    if (excludeTypes.length) {


      const parsed = parse(baseSchema);

      if (parsed && parsed.definitions) {

        this.cleanupDefinitions(parsed, excludeTypes);

        baseSchema = print(parsed);

      }


    }

    return baseSchema;
  }


  cleanupDefinitions(schema, excludeTypes) {

    // console.log(chalk.green("cleanupDefinitions"), excludeTypes, schema);

    let {
      definitions,
    } = schema;

    if (excludeTypes && definitions) {

      excludeTypes.map(excludeName => {

        definitions.reduce((current, next) => {

          if (
            [
              "InputObjectTypeDefinition",
              "ObjectTypeDefinition",
              "EnumTypeDefinition",
            ].indexOf(next.kind) !== -1
            && next.name.value === excludeName
          ) {

            let index = current.findIndex(n => n && n.name && n.name.value === excludeName);

            if (index !== -1) {

              current.splice(index, 1);

            }

          }


          return current;

        }, definitions);

      });

    }

  }



  getExcludableApiTypes(excludeTypes = []) {

    this.getModules().map(n => {

      excludeTypes = excludeTypes.concat(n.getExcludableApiTypes());

    });

    // console.log("getExcludableApiTypes", excludeTypes);

    return excludeTypes;
  }


  getModules() {

    return this.modules;

  }


}