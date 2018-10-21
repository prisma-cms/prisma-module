
import fs from "fs";

import chalk from "chalk";

import { fileLoader, mergeTypes } from 'merge-graphql-schemas';

import {CmsModule} from "@prisma-cms/server";

import InnerModule from "./innerModule";


class TestModule extends CmsModule {


  constructor(options = {}) {

    let {
      modules = [],
    } = options;

    modules = modules.concat([
    ]);
    
    Object.assign(options, {
      modules,
    });
    
    super(options);
    
    this.mergeModules([
      // RouterModuleExtended,
      InnerModule,
    ]);

  }
  

  getSchema(types = []) {

    let schema = fileLoader(__dirname + '/schema/database/', {
      recursive: true,
    });


    if (schema) {
      types = types.concat(schema);
    }


    let typesArray = super.getSchema(types);

    return typesArray;

  }

  
  getApiSchema(types = []) {


    let apiSchema = super.getApiSchema(types, []);


    let schema = fileLoader(__dirname + '/schema/api/', {
      recursive: true,
    });

    /**
     * Hack for imitate = "src/schema/generated/prisma.graphql";
     */
    let baseSchema = this.getSchema();

    apiSchema = mergeTypes([apiSchema.concat(schema).concat(baseSchema)], { all: true });

    return apiSchema;

  }


  // getExcludableApiTypes(){

  //   return super.getExcludableApiTypes([
  //   ]);

  // }


}


export default TestModule;

it("fake", () => {
  
})
