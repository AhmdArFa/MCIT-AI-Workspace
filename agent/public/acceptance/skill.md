# Install Acceptance for MCIT AI

Acceptance lets a coding agent verify a delivery and publish evidence for human review in MCIT AI.
Run the following setup from the root of the project the user wants to verify.

## 1. Install the CLI

If `lh --version` is unavailable, install the MCIT AI CLI:

```sh
npm install -g @tut/cli
```

## 2. Connect to MCIT AI

Check the current account with `lh whoami`. If authentication is needed, run:

```sh
lh login
```

Let the user complete the browser sign-in. Never request passwords or tokens in chat.

## 3. Install the Acceptance skill

From the project root, run:

```sh
lh acceptance install
```

This downloads the deployed Acceptance skill and its companion resources into
`.agents/skills/acceptance/` and wires supported coding-agent skill directories.
Existing files are preserved by default. Use `lh acceptance update` only when the
user wants to refresh an existing installation.

## 4. Verify setup and start a review

Confirm that `.agents/skills/acceptance/SKILL.md` exists, read it, and follow its
instructions and referenced resources. Do not replace it with this installation guide.

Tell the user which project was configured and whether installation completed.
The user can then invoke `/acceptance` in their coding agent to verify a delivery.
Published reviews appear at <https://mcit.gov.eg/acceptance>.
