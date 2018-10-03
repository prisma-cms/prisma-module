// import chalk from "chalk";

import { mergeTypes } from 'merge-graphql-schemas';
import { parse, print } from "graphql";

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

    baseSchema = this.cleanupApiSchema(baseSchema, excludeTypes);

    
    this.getModules().map(n => {

      const moduleTypes = n.getApiSchema();

      if (moduleTypes) {
        typesArray = typesArray.concat(moduleTypes);
      }

    });


    baseSchema = mergeTypes([baseSchema].concat(typesArray), { all: true });



    return baseSchema;

  }


  cleanupApiSchema(baseSchema, excludeTypes = []) {

    excludeTypes = excludeTypes.concat(this.getExcludableApiTypes());

    if (excludeTypes.length) {

      const parsed = parse(baseSchema);

      parsed.definitions = parsed.definitions.filter(

        n => {

          return !(n.kind === "InputObjectTypeDefinition" && excludeTypes.indexOf(n.name.value) !== -1);

        }
      );

      baseSchema = print(parsed);
    }

    return baseSchema;
  }


  getExcludableApiTypes() {
    let excludeTypes = [];

    this.getModules().map(n => {

      excludeTypes = excludeTypes.concat(n.getExcludableApiTypes());

    });

    return excludeTypes;
  }


  getModules() {

    return this.modules;

  }


}