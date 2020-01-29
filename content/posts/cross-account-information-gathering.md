---
title: "Describe all the things in AWS"
date: "2020-01-29 10:04:03.128"
author: "Nathan Getty"
cover: ""
tags: ["AWS", "Amazon", "info", "enumeration"]
keywords: ["AWS", "Amazon", "info", "enumeration"]
description: "How can we get a load of information fast..."
showFullContent: False
---

## How can query multiple accounts for a lot of informaiton.

Well theres a few ways we can do this. Honestly what I beleive is that leveraging a cross account role in each account is one the best ways to hadle this. This allows for us to have the one spot for control and access. If you have a way to deploy this role in an automated way, that would be best.

## Ok so whats the deal, cant we just loop and shoot.

So, we can iterate through each account and each region you operate in and do some math. The factors we will be using is events x accounts x regions. Lets say you have 20 AWS accounts and operate in three seperate regions, you want to run 50 API calls to find information about your environment, so what do you do. Write a *for loop* to iterate over that.

Well, lets see what happens when we want to expand that...

| Accounts  |  Regions |  API Calls | ~ Time | Total Time (sec) | Total Time (min)
|---|---|---|----|----|----|
| 5   | 3 |  50 |  ~2s | ~1500s  | ~25m|
| 10  | 3 |  50 |  ~2s | ~3000s | ~50m|
| 30  | 3 |  50 |  ~2s | ~4500s   |~75m|
| 50  | 3 |  50 |  ~2s | ~15000s  |~250m|
| 100 | 3 |  50 |  ~2s | ~30000s  |~500m|
| 500 | 3 |  50 |  ~2s | ~150000s   |~2500m|

> Yeahhhhhhhhh..... That doesnt really scale well does it...

Well, I'm not that great of a programmer, however, I worked with some other developers to create a set of scripts that allows us to query AWS endpoints through multi-processing. We're currently working on getting this deployed across the environment, but I wanted to share this with you. From now on we will refer to this repo: [FiringRange](https://github.com/getsec/FiringRange)


# Quick rundown of what the repo holds

Long story short, it holds two scripts, which leverage some stuff in the helpers directory, what it does is assume role (you can update this in the barage or sniper script), and then run the commands passed in (refer to the README for more info). This is your run of the mill method, this doesnt really make things faster. Thats where the mp-barrage.py script comes along.

The MP Barrage script reads in commands from the gather-information directory, assigns them to a list, and dynamically generates a list of functions to run. It leverages the asyncio gather method, and runs them all at once. Check down below and I will show you a comparison of timing.

# The traditional method
For testing purposes we will use the same test case for both situations.

*One Account, Two Regions, Five seperate API calls*

- aws ec2 describe-instances
- aws ec2 describe-security-groups
- aws s3 list-buckets
- aws iam list-roles
- aws iam list-policies

To test the barrage script we will use the following loop:
```sh

time python3 barrage -m -o -c "aws ec2 describe-instances"       # 5.208 total
time python3 barrage -m -o -c "aws ec2 describe-security-groups" # 5.268 total
time python3 barrage -m -o -c "aws s3 list-buckets"              # 2.859 total
time python3 barrage -m -o -c "aws iam list-roles"               # 5.516 total
time python3 barrage -m -o -c "aws iam list-policies"            # 14.037 total

```

Thats a total of roughly 32 / 33 seconds. Now if we run this with the MP Barrage script the time should be down drasically. For this test we will replace the all-cmds file with only the API requests above.

```sh 
time python mp-barrage.py  # 13.672 total
```

Damn - pretty much sheds the time in half, currently I dont have the ability to run the old barrage script against multiple endpoints easily, but if we use the mp-barrage script, to scan one account, in three regions, with 41 endpoints, this is how long it takes.

> Keep in mind I'm running this script on a 12 core computer - It maxes each core for the whole 13 seconds ^.^

# Examples
Example of the time running the script
[![asciicast](https://asciinema.org/a/2cShOQoo5sEQW80AdC7t62YSb.svg)](https://asciinema.org/a/2cShOQoo5sEQW80AdC7t62YSb)


Example of the output being filled up.
[![asciicast](https://asciinema.org/a/oTQno3cqlNfNM5eV9qAGZGevg.svg)](https://asciinema.org/a/oTQno3cqlNfNM5eV9qAGZGevg)

# Conclusion

Based off the above input it seems that this method provides a very fast and efficient way to query lots of AWS API endpoints to gather information.

Hopefully this helps you all out :D