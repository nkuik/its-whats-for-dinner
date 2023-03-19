import { Duration, Fn, Stack, StackProps, aws_iam as iam } from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";

export class RecipeFinderStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const lambdaProps = {
      runtime: lambda.Runtime.NODEJS_18_X,
      architecture: lambda.Architecture.ARM_64,
      handler: "lambdaHandler",
      timeout: Duration.seconds(300),
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
      "retrieveHistoricRecipes",
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

    const findRecipes = new NodejsFunction(this, "findRecipes", {
      ...lambdaProps,
      entry: path.join(__dirname, `/../lambdas/find-recipes/index.ts`),
      environment: {
        CHAT_LAMBDA_NAME: chatLambdaName,
      },
      timeout: Duration.minutes(5),
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

    const persistRecipes = new NodejsFunction(this, "persistRecipes", {
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
  }
}
