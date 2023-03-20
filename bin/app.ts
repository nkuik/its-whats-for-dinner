#!/usr/bin/env node
/* eslint-disable no-console */

import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { ChatStack } from "../src/stacks/chat";
import { RecipeFinderStack } from "../src/stacks/recipe-finder";

const app = new cdk.App();

new ChatStack(app, "ChatLambda", {
  openaiSecretName: "openai-api-key",
});

new RecipeFinderStack(app, "RecipeFinder", {});
