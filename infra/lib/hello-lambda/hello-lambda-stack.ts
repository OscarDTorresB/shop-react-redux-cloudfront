import {
  Duration,
  Stack,
  StackProps,
  aws_apigateway,
  aws_lambda,
} from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";

export class HelloLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const lambdaFunction = new aws_lambda.Function(
      this,
      "hello-lambda-function",
      {
        runtime: aws_lambda.Runtime.NODEJS_24_X,
        memorySize: 1024,
        timeout: Duration.seconds(5),
        handler: "handler.main",
        code: aws_lambda.Code.fromAsset(path.join(__dirname, "./")),
      }
    );

    const apiGateway = new aws_apigateway.RestApi(this, "my-api", {
      restApiName: "My API Gateway",
      description: "This API serves the Lambda functions",
    });

    const helloFromApiIntegration = new aws_apigateway.LambdaIntegration(
      lambdaFunction,
      {
        proxy: false,
        requestTemplates: {
          "application/json": `{ "message": "$input.params('message')" }`, // Map the query param message
        },
        integrationResponses: [
          {
            statusCode: "200",
          },
        ],
      }
    );

    // Create resource /hello and GET request
    const helloResource = apiGateway.root.addResource("hello");
    helloResource.addMethod("GET", helloFromApiIntegration, {
      methodResponses: [{ statusCode: "200" }],
    });

    // Apply CORS
    helloResource.addCorsPreflight({
      allowOrigins: ["https://dsnj73sfotids.cloudfront.net"],
      allowMethods: ["GET"],
    });
  }
}
