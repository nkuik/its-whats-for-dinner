import {
  Duration,
  Fn,
  Stack,
  StackProps,
  aws_events as events,
  aws_iam as iam,
} from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as sns from "aws-cdk-lib/aws-sns";
import { Chain, Parallel, StateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { LambdaInvoke } from "aws-cdk-lib/aws-stepfunctions-tasks";
import { Construct } from "constructs";
import * as path from "path";

export class ChefGPT extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const lambdaProps = {
      runtime: lambda.Runtime.NODEJS_18_X,
      architecture: lambda.Architecture.ARM_64,
      handler: "lambdaHandler",
      timeout: Duration.seconds(30),
      memorySize: 256,
      bundling: {
        minify: true,
        keepNames: true,
        sourceMap: true,
        externalModules: [
          "@aws-sdk/*", // Use AWS SDK v3 available in the Lambda runtime
        ],
        nodeModules: [],
      } as nodejs.BundlingOptions,
    };

    const chatLambdaName = Fn.importValue("chatLambdaName");
    const chatLambdaArns = Fn.split(",", Fn.importValue("chatLambdaArns"));

    // HistoricRecipes Persistence
    const historicTable = new dynamodb.Table(this, "HistoricRecipes", {
      partitionKey: { name: "yearWeek", type: dynamodb.AttributeType.STRING },
    });

    const getItem = new iam.PolicyStatement({
      actions: ["dynamodb:GetItem"],
      resources: [historicTable.tableArn],
    });

    const retrieveHistoricRecipes = new NodejsFunction(
      this,
      "RetrieveHistoricRecipes",
      {
        ...lambdaProps,
        entry: path.join(
          __dirname,
          `/../lambdas/retrieve-historic-recipes/index.ts`,
        ),
        environment: {
          DYNAMODB_TABLE_NAME: historicTable.tableName,
        },
      },
    );

    retrieveHistoricRecipes.role?.attachInlinePolicy(
      new iam.Policy(this, "HistoricRecipesGetItem", {
        statements: [getItem],
      }),
    );

    retrieveHistoricRecipes.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole",
      ),
    );

    const invokeChatLambda = new iam.PolicyStatement({
      actions: ["lambda:InvokeFunction"],
      resources: chatLambdaArns,
    });

    const findRecipes = new NodejsFunction(this, "FindRecipes", {
      ...lambdaProps,
      entry: path.join(__dirname, `/../lambdas/find-recipes/index.ts`),
      environment: {
        CHAT_LAMBDA_NAME: chatLambdaName,
      },
      timeout: Duration.minutes(14),
    });

    findRecipes.role?.attachInlinePolicy(
      new iam.Policy(this, "InvokeChatLambda", {
        statements: [invokeChatLambda],
      }),
    );

    findRecipes.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole",
      ),
    );

    const putItem = new iam.PolicyStatement({
      actions: ["dynamodb:PutItem"],
      resources: [historicTable.tableArn],
    });

    const persistRecipes = new NodejsFunction(this, "PersistRecipes", {
      ...lambdaProps,
      entry: path.join(__dirname, `/../lambdas/persist-recipes/index.ts`),
      environment: {
        DYNAMODB_TABLE_NAME: historicTable.tableName,
      },
    });

    persistRecipes.role?.attachInlinePolicy(
      new iam.Policy(this, "PersistRecipesPutItem", {
        statements: [getItem, putItem],
      }),
    );

    persistRecipes.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole",
      ),
    );

    const notificationTopic = new sns.Topic(this, "RecipeNotificationTopic", {
      displayName: "Recipe notification topic",
      topicName: "recipeNotificationTopic",
    });

    const sendEmail = new iam.PolicyStatement({
      actions: ["sns:Subscribe", "sns:Publish", "sns:ListSubscriptionsByTopic"],
      resources: [notificationTopic.topicArn],
    });

    const emailRecipes = new NodejsFunction(this, "EmailRecipes", {
      ...lambdaProps,
      entry: path.join(__dirname, `/../lambdas/email-recipes/index.ts`),
      environment: {
        SNS_TOPIC_ARN: notificationTopic.topicArn,
        EMAIL_ADDRESSES: "nathan.kuik@gmail.com",
      },
    });

    emailRecipes.role?.attachInlinePolicy(
      new iam.Policy(this, "EmailRecipesPolicy", {
        statements: [sendEmail],
      }),
    );

    emailRecipes.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole",
      ),
    );

    const retrieveHistoricRecipesInvocation = new LambdaInvoke(
      this,
      "Retrieve Historic Recipes",
      {
        lambdaFunction: retrieveHistoricRecipes,
        outputPath: "$.Payload",
      },
    );

    const findRecipesInvocation = new LambdaInvoke(this, "Find Recipes", {
      lambdaFunction: findRecipes,
      outputPath: "$.Payload",
    });

    const emailRecipesInvocation = new LambdaInvoke(this, "Email Recipes", {
      lambdaFunction: emailRecipes,
    });

    const persistRecipesInvocation = new LambdaInvoke(this, "Persist Recipes", {
      lambdaFunction: persistRecipes,
    });

    const handleRecipesParallel = new Parallel(this, "Handle Recipes")
      .branch(emailRecipesInvocation)
      .branch(persistRecipesInvocation);

    const retrievalChain = Chain.start(retrieveHistoricRecipesInvocation)
      .next(findRecipesInvocation)
      .next(handleRecipesParallel);

    const recipeFinderSM = new StateMachine(this, "ChefGPT", {
      definition: retrievalChain,
      timeout: Duration.minutes(15),
    });

    const fridayTrigger = new events.Rule(this, "everyWeekOnFriday", {
      schedule: events.Schedule.cron({
        minute: "0",
        hour: "16",
        month: "*",
        weekDay: "THU",
      }),
      eventPattern: {
        // TODO: Pass in the menu request as the event
        source: ["my.app"],
        detailType: ["my.event"],
      },
    });

    fridayTrigger.addTarget(new targets.SfnStateMachine(recipeFinderSM));
  }
}
