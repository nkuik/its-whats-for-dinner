import {
  Arn,
  ArnFormat,
  Duration,
  Stack,
  StackProps,
  aws_iam as iam,
} from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import * as path from "path";

export class ChatStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: StackProps & {
      openaiSecretName: string;
    },
  ) {
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
        nodeModules: ["chatgpt"],
      } as nodejs.BundlingOptions,
    };

    const secretsManagerPolicy = new iam.PolicyStatement({
      actions: [
        "secretsmanager:GetSecretValue",
        "secretsmanager:GetResourcePolicy",
        "secretsmanager:DescribeSecret",
        "secretsmanager:ListSecretVersionIds",
      ],
      resources: [
        Arn.format(
          {
            service: "secretsmanager",
            resource: "secret",
            resourceName: `${props.openaiSecretName}-*`,
            arnFormat: ArnFormat.COLON_RESOURCE_NAME,
          },
          Stack.of(this),
        ),
      ],
    });

    const chatLambda = new NodejsFunction(this, "chatLambda", {
      ...lambdaProps,
      entry: path.join(__dirname, `/../lambdas/chat/index.ts`),
      environment: {
        OPENAI_SECRET_NAME: props.openaiSecretName,
      },
    });

    chatLambda.role?.attachInlinePolicy(
      new iam.Policy(this, "OpenAIAPIKey", {
        statements: [secretsManagerPolicy],
      }),
    );

    chatLambda.role?.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSLambdaBasicExecutionRole",
      ),
    );
  }
}
