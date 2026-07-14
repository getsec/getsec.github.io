---
title: "Six Months of AWS Keys in a Public Repo: Reading CISA's Own Postmortem"
description: "CISA published an after-action report on its own credential leak. The report is better than most, and it grades itself 'worked well' on the exact thing that took six months to work."
date: 2026-07-14
---

CISA published a postmortem on its own breach. You should read it. It is better
than what most companies produce, it advocates for secrets scanning and for
being nice to security researchers, and a national cyber agency saying that out
loud is new.

It also puts "Take External Reporting Seriously" in the **What Worked Well**
column, which is a hell of a thing to write about an incident that took six
months to notice.

## What happened

A contractor at Nightwing had a public GitHub repo called `Private-CISA`. The
name is the funniest part of this entire story and we are only in paragraph
three.

Inside: 844 MB of CISA material. A file named `importantAWStokens` with admin
credentials to three AWS GovCloud accounts. A file named
`AWS-Workspace-Firefox-Passwords.csv` with plaintext usernames and passwords for
dozens of internal systems. Infrastructure-as-code, build code, logs, and creds
to CISA's internal artifactory, which is the box where every software package
they build from lives. Philippe Caturegli of Seralys, who validated the keys,
pointed out what that last one means: backdoor a package there and you get
redeployed everywhere, forever, by the victim's own CI. That's not a leak, that's
a supply chain with a welcome mat.

The repo was created November 13, 2025. It came down May 16, 2026.

Best guess at motive, per Caturegli: the guy was syncing files between his work
laptop and his home computer. That's it. No espionage, no grand betrayal. A man
wanted his files in two places.

The passwords were the platform name plus the current year.

He had also explicitly disabled GitHub's secret scanning. GitHub tried to stop
this. It got clicked through.

Guillaume Valadon at GitGuardian found it on May 14 and it was gone in 26 hours,
because he gave up on the normal channels and called Brian Krebs.

## The part that's actually good

I want to be fair here, because the easy version of this post is dunking on CISA
for a whole page and I'd rather write the useful one.

The postmortem is real. It names what broke. It says "we had no GitHub playbook
and had to write one during the incident," which is an embarrassing sentence to
publish and exactly the kind that helps somebody else. It says key
rotation took longer than expected. It admits its reporting channels were so bad
that the researcher had to route through a journalist to get anyone's attention.

The forensics hold up too. CISA says its logs showed the leaked credentials were
never used outside CISA's environments and no customer or mission data was
touched. That's not a PR line, that's a claim you can only make if you actually
had the logging to back it, and plenty of orgs in this spot cannot make it. They
also rotated credentials across every environment the contractor administered
rather than only the ones in the file, which is the correct paranoid move and
more work than the minimum.

Most companies bury this. CISA wrote it down and put its name on it. Valadon,
the guy who found the leak, called the postmortem itself the biggest takeaway,
and he's right.

Now the part that bugs me.

## Nine emails

GitGuardian scans public repos and automatically emails whoever's leaking. They
sent nine alerts about this repo. Nine. Nobody answered a single one.

When Valadon escalated, he emailed the contractor, filed through CISA's
vulnerability disclosure platform (built for bugs in the broader cybersecurity
community, not for "your pants are down"), went through CERT/CC, and finally
handed it to a reporter.
The only thing that worked was the reporter.

Now go read the report's What Worked Well section: "Take External Reporting
Seriously. It is important to take cybersecurity tips and external reporting
seriously. In this instance, a security researcher, through an investigative
reporter, notified CISA and continued to share information with the agency
throughout the incident."

The phrase "through an investigative reporter" is sitting right there in the
success column, doing an enormous amount of unpaid labor.

CISA does own this, sort of. Four bullets down, under What Can Be Strengthened,
"Simplify Incident Reporting Channels" describes the whole ugly path honestly.
So the information is all in the document. But splitting one failure into a
flattering half and an unflattering half, then filing them in different columns,
is how a postmortem starts optimizing for how it reads instead of what it
teaches. The org that answers on alert one and the org that answers on Krebs
both end up writing "we took external reporting seriously." Only one of them did.

If your response only starts when a journalist calls, you don't have a reporting
channel. You have a press office with a really long fuse.

## "Within moments"

The report opens the response section with: "Within moments of receiving this
information, CISA's Office of the Chief Information Officer took swift and
comprehensive action."

Within moments of *receiving this information*. Every clock in that document
starts on May 15, the day a reporter called. Measured from there, the response
looks great. Measured from November 13, when the repo went up, it took six months
and a byline.

This isn't unique to CISA, which is why it's worth calling out. Everybody's
incident timeline starts at detection, because that's when the pager goes off and
that's what the tooling records. But the attacker's clock started in November.
Detection *is* the incident. A response that's fast from the moment you find out
and slow to find out is a slow response wearing a good watch.

## Rotation is not a button

Here's the one I'd staple to a wall. GitHub account gone, repo gone, everyone
notified, and the AWS keys stayed valid for another 48 hours.

CISA's explanation is honest: complexity, and interconnections with federal and
industry partners, made rotation slower than anticipated. Translation: too many
things load-bearing on one credential, and nobody knew all of them, so pulling it
meant finding out what fell over. Everyone reading this has that credential. You
know the one. It's in a Terraform state file and a Jenkins job from 2019 and one
guy's laptop.

Valadon's line is the sharpest in any of the writeups: if you cannot rotate a
credential quickly, you do not have operational control over it. The key owns
you, and you pay the rent in uptime.

So test the rotation. Not the runbook that says you can rotate. The rotation. If
"revoke this key" is a two-day project during an incident where you *know*
attackers have the key, the number that matters isn't your MTTD, it's how long
the door stays unlocked after you've seen the guy standing in it.

## Controls you can click through aren't controls

The contractor turned off GitHub's push protection. That's the detail I keep
chewing on, because push protection worked. It fired. It said don't do this. And
it lost, because it was built to be overridden by the person it was constraining.

Look at CISA's corrective action: they moved upload restriction into EDR. Devs
can still pull from public repos, but pushing to one now hits a control that
lives outside the developer's account and can't be toggled by the developer.
That's the right call, and it's the whole lesson in one config change. A guardrail
that the guy in a hurry can dismiss is a speed bump with a security budget.

Same energy as CISA's other admission: secrets made it into their *private* repos
too. The public repo is what made the news, but "no repository should contain
secrets, yet secrets made it into CISA private repositories" is the sentence that
should scare you, because that one is definitely true at your company. A private
repo is an audience setting wearing a control's clothes, and audiences change.

## What to steal from this

- **Answer the robots:** nine automated emails is not spam, it's nine chances.
  Somebody should own the inbox that receives "your infrastructure is leaking,"
  and it must not be the same queue as "bug in your product."
- **Publish a security.txt, then don't stop:** a leak report about *you* needs an
  obvious front door. If a researcher has to find a reporter, the door doesn't
  exist.
- **Scan continuously, and scan inward:** public GitHub monitoring caught this
  in six months. Internal scanning could have caught the plaintext CSV before it
  ever left the building.
- **Write the GitHub playbook now:** CISA didn't have one and burned early
  incident hours writing it live. A leaked credential is its own kind of
  incident. Who revokes? Who calls GitHub? Who reads git *history*, not just
  the working tree?
- **Rehearse the rotation:** pick your scariest key. Rotate it Tuesday. Find out
  what breaks while nobody's attacking you.
- **Move the guardrail off the honor system:** if the person a control
  constrains can switch it off, it's a suggestion.
- **Consolidate dev environments:** personal GitHub accounts, contractor laptops,
  and someone's clever sync script all live outside your controls by definition.
  That's where this started. A guy just wanted his files on two computers.

## The actual takeaway

The Nightwing contractor is not the story. Give a few thousand engineers a
deadline and a home computer and you will manufacture this guy on demand. He is
weather.

The story is that the agency that writes everyone else's secret-scanning guidance
had users who could push to public repos, secrets in private repos, no cloud
playbook, an unanswerable abuse inbox, and keys it couldn't rotate inside two
days. Not because CISA is stupid. Because that is the default state of every
organization that ships software, and CISA is down nearly a third of its
workforce and still shipping.

So don't read the postmortem as a story about CISA. Read it as your own
pre-mortem, published early, by someone else, for free. Somebody already paid for
this lesson. The least you can do is not buy it twice.

And go check if anyone's answering that abuse inbox.
