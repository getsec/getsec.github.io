# 🤠 Bandit on the loose

## Preface

Today I would like to share with you some security tips when using python. We can use static linting to check our code for possible security flaws leveraging *bandit*. There will be some pretty obvious indicators of bad programming within this document, but only to demonstrate the use cases of the *bandit*. Not to highlight my inability to program. ☕️

## Jumping into it

First as always, we will create a virtual environment. We dont want to muck around with any of our old dependencies. [I love environments](https://xkcd.com/1987/)
```sh
python -m venv venv
source venv/bin/activate
pip install bandit
```

We can leverage the system function from the os library and pass in some pretty naughty input. *No reason for that to be there.*

```py
from os import system

system('sudo su')
```

Lets run bandit against our app to see if there are any issues it finds with aforementioned code snippet.

```sh
bandit app_name.py
```


### Example Output


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


## Hey Nathan! What if I want to do this in a CI/CD thing?

Oh damn jimmy, thats a pretty good idea. Now, I dont have an exact example but I this is how I would implement such a plan.


1. With your CI/CD tool install the bandit library during your pre-build phase
2. Create a shell script to run bandit and parse the output for something you'd want. this is only *psuedo code*
``` bash
function run_bandit(){
        SEARCH_STR="Severity: HIGH "
        # Run bandit first of all, which is good
        bandit $MY_FILE 
        bandit $MY_FILE | grep $SEARCH_STR
}

# Run the bandit function and check to see if it passed
# in the if statement, if the grep fails, that means we should get an exit code non-zero. Which means nothing was found
# if we get a 0, that means the search string matched, which means we found something bad
run_bandit

if [ $? -ne 0 ]
then
        echo "We're good"
        exit 0
else
        echo "Uh oh, looks like we found some errors!"
        echo "STOPPING BUILD"
        exit 1
fi

```
