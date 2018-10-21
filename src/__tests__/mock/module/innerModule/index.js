
import fs from "fs";

import chalk from "chalk";

import PrismaModule from "../../../../";


import { fileLoader } from 'merge-graphql-schemas';

 
 

class InnerModule extends PrismaModule {
 
 
  getSchema(types = []) {
 

    let schema = fileLoader(__dirname + '/schema/database/', {
      recursive: true,
    });


    console.log(chalk.green("schema"), schema);


    if(schema){
      types = types.concat(schema);
    }


    let typesArray = super.getSchema(types);

    return typesArray;

  }


  // getApiSchema(types = []) {

  //   let schema = fileLoader(__dirname + '/schema/api/', {
  //     recursive: true,
  //   });

  //   // apiSchema = mergeTypes([apiSchema.concat(schema)], { all: true });


  //   return schema;

  // }


  // getExcludableApiTypes(){
  //   return [
  //     "UserCreateInput",
  //     "UserUpdateInput",
  //     "UserGroupCreateInput",
  //     "UserGroupUpdateInput",
  //   ];
  // }


}
 

export default InnerModule;

it("fake", () => {
  
})