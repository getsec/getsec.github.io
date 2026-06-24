---
title: "Claude Desktop/Cowork — MCP Gateways"
description: "Why enterprise MCP gateways don't fit Claude Desktop's admin-managed Connectors — and how per-user Desktop Extensions (Node-bundled vs Bun-compiled) change the security trade-offs of shipping them."
date: 2026-06-24
---

Claude Desktop historically only spoke to **local** MCP servers. That's fine
for personal CLIs you trust on your own machine — but most enterprise MCP usage
is shifting toward **gateways**, where each user configures their server set and
credentials once and gets back a per-user gateway URL (OAuth, header-auth, or
magic-link).

## Why Connectors don't fit per-user gateways

That gateway pattern doesn't compose cleanly with Claude Desktop's newer
**Connectors** feature. In team-administered setups, Connectors are
admin-managed: one administrator sets a single URL, and every user under that
admin inherits it. For a personal-gateway model — where each user has their own
space and their own auth material — "everyone shares one URL" collapses the
whole point of per-user gateways.

## "Just use OAuth" only goes so far

One counter you'll hear: *just standardize on OAuth Connectors for everything.*
That works when every MCP server behind your gateway speaks OAuth. In practice,
many don't: plenty of MCP servers wrap legacy or self-hosted enterprise systems
that only authenticate via static tokens or header-based auth. For those, a
per-user extension with header-mode config is the path that actually ships.

## Desktop Extensions: per-user config that actually ships

While running a POC with an MCP gateway vendor, I wanted to test **Claude
Desktop Extensions** (`.mcpb` / `.dxt`) — a tiny local-stdio process that
proxies to the remote gateway. The trick is the install wizard: the manifest
declares a `user_config` block, so Claude Desktop prompts *each user* for their
own gateway URL and credentials at install time, stored per-user. Same artifact
for everyone, per-user config under the hood.

That works — but it introduces a new consideration: runtime dependencies.

## Two ways to ship it: Node vs Bun

- **Option A — Node-based.** Bundles `mcp-remote` and its ~80 transitive npm
  packages at pack time. Requires Node 18+ on the user's PATH at runtime (most
  non-engineering users won't have it).
- **Option B — Bun-compiled binaries.** `mcp-remote` (Node-compatible JS), its
  dependencies, *and* the Bun runtime itself are statically compiled into one
  platform-specific binary per OS (mac-arm / win-x64). No Node, no npm, no
  external dependencies at runtime — just an executable.

Neither version is strictly *more secure*; they push risk into different layers.
The Node version trusts the host runtime, but in exchange you get full
transparency into the bundled JS. The binary version seals the runtime into the
artifact, but you lose the ability to inspect it without rebuilding.

## The takeaway

> As MCP gateways become the default enterprise pattern, the transport between
> client and gateway will matter as much as the gateway's own controls.

Desktop Extensions are currently the cleanest Claude Desktop path for
**per-user** configuration of remote MCP servers — exactly what gateway models
assume. Connectors are the right primitive for shared, admin-managed remote MCP;
extensions are the right primitive for personal, per-user gateway endpoints.
Worth knowing which one fits the deployment you're actually doing.
