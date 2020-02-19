# AWS Automated Remediation - Part 2: S3 Buckets



## Prelude

Hey! Welcome back! This is the second iteration in our path to secure our AWS environments. Today we’re going to take a look at S3 buckets. You’ve all seen the news, S3 bucket made public, company X has leaked secrets about x,y, or z.  Just some examples:

1.   [oh look](https://www.computerweekly.com/news/252476870/Exposed-AWS-buckets-again-implicated-in-multiple-data-leaks)
2.    [oh, another?](https://techcrunch.com/2019/08/09/aws-ebs-cloud-backups-leak/)
3.    [wait?!, Theres more!!?!?!](https://www.trendmicro.com/vinfo/us/security/news/cybercrime-and-digital-threats/misconfigured-aws-s3-bucket-leaks-36-000-inmate-records)

What if we could stop these when they happen! Not after the information gets leaked. Today we’re going to take look at how to automatically remove S3:GetObject permissions when they have the following bucket policies
```json
{
  "Version":"2012-10-17",
  "Statement":[
    {
      "Sid":"PublicRead",
      "Effect":"Allow",
      "Principal": "*",
      "Action":["s3:GetObject"],
      "Resource":["arn:aws:s3:::examplebucket/*"]
    }
  ]
}
```

Or if the a user allows [public list or write operations on the bucket?](https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html)

Since we looked at all the prerequisites in the [first iteration](https://getsec.github.io/2020/02/aws-remedy-1/) we will just be looking at some of the newer items like the code and the resources that we append to the template!

## Prerequisites

You should have an understanding of the above services, and some basic understanding of CloudFormation. This is imperative to deploying applications and services at scale.

Ensure you install [AWS SAM](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)

Ensure you have CloudTrail enabled. Took me some time when I cleaned my account out to figure out why this wasn’t working. Also make sure you configure a [CloudWatch log group for the CloudTrail](https://docs.aws.amazon.com/awscloudtrail/latest/userguide/send-cloudtrail-events-to-cloudwatch-logs.html)

## Main

### The Template
There is going to be a whole lot here, so lets break things down by their logical ID’s

#### S3RemediationLambda
This lambda will revoke public permissions on any S3 bucket that’s passed in, besides what is passed in as a whitelist parameter. Keep in mind the whitelist parameter that is passed in NEEDS to be in a list format [“name1”,”name2”]. Please take a look at the code, its fully documented with docstrings and descriptors for you!	

#### S3Schedule
This resource creates a CloudWatch event that will listen to CloudWatch and look for any AWS API calls that match 
```
PutBucketAcl
```

or 

```PutBucketPolicy```

 If they match it will pass the event to the target, in this case the lambda mentioned above.

#### S3LambdaInvokePermission
This is a crucial, but often mistaken (especially by me in my early days) function required to invoke the lambda. This resource give the events service the permission to invoke the lambda. Without this, The event would never trigger the lambda.


## Installing the infrastructure

### Update the repo

Update the repo
```bash
cd aws-auto-remediate
git pull
```

Update the template file and remove the
Create a bucket with a public policy (see above)
Create a bucket with an ACL that allows public-read
Edit both S3 events and make sure that your change the bucket to the one you created
Use sam to build the template and test the lambda locally

```bash
sam build && sam local invoke S3RemediationLambda -e events/s3_putbucketacl.json
[make sure the script runs and removes the ACL]

sam build && sam local invoke S3RemediationLambda -e events/s3_putbucketpolicy.json
[make sure the script runs and removes the ACL]
```

Awesome - Once you determined it ran completely fine, you are good to deploy

Now that we have validated everything is working. Lets deploy the CloudFormation template.
```bash
./deploy.sh
```

That will deploy the template in your account. You can re-run step 3 and 4 to make sure everything runs as expected

## Conclusion

Thanks for tuning in to part II. I hope this post can help further your cloud security and help you from being one of those companies that leaks data right into the hands of evil!

## Issues?!

If you have issues, or for some reason the code doesn’t work for you, create an issue for me on the GitHub page and I will do everything I can to help! Thanks a bunch :)
