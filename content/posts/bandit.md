+++
title = "Security checking for python"
date = "2020-01-29 10:04:03.128"
author = "Nathan Getty"
tags = ["AWS", "Amazon", "info", "enumeration"]
keywords = ["AWS", "Amazon", "info", "enumeration"]
description = "running security checks on your python code!"
showFullContent = false
+++


# The basics
Today we will be talking about bandit, a python static analysis tool that reviews your code for possible security flaws. We will be using bandit, lets create a virtual environment and use pip to install bandit.

```sh
python -m venv venv
source venv/bin/activate
pip install bandit
```

Lets use the following application below as an example.

```py
from os import system

system('sudo su')
```

Obviously using sudo su in a shell process isn't good practice, but we're just showing off the capabilities of bandit. So, lets run bandit against our file.

```sh
bandit app_name.py
```

> Below is an example of the response

```
Test results:
>> Issue: [B605:start_process_with_a_shell] Starting a process with a shell: Seems safe, but may be changed in the future, consider rewriting without shell
   Severity: Low   Confidence: High
   Location: bad.py:3
   More Info: https://bandit.readthedocs.io/en/latest/plugins/b605_start_process_with_a_shell.html
2
3       system('sudo su')

--------------------------------------------------
>> Issue: [B607:start_process_with_partial_path] Starting a process with a partial executable path
   Severity: Low   Confidence: High
   Location: bad.py:3
   More Info: https://bandit.readthedocs.io/en/latest/plugins/b607_start_process_with_partial_path.html
2
3       system('sudo su')

--------------------------------------------------

Code scanned:
        Total lines of code: 2
        Total lines skipped (#nosec): 0

Run metrics:
        Total issues (by severity):
                Undefined: 0.0
                Low: 2.0
                Medium: 0.0
                High: 0.0
        Total issues (by confidence):
                Undefined: 0.0
                Low: 0.0
                Medium: 0.0
                High: 2.0
Files skipped (0):
```

This is pretty nice it gives us all the results we need. We can use these results in a bunch of different ways, but in what I do is grep the report and look to see if there are any "High or Medium" severity items, and then kill the CI/CD pipeline.

## VSCode Implementation

In VSCode, what you can do is use CMD+Shift+P while in your python application and select linter, and choose bandit, you may be asked to install it, choose yes, ensure you tell VSCode to use bandit once more, and now, if you hover over the marked text, you will see the error/warnings.