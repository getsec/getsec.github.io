---
title: "If You Didn't Read It, Why Should I?"
description: "Pasting raw LLM output into Slack or Jira doesn't save work. It moves your work onto everyone who reads it, and the research says the total cost goes up."
date: 2026-07-14
---

Someone asks a question in a channel. Forty seconds later a colleague drops in
nine hundred words under a heading that says **Key Considerations**, with three
bolded subheads, 75 em-dashes (*ps; how the fuck do you even type out an em dash*) 
and a closing paragraph explaining that the right approach depends on your 
specific requirements.

Nobody replies. What would you even say? The message has no position in it.
Somebody has to read the whole thing to discover that, and now that somebody is
everyone in the channel.

Your colleague thinks they helped. They spent forty seconds, and they mailed a
small invoice to every person in the room.

## The bill is measured

BetterUp Labs and the Stanford Social Media Lab named this in HBR last
September: **workslop**. AI output that looks finished but carries too little
substance to move the task, so the receiver does the thinking the sender
skipped. Their survey of ~1,000 US desk workers:

- 40% received workslop in the past month.
- Each instance costs **1 hour 51 minutes** to deal with.
- That's about **20 minutes longer than if the sender had done the work
  themselves.**

Sit with the third one. This isn't a trade where you save time at my expense.
The total labor goes *up*. You invented negative productivity and shipped it as
a favor. Call it $186/month per employee, roughly $9M a year at 10,000 people,
smeared across everyone's afternoon so it never shows up on a dashboard.

And 53% admit some of what they send is probably slop. So we know. We do it
anyway, because your own output never feels like slop to you. You were there for
the prompt. To everyone else it's a stranger's exhaust.

## The prompt is missing

An LLM response is half a conversation. It's shaped by your question, your
context, and the four turns where you corrected it. It's a reply to *you*.

Paste it into Jira,Slack,Teams,whatever and you strip all of that. The reader gets an answer with the
question amputated. They can't see what you asked, what you ruled out, or what
you'd already discarded before you hit copy. They have to reconstruct your
prompt by reading the answer backwards, and they'll get it wrong, because the
information isn't in the artifact. So they guess, then act on the guess, and now
we're four messages deep negotiating what a machine meant by "consider
implementing" to a person who left the conversation.


## Distillation was the whole job

Writing something short is expensive because you have to know what you think
first. You read the thing, decide what matters, throw away 90%, and put your
name on what's left. **That last step is the job. Everything before it is
preparation.**

When you paste the raw output, that work doesn't vanish. It fans out. One person
declines to spend ten minutes deciding what matters, so eight people each spend
six minutes guessing what the first person meant. You didn't remove the work.
You multiplied it by the channel size and made every copy worse, because those
eight have less context than you did and can't ask the model follow-ups.

Three sentences that say *I looked at this, here's what we should do, here's the
one risk* beat any volume of correct, comprehensive, beautifully formatted
output. Not because brevity is a virtue. Because those three sentences contain a
**decision**, and a decision is the only thing anyone in that channel needed
from you.

The tell that you skipped it is "that's just what the AI said." It means nobody
owns the message. You can't interrogate it, build on it, or even disagree with
it, because disagreeing requires someone holding a position. You've made
yourself a router, and routers don't get asked their opinion. Half the
recipients in that study rated the sender less capable and less reliable. You
didn't look fast. You looked like someone who doesn't check their work.

## The test is density, not disclosure

Sean Goedecke gets to the rule I couldn't:

> It's okay to show someone AI-generated output when the content density in that
> output is the same as what you'd get from a competent human.

His example: "can u add caching" expanded to three paragraphs. The model fills
the gap with what it has, which is nothing, so you get *caching is important to
avoid unnecessary work*. What you'd have written by hand: we re-fetch the user's
config every request and it costs ~20ms, this service already has Redis sitting
there, and the config service is scaling badly. Same request. One version has
three facts, the other has three shapes where facts go.

Density also kills the fix everyone reaches for first. A *disclosed* three-
paragraph answer to "can u add caching" is still garbage. Labelling handles the
deception and does nothing about the cost, and the cost was the problem. It cuts
the other way too: if a colleague writes in their language and a model puts it
into English, density is identical and the thinking is theirs. Any rule that
punishes them while waving through your nine hundred words of Key
Considerations has it backwards.

## The rules

- **Run the density check:** would a competent human use this many words to say
  this much? If not, you're sending packaging.
- **Read it before you send it:** all of it. If that's too much reading, notice
  you were about to make eight people do it instead.
- **Put your name on the claim:** not "the AI suggests" but "I think." If you
  won't say "I think," don't send it. That reluctance is information.


Use the model. This argument is downstream of finding it useful. But it's a tool
for *your* thinking, and thinking isn't a transferable artifact. The output is
scratch paper. Nobody wants your scratch paper.

That part is still your job. It was always the only part that was.

> pps; I used AI to help proofread and format/cataolog my thoughts on this,
  and yes, i've read it all...

*Sean Goedecke's ["Don't feed me AI slop"](https://www.seangoedecke.com/dont-feed-me-slop/)
is the better half of this argument. Workslop data: [BetterUp Labs and the Stanford Social Media Lab](https://hbr.org/2025/09/ai-generated-workslop-is-destroying-productivity), HBR, September 2025.*
