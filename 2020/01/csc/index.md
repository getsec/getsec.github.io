# 🙏🏼 Cloud Security Commandments



## Preface
The following list is my opinion on some of the top cloud controls that should be enabled within your environment. These can be security controls, processes, procedures or systems you create to manage and monitor your resources and users.

## The List
1. Thou shalt use encryption everywhere. If its a checkbox, it gets turned on.
2. Thou shalt not create public facing infrastructure without authorization or approval
3. Thou shalt not blindly grant administration privileges to any principal
4. Thou shalt follow the principle of least privilege when you are deploying policies or permissions
5. Thou shalt not modify firewall rules to allow for all traffic.
6. Thou shalt leverage key based authentication over password based authentication if applicable
7. Thou shalt not allow third party access into an environment without proper approval, consent, and documentation.


## Thou shalt use encryption everywhere.
Server side encryption in most cloud environments is quite trivial to enabled. Leveraging this is a quick win for most standards including the CIS AWS standard. The issues I’ve encountered with attempting to enable encryption everywhere is working in environments where developers have already had the right to create non-encrypted resources. A quick win for this section would be working with the new environment onboarding team to enable this option by default, or create resource policies and permissions to disallow the creation of unencrypted resources.

## Thou shalt not create public facing infrastructure without authorization or approval (as well as documentation and reason for public needs)
Look at the news, look at the breach report. How many of these are due to public infra. S3 Buckets, Azure Storage, EC2 instances, etc.. No infrastructure should be publicly accessible without proper approval. As an example, S3 buckets do not need to be opened to the internet, If you want to serve static content, use S3 and CloudFront with a web app firewall rule. For this commandment you may want to create a policy that disallows the creation of public infrastructure. Work with information security teams and cloud environment owners.

## Thou shalt not blindly grant administration privileges to any principal
We’ve all done this at some time. Somethings not working, you slap an admin policy on a user or role, and then you forget about it (scope creep). Ensure your users do not have the access to do this. If an account with administration rights were to get compromised, you will not be having a good time. My words of advise is to implement a system that revokes administration rights when they are attached to any principal. I’ve done this by creating a lambda that scans all IAM roles and users, if it see’s a policy with administration rights, it removes it and reports it to the user and the security team.

## Thou shalt follow the principle of least privilege when you are deploying policies or permissions
This is similar to the third commandment. I’ve had some hard time defining what least privilege is when I worked for other employers. Is least privilege the implementation of ONLY the specific API’s, or is it for the implementation of a suite of services / API’s required to do the job needed. I have done a lot here and in my personal opinion, I believe that creating the policies and permissions for a set of API’s or services allows for a quick implementation of least privilege. As an example, if I want to setup least privilege for a data analytics team in AWS. I would grant permissions for S3 (only buckets needed), Sage Maker, Glue, KMS (Encrypt/Decrypt), and any other services they would need to do their work. If I was creating a policy for infrastructure teams, I would give them access to manage EC2 instances in the VPC, r/w access to the needed buckets, access to create certain (non administrative) IAM instance profiles, systems manager access and whatever else they may need. I would not give them the PowerUsers policy, although that may be the fastest way, it grants them way more privileges than they need.

# Thou shalt not modify firewall rules to allow for all traffic.
This is a personal one for me. I’ve had to deal with a lot of environments where developers had opened security groups open to the internet, while this is not necessarily malicious, it allows for attackers to scan and attempt to brute force access into our environment. To be clear, most developers who do this don’t do it with malicious intent, normally they need to test to make sure somethings working - or they do this as a troubleshooting step, so don’t get too upset at the devs. 

## Thou shalt leverage key based authentication over password based authentication if applicable
Password based auth bad. Key based auth good. 

[I’m going to refer to this stack overflow post.](https://superuser.com/questions/303358/why-is-ssh-key-authentication-better-than-password-authentication)

## Thou shalt not allow third party access into an environment without proper approval, consent, and documentation.
In AWS you can allow any other AWS account with access to your environment through Trusted Roles. Take precaution with leveraging this option. Ensure you have thoroughly vetted the security of the third party, and have signed a proper agreement. Set the permissions or policies on this role to be very restrictive	. The less this role can do, the more minimal the impact if the role was to be leveraged with malicious intent.

