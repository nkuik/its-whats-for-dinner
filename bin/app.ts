#!/usr/bin/env node
/* eslint-disable no-console */

import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { ChatStack } from "../src/stacks/chat";

const app = new cdk.App();

const chatStack = new ChatStack(app, "ChatLambda", {
  openaiSecretName: "openai-api-key",
});
