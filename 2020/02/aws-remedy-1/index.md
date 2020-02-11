# AWS Automated Remediation - Part 1: Security Groups

## Prelude

This is going to be the first in many auto-remediation blog posts! Each one will append more and more to our SAM template. I’m planning on making this a multi-part series where we develop a fully customized system to automatically remediating high risk findings.

It sure is annoying having to revoke open security groups. You have to log into the console, navigate to EC2, find the violation, and remove the open ingress port and CIDR range. In an enterprise environment with multiple accounts, this can take significant time and resources. So let's create a system that will do this for us!

We are going to use the following technologies today

AWS Serverless Application Framework
AWS Lambda
Python
AWS CloudWatch
Events
AWS IAM
Roles
Policies

## Prerequisites

You should have an understanding of the above services, and some basic understanding of CloudFormation. This is imperative to deploying applications and services at scale.

Ensure you install [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

Ensure you have CloudTrail enabled. Took me some time when I cleaned my account out to figure out why this wasn’t working. Also make sure you configure a [CloudWatch log group for the CloudTrail](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/send-cloudtrail-events-to-cloudwatch-logs.html)

## Main

### The Template
There is going to be a whole lot here, so lets break things down by their logical ID’s

#### SecurityGroupRemediationLambda
This is the lambda resource that we will be creating to do all the “work”. Its main job will to receive events, and leverage the boto3 library to remove open security groups and replace the IP ranges with the approved ones. It’s much better to update 0.0.0.0/0 to 10.0.0.0/8, than removing the CIDR range entirely. The CodeUri parameter refers to where the code is stored, and the handler parameter tells AWS Lambda where the to fund the function to execute. We also pass in some parameters and memory values as well. We also create a policy that will be attached to the lambda that allows it too invoke, and access to manage security groups.

#### ScheduledRule
This resource creates a CloudWatch event that will listen to CloudWatch and look for any AWS API calls that match AuthorizeSecurityGroupIngress. If they match it will pass the event to the target, in this case the lambda mentioned above.

#### LambdaInvokePermission
This is a crucial, but often mistaken (especially by me in my early days) function required to invoke the lambda. This resource give the events service the permission to invoke the lambda. Without this, The event would never trigger the lambda.


## Installing the infrastructure

### Download the starter repo

1. Clone the repo
```bash
git clone https://github.com/getsec/aws-auto-remediate.git 
```

2. Create an S3 bucket in your account for storing the AWS SAM templates
3. Edit the deploy script update the S3_BUCKET and REGION parameters to match accordingly. Ensure region is the same region in which your S3 bucket was created.

4. Create an empty security group and copy the security group id.
5. Use the bad_boy.sh script and pass in your security group id as the first parameter. This will add two bad security groups port 3389 and 22 open to the world.
```bash
./bad_boy.sh sg-05fe30eb67c909f27

```
Lets make sure that it applied the bad rules correctly
```bash
aws ec2 describe-security-groups —group-ids [your id]
```

Expected output:
```json
{
    "SecurityGroups": [
        {
            "Description": "testing",
            "GroupName": "testing",
            "IpPermissions": [
                {
                    "FromPort": 22,
                    "IpProtocol": "tcp",
                    "IpRanges": [
                        {
                            "CidrIp": "0.0.0.0/0"
                        }
                    ],
                    "Ipv6Ranges": [],
                    "PrefixListIds": [],
                    "ToPort": 22,
                    "UserIdGroupPairs": []
                },
                {
                    "FromPort": 3389,
                    "IpProtocol": "tcp",
                    "IpRanges": [
                        {
                            "CidrIp": "0.0.0.0/0"
                        }
                    ],
                    "Ipv6Ranges": [],
                    "PrefixListIds": [],
                    "ToPort": 3389,
                    "UserIdGroupPairs": []
                }
            ],
            "OwnerId": "736903191495",
            "GroupId": "sg-05fe30eb67c909f27",
            "IpPermissionsEgress": [
                {
                    "IpProtocol": "-1",
                    "IpRanges": [
                        {
                            "CidrIp": "0.0.0.0/0"
                        }
                    ],
                    "Ipv6Ranges": [],
                    "PrefixListIds": [],
                    "UserIdGroupPairs": []
                }
            ],
            "VpcId": "vpc-104dd578"
        }
    ]
}
```

Good, now lets test out the lambda function locally

6. Lets use AWS SAM and test out our lambda against our sg. In the project directory, open the events.json file within the events directory. Update the groupId parameter to match your security group

```bash
sam local invoke -e events/event.json 

```
And lets check that output

```json
{
    "SecurityGroups": [
        {
            "Description": "testing",
            "GroupName": "testing",
            "IpPermissions": [
                {
                    "FromPort": 22,
                    "IpProtocol": "tcp",
                    "IpRanges": [
                        {
                            "CidrIp": "10.0.0.0/8"
                        }
                    ],
                    "Ipv6Ranges": [],
                    "PrefixListIds": [],
                    "ToPort": 22,
                    "UserIdGroupPairs": []
                },
                {
                    "FromPort": 3389,
                    "IpProtocol": "tcp",
                    "IpRanges": [
                        {
                            "CidrIp": "10.0.0.0/8"
                        }
                    ],
                    "Ipv6Ranges": [],
                    "PrefixListIds": [],
                    "ToPort": 3389,
                    "UserIdGroupPairs": []
                }
            ],
            "OwnerId": "736903191495",
            "GroupId": "sg-05fe30eb67c909f27",
            "IpPermissionsEgress": [
                {
                    "IpProtocol": "-1",
                    "IpRanges": [
                        {
                            "CidrIp": "0.0.0.0/0"
                        }
                    ],
                    "Ipv6Ranges": [],
                    "PrefixListIds": [],
                    "UserIdGroupPairs": []
                }
            ],
            "VpcId": "vpc-104dd578"
        }
    ]
}
```

Awesome - it looked like it worked perfectly!

8. Now that we have validated everything is working. Lets deploy the CloudFormation template.
```bash
./deploy.sh
```

9. That will deploy the template in your account. Now all we have to do for a final test, is use the bad_boy script again and wait for our deployed lambda to remediate it!

## Conclusion

I hope this helps you in your organization. I plan to make this a multi-part series where we develop and deploy a suite of automated controls to remediate high risk issues across all our environments!

If you have an issues or questions, you can reach me via email (it’s in the socials on the blog). If you want to make any updates or changes to the pipeline - make sure you put in a PR on GitHub and we can work through it!
