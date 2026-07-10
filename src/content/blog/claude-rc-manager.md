---
title: "Agent Manager — coordinating many Claude Code sessions on one repo"
description: "A local control panel that runs Claude Code remote-control sessions as systemd --user services, then lets several of them work the same repo in parallel — coordinated by written protocols the agents follow, not port math baked into the tool."
date: 2026-07-10
---

I wanted to run **Claude Code remote-control (RC)** sessions — one per repo,
always on, reachable from my phone — without handing any of it to a cloud
service. So I built [**Agent Manager**](https://github.com/getsec/claude-rc-manager):
a local, single-user web control panel that runs each session as a
`systemd --user` service, gives you a dashboard over `systemctl --user` and
`journalctl`, and — the part this post is about — lets *several* sessions work
the **same repo** in parallel without stepping on each other.

It runs entirely on your own machine, as your own user. No root, no cloud, no
auth.

One caveat up front: there are probably many ways to do this, and I don't think
this is the *best* way. But I always find it fun to build your own — and rolling
it from scratch is a genuinely good way to learn how the pieces actually fit
together. Take this as one person's fun way to learn, not a recommendation to
replace whatever already works for you.

## The substrate: one service per repo, one private tmux server each

Before the multi-agent part makes sense, the single-session model:

`claude --remote-control` is an *interactive* command. It expects a real TTY.
Run it headless under a plain `Type=simple` systemd service and it detects
there's no terminal, falls into `--print` mode, does one shot, and exits — the
opposite of an always-on session.

So each session runs as an instance of a `systemd --user` template unit,
`claude-rc@<name>.service`, and the unit launches Claude **inside its own private
tmux server**:

```ini
ExecStart=/usr/bin/tmux -L rc-%i new-session -d -s claude-rc-%i \
  '%h/.local/bin/claude --remote-control --remote-control-session-name-prefix %i'
```

That `-L rc-%i` is the whole trick. The private tmux server supplies the PTY
Claude insists on, and — because it's a per-service socket rather than the shared
default — it keeps each session in its **own cgroup**.

> Stopping one session never touches another. That isolation is what makes
> running *many* agents on one box safe to reason about — and it's the
> foundation the multi-agent story is built on.

You can prove it on the machine, which is the only claim worth making:

```bash
systemctl --user stop claude-rc@<a>
# session <b> must stay online in the phone app
```

## The real problem: two agents, one repo, one set of ports

Running two sessions on two *different* repos is easy — they share nothing.
Running two sessions on the **same** repo is where it gets interesting, and it's
what I actually wanted: one agent on `main`, another on a feature branch, both
live at once.

Two things immediately collide:

1. **The working tree.** Two agents can't share one checkout. Solved with **git
   worktrees** — each extra session is `git worktree add <name>-<branch>`, its
   own directory, its own `claude-rc@<name>-<branch>` unit, its own
   tmux/cgroup. A `<name>-coord` worktree on a `coordination` branch holds the
   shared state.
2. **Runtime resources.** If both agents run the app — a dev server, a Postgres,
   a compose stack — they fight over the same ports and the same container/project
   names. *This* is the hard part, and it's where most of the design went.

## The decision that shaped everything: the manager allocates nothing

The obvious move is to make the manager smart: track ports, assign each session
a free block, template a compose file, hand it out. I deliberately **didn't**.
The manager hardcodes no port math and no compose logic at all.

Instead, coordination is a **written protocol the agent reads and follows** — a
Markdown document, not code the tool executes. Three distinct things, which are
easy to conflate but shouldn't be:

| Thing | What it is | Who touches it |
|---|---|---|
| **Protocol** | A reusable, named template of coordination *instructions* | You author it in the Protocols UI |
| **`MULTI_AGENT.md`** | A project's own rendered copy of a protocol, dropped into each worktree | The **agent** reads and obeys it |
| **`SESSIONS.md`** | The live shared ledger of who's claimed which ports/resources | Agents read **and write** as they coordinate |

Protocol = the rules. `MULTI_AGENT.md` = those rules handed to one project's
agents. `SESSIONS.md` = the scoreboard they coordinate through, living in the
`<name>-coord` worktree and committed to a `coordination` branch so every session
sees the same state.

> The manager's job is to *stage the coordination*, not *perform* it: seed a
> library of protocols, scaffold the ledger, and drop the right instructions
> into each worktree. The agents do the actual resource wiring by following
> them. No orchestration logic to keep in sync with reality — the reality is a
> file the agents can read.

## The built-in protocol: port blocks by session number

The tool seeds one protocol on first run, `compose-portblock`, which is the
convention I kept reaching for by hand. Each session claims a block of ports
offset by its session number, plus a unique container/compose project name, and
records the claim in the ledger. The template carries its own defaults as
`${VAR}` placeholders:

- Postgres: `${PG_BASE}` (5432) `+ ${INCREMENT}*N`
- API: `${API_BASE}` (8000) `+ ${INCREMENT}*N`
- Web: `${WEB_BASE}` (5173) `+ ${INCREMENT}*N`

Session 0 gets 5432/8000/5173, session 1 gets 5442/8010/5183, and so on — no two
stacks overlap. A unique `COMPOSE_PROJECT_NAME` per session means Docker keeps
each agent's containers, networks, and volumes in a separate namespace, so
`compose down` in one worktree never tears down another agent's stack. The
protocol also tells the agent to write its claim (worktree, branch,
`COMPOSE_PROJECT_NAME`, ports, `active`/`done`) into `SESSIONS.md` and commit it,
so the next agent reads the ledger and takes the next free block.

Because it's just Markdown with variables, it's not special. Duplicate it, change
the base ports, swap Postgres for MySQL, encode a totally different convention
(Redis DB numbers, Kafka topic prefixes, whatever your stack collides on) — the
manager renders `${PROJECT}`, `${COORD_DIR}`, and your vars, then drops the
result. It never needs to understand what any of it means.

## The part I'm quietly proud of: getting instructions to the agent invisibly

Dropping a file into each worktree sounds trivial until you realize it would show
up in `git status` and tempt someone into committing a machine-specific
coordination file into shared history. So the drop-in is deliberately
non-invasive:

- The manager writes `MULTI_AGENT.md` (the rendered protocol) into the worktree.
- It also writes `CLAUDE.local.md` containing a single line: `@MULTI_AGENT.md`.
- It appends **both** filenames to the repo's `.git/info/exclude` — resolved via
  `git rev-parse --git-common-dir` so worktrees share the main repo's exclude
  list — idempotently, so re-running never duplicates the entries.

Two nice properties fall out. First, the files are untracked and *stay* that way:
they never appear in `git status`, never enter a diff, never get committed by an
overeager agent. Second, I don't have to teach Claude anything new to make it
read the instructions — Claude already auto-loads `CLAUDE.local.md`, and that
file just `@`-imports `MULTI_AGENT.md`. I'm riding an existing convention rather
than inventing a load mechanism, and the coordination rules are in the agent's
context from the first turn.

Editing a project's `MULTI_AGENT.md` re-drops it into every live worktree; a
**re-sync from protocol** action discards local edits and re-renders from the
library version. Library edits never silently mutate projects — drift is
explicit, on purpose.

## What I deliberately left out (for now)

Environment-variable propagation — having the manager push each session's claimed
ports into its systemd unit as real env vars — is designed but **not yet
implemented**. Today the agent reads its block from `SESSIONS.md` and wires its
own `.env`; the manager doesn't inject anything into the process. That's a
conscious "later," not a thing I'm pretending works.

And the honest limitation that predates all of this: the dashboard shows
**systemd health** — active, failed, restart count — not Claude's own "green dot"
connection state, which lives on Claude's servers, not your box. A unit can be
`active` while the app-layer link is degraded. For authoritative online status,
the phone app's Code tab is the source of truth. I'd rather the dashboard report
exactly what it knows than fake a signal it doesn't have.

## Takeaway

The interesting design call wasn't the systemd plumbing — it was refusing to make
the manager the coordinator. Ports, containers, and compose stacks are exactly
the things that drift from whatever a tool hardcodes; encoding the convention as
a *document the agents read and a ledger they write* means the coordination logic
lives where the work does, and the manager stays a dumb, honest stager of files.
Multi-agent coordination turned out to be less about orchestration and more about
handing agents good written rules and a shared scoreboard — and then getting out
of the way.

Code and setup: [github.com/getsec/claude-rc-manager](https://github.com/getsec/claude-rc-manager).
