import { Duration, Stack, StackProps, aws_lambda } from "aws-cdk-lib";
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
  }
}
