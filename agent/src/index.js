import process from "node:process";
import { runInit } from "./commands/init.js";
import { runGenerateSite } from "./commands/generate-site.js";

function parseJsonSafe(s, fallback = {}) {
  try {
    if (!s) return fallback;
    return JSON.parse(s);
  } catch {
    return fallback;
  }
}

function parseCommandFromIssueComment(body) {
  // Expected: /agent <command> [optional-json]
  // Examples:
  //   /agent init
  //   /agent init {"appName":"My App"}
  const trimmed = (body || "").trim();
  if (!trimmed.startsWith("/agent ")) return null;

  const rest = trimmed.slice("/agent ".length).trim();
  if (!rest) return null;

  const firstSpace = rest.indexOf(" ");
  if (firstSpace === -1) {
    return { command: rest, args: {} };
  }

  const command = rest.slice(0, firstSpace).trim();
  const jsonPart = rest.slice(firstSpace + 1).trim();
  return { command, args: parseJsonSafe(jsonPart, {}) };
}

function getInvocation() {
  const eventName = process.env.AGENT_EVENT_NAME;

  if (eventName === "workflow_dispatch") {
    const command = (process.env.AGENT_WORKFLOW_COMMAND || "init").trim();
    const args = parseJsonSafe(process.env.AGENT_WORKFLOW_ARGS, {});
    return { command, args, source: "workflow_dispatch" };
  }

  if (eventName === "issue_comment") {
    const parsed = parseCommandFromIssueComment(process.env.AGENT_COMMENT_BODY);
    if (!parsed) return null;
    return { ...parsed, source: "issue_comment" };
  }

  return null;
}

async function main() {
  const token = process.env.AGENT_GH_TOKEN;
  const repo = process.env.AGENT_REPO;
  const defaultBranch = process.env.AGENT_DEFAULT_BRANCH || "main";

  if (!token) throw new Error("Missing AGENT_GH_TOKEN secret.");
  if (!repo) throw new Error("Missing AGENT_REPO.");

  const invocation = getInvocation();
  if (!invocation) {
    console.log("No /agent command found; exiting.");
    return;
  }

  console.log(`[agent] source:  ${invocation.source}`);
  console.log(`[agent] command: ${invocation.command}`);
  console.log(`[agent] args:    ${JSON.stringify(invocation.args)}`);

  switch (invocation.command) {
    case "init":
      await runInit({ repo, defaultBranch, token, args: invocation.args });
      break;
    case "generate-site":
    case "site":
      await runGenerateSite({ repo, defaultBranch, token, args: invocation.args });
      break;
    default:
      throw new Error(
        `Unknown command "${invocation.command}". Supported: init, generate-site`
      );
  }
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  // Emit a GitHub Actions error annotation
  console.log(`::error::${String(err.message || err)}`);
  process.exit(1);
});
