---
title: "I'm Making a Game. The Agents Are Doing the Typing."
description: "I'm building Dead Keys, a typing roguelike where your keyboard is your build. Most of this post is about the rig that builds it: parallel Claude Code lanes in herdr, a planner that edits nothing, a human queue in beads, and a phone dashboard so I can answer my agents from the couch."
date: 2026-09-25
---

I'm making a game. That's the first time I've said it in public, so let's get
it out of the way before I lose my nerve.

It's called **Dead Keys**. You get a little of it below, but most of this post
is about the thing I actually find more interesting: the rig that builds it.
Several Claude Code sessions working at once, each on its own issue in its own
git worktree, a planner that hands out the work, and a web app on my phone that
tells me when one of them needs me. Did I use AI? Yup. That's kind of the whole
post.

## The game, a little

Picture Monkeytype: a line of text, a caret, one accent colour, nothing in your
way. Now make every correct keystroke an attack.

- A run is nine floors of real-time fights. Enemies swing on a visible timer.
- Typing is strict. A wrong key doesn't move the caret: it breaks your combo
  (up to 3× damage on a 100-key streak) and pulls the enemy's next hit closer.
- **Your keyboard is your inventory.** Rewards are modifiers you socket into
  characters and key classes, so a vowel build plays nothing like a punctuation
  build. You also shape the text you'll face, which makes a bracket build a plan
  instead of a prayer.
- It's for keyboard nerds. On supported boards it reads your actual physical
  keyboard, and lighting it up is on the list.
- A daily seeded run: same seed for everyone, one attempt, and a leaderboard.

It's built in Godot 4.7, Steam is on the roadmap, and that's all you get for
now. More when it's something you can play.

## The problem: five agents, one checkout

It started the way it starts for everyone. One Claude Code session, then two,
then five, all in the same checkout, making 50 to 70 commits a day. What held it
together was a growing pile of rules in `CLAUDE.md`: re-read a file before you
edit it, commit through a temporary index, and eventually "one session commits
for everyone," which is exactly as fun as it sounds. A half-edited script in one
session broke every other session, and my Windows build with them.

Before fixing it, I had an agent replay the git history: take each file's
consecutive changes, merge them with `git merge-tree` as if both had started
from the same base, and count how often they would have conflicted.

| File | Changes | Would have conflicted |
|---|---|---|
| `tests/run_tests.gd` | 45 | 50% |
| `DECISIONS.md` | 27 | 57% |
| `ui/main.gd` | 18 | 41% |
| `ui/fight_screen.gd` | 34 | 36% |

Every feature appended to the same test file, the same decisions doc, the same
`_ready()`. So the fix was two things: isolate the sessions, and reshape the
repo so parallel work rarely touches the same lines. Decisions moved out of a
Markdown file and into the issue tracker, where they can't conflict at all.

## The pieces

None of this is from scratch, and it'd be dishonest to pretend otherwise:

- [**herdr**](https://herdr.dev) is a terminal workspace manager for AI coding
  agents. Workspaces and panes, plus the bit that matters here: it knows which
  panes are agents, whether each one is working, idle or blocked, and it'll hand
  you any agent's screen with `herdr agent read`.
- [**beads**](https://github.com/steveyegge/beads) (`bd`) is an issue tracker
  that lives in the repo and is built for agents to drive. Every worktree shares
  one database through git's common directory, so a claim made in one lane shows
  up in every other lane instantly, with nothing to push or pull.
- [**herdr-beads**](https://github.com/miiraheart/herdr-beads) is miiraheart's
  beads board for herdr: a Rust/ratatui List, Table and Kanban you dock beside
  your agents. [My fork](https://github.com/getsec/herdr-beads) adds the human
  queue and the web app further down.

What I built is the glue: about a thousand lines of shell in the game repo
(tests included), a few Claude Code hooks, and a `CLAUDE.md` that tells every
session how to behave.

## Lanes

A **lane** is one beads issue, one git worktree, one branch and one Claude
session. Starting one is `claude -w 50s`, which makes `.claude/worktrees/50s` on
branch `worktree-50s`, working on issue `dead-keys-50s`. The name is the
contract, and everything downstream is derived from it.

Git does the setup, not me. Git runs `post-checkout` inside every new worktree,
however it was made (`claude -w`, `git worktree add`, a subagent's worktree), and
that hook calls `tools/lane_setup.sh`:

1. It writes a gitignored `override.cfg` that gives the lane its own Godot
   `user://` folder. Before this, every checkout shared one: two test suites
   wrote the same progress file, and the test runner saved *my* settings back
   after changing them.
2. It sets the branch's upstream to `main`, so a bare `git rebase` does the
   right thing.
3. It copies my keyboard's firmware export in and runs a headless Godot import
   (about 4 seconds), so the tests work straight away.

Then a `SessionStart` hook, `tools/lane_start.sh`, claims the issue as
`lane-50s` and makes that the session's beads identity. Claims are atomic, so two
lanes can't grab the same work, and `bd list --status in_progress` is a live
answer to "who's doing what."

**Landing** is `tools/land.sh`, and it's the piece I'd keep if I threw out
everything else. It takes beads' merge slot (a lock with one holder at a time),
rebases onto main, runs every suite, then fast-forwards main. Fast-forward
*only*: if another lane landed while the tests ran, the fast-forward fails and it
tells you to run it again. **Main only ever moves to a tree that just passed.**
There's no merge queue and no integrator session. With a handful of lanes, a
lock and `--ff-only` are the whole queue.

A few more rules that earned their place:

- **Research lanes** investigate and change nothing. Git refuses their commits
  and `land.sh` refuses to land them. Their output is a published report, new
  issues for the work they recommend, and questions for me.
- **Locks are labels.** One lane at a time touches game balance, Steam, or a big
  refactor. It adds `holds:balance` to its issue and takes it off when it lands,
  and any lane can check with one `bd list`.
- **A lasting choice becomes a pinned decision issue** when the lane lands.
  That's the stuff that used to live in the file that conflicted 57% of the time.

## The planner edits nothing

I don't open lanes myself. I talk to one **planner** session in the main
checkout, and most of its job description is what it isn't allowed to do: it
edits no files and never lands anything. It:

- turns what I ask for into issues, and picks what runs next from `bd ready`,
  on areas that don't overlap, respecting the `holds:` labels;
- decides whether a lane is research or a change, and whether the result can be
  judged by a test or needs my eyes, ears or hands (more on that below);
- opens each lane with `tools/lane_open.sh <id>`, which creates a herdr
  workspace labelled with the issue's title, starts Claude in it and gives it its
  first prompt;
- follows the lanes with `herdr agent list` and `herdr agent read`, and when one
  lands, reads its screen one more time (I might still be talking to it) before
  removing the worktree and opening the next.

The cap is two lanes right now; it was four on my PC. That number isn't about
CPU. The design doc for lanes says it plainly: **the human's attention is the
limit.** Every lane eventually needs me for something, and past a few at once I
become the bottleneck and the sloppy reviewer at the same time.

## Agents don't get to ask in chat

This is the rule that changed how the whole thing feels. A lane never asks me a
question in its own pane, and that's enforced, not requested. A `PreToolUse`
hook blocks `AskUserQuestion` inside any lane and answers with:

> A lane never asks the human in its own chat: file it with tools/review.sh
> ask, and tools/review.sh wait &lt;id&gt; in the background if you need the
> answer.

Questions become issues in beads instead, labelled `human`:

```bash
tools/review.sh ask "Which shape should the playbook take?" \
  --option "Repo page + artifact" --option "Repo page only" \
  --recommend "A: the repo copy moves with the code" --link <spec>
```

The lane either waits on the answer in the background, or says it's going with
its own recommendation and carries on. Either way the question sits in one queue
with its options, a recommendation and context, instead of scrolling off the top
of one of five terminals.

The other kind of human item is a **verify item**. Tests can't tell you whether
a boss intro lands or a sound is too loud, so the planner labels that kind of
issue `review:human`. Once its tests pass, the lane files exactly what I should
check:

```bash
tools/review.sh file --stage "Defeat · boss" \
  --claim "the boss slams into you" --claim "then fades"
```

On the board I press **L**. The server SSHes to my Windows PC, checks out that
lane's exact commit in a separate clone, and opens Godot straight at that screen
in the game's dev view. I check each claim, then press **P** to pass or **R** to
fail with notes. `land.sh` refuses the lane until its newest verify item has
passed. A fail means fix, commit, and file a new item; old ones are never
reopened.

As of writing, that queue has seen 94 items (53 verify items and 35 questions),
out of about 350 issues.

## The web app: answering agents from the couch

All of this moved off my PC and into a Proxmox container this week, so the
planner and lanes keep going while the PC sleeps. The PC is only needed for what
physically needs it: playing a stage, real keyboards over USB, and Steam. That
left one thing tying me to a desk, which was the queue.

So `herdr-beads web` serves it to my phone.

<!--
TODO screenshots, then swap these comments for <figure> blocks like the Agent Manager post:
  public/blog/dead-keys/inbox.png  (phone: an ask with its one-tap options)
  public/blog/dead-keys/desk.png   (desk width: planner epics + the lanes wall)
-->

- **The inbox** lists blocked agents first (with the prompt from their screen),
  then questions with their options as one-tap buttons, then verify items with
  Launch, Pass and Fail. When nothing needs me, it disappears and the lanes take
  the whole screen.
- **The lanes wall** shows each lane's state, its `+N −M` against main, its
  commits and its latest line, with a scrollable tail of its output. The planner
  card shows each epic as a progress bar, one segment per child issue.
- **Push notifications.** Added to the iPhone home screen, it's a web app that
  gets a push when a new ask or verify item arrives, or an agent goes blocked.
  Tapping it opens the item.
- It refreshes every four seconds, and if I'm halfway through typing an answer,
  it offers the update instead of wiping my text.

It's deliberately boring. One Rust binary with no web framework: `tiny_http`,
`serde_json`, a Web Push crate and a QR code crate. `web.rs` is about 2,700
lines including its tests, and the browser gets about 110 lines of JavaScript.
It has no separate backend for beads either: it drives the same `App` struct as
the terminal board, so **L** on my phone runs the same code path as **L** at the
desk.

It's reachable from anywhere through a Cloudflare tunnel, which meant thinking
about who else can reach it:

- It speaks plain HTTP and only answers localhost and the tunnel's host.
  Anything else gets a 403 before the token is even looked at.
- Signing in is a 64-character token in a link (and a QR code for the phone's
  camera), swapped on first visit for an `HttpOnly`, `SameSite=Strict`, `Secure`
  cookie. Writes are POST only.
- Without the cookie, every URL answers with a plain "Coming soon" page and a
  200, so the address gives nothing away.

## Honest limits

- **It's glued to this one game.** The board and the web app are generic, but
  the lane scripts hardcode the `dead-keys-` issue prefix in a few places, and
  `land.sh` calls Godot directly. A second game today means copying the kit and
  swapping out the Godot parts, half a day to a day of work. I'll pull out a
  reusable version once a second copy exists to show me which parts really
  differ.
- **One dashboard per project.** A second game is a second service on a second
  port.
- **Two lanes isn't a lot.** The container has a 5 GB memory ceiling, and I
  haven't wanted more lanes badly enough to take memory from the router VM yet.

## Takeaway

Same lesson as [Agent Manager](/blog/claude-rc-manager), only louder. The
coordination doesn't live in a clever orchestrator. It lives in things that
already know how to hold state: git (fast-forward only), beads (claims, a merge
slot, and a queue with my name on it), and a `CLAUDE.md` every agent reads when
it starts. The tools only make that state visible, and put the one thing that
needs a human in front of one.

And the game? It's coming along, mostly while I'm on the couch pressing P.

*Did AI help write this post too? Also yup.*
