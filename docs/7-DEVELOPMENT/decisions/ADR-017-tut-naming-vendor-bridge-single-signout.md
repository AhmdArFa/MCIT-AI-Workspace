# ADR-017: Tut Agent naming, vendor bridge and single sign-out

Status: accepted (October 2026).

## Context

Tut Agent (`agent/`) is a derivative of an upstream agent application. Its
code still carried the upstream names in identifiers, strings, URLs, package
scopes and assets. MCIT AI and Tut Agent also kept separate sessions, and the
admin console could not see Tut Agent's data.

## Decision

1. **One name.** Everything in our code is MCIT AI or Tut Agent: workspace
   packages are `@tut/*`, built-in tool identifiers are `tut-*`, and upstream
   docs and release notes are removed. Upstream attribution and license live
   only in `agent/NOTICE` and `agent/LICENSES/`, which users never see.
2. **Vendor bridge.** Third-party packages published under the upstream npm
   scope keep their real names in `package.json`, because they cannot be
   renamed. Source code imports them through npm aliases (`@mcit-vendor/*`).
   The few names that cannot be aliased live in `agent/packages/vendor-bridge`,
   the only source folder that spells the upstream scope. These are exported
   symbols, CSS class and variable prefixes emitted by the UI kit, the
   marketplace secret format, and the build-config path matchers.
3. **Single sign-out per browser.** Session tokens carry a `jti`. Signing out
   revokes that token server-side and sends the browser to
   `/webapi/mcit/signout` on Tut Agent, which ends the Tut session of the same
   browser and returns to the MCIT AI sign-in page. Other browsers and devices
   keep their sessions. OIDC sign-in refuses revoked or outdated sessions.
4. **Admin view of Tut Agent.** The admin console reads Tut Agent chats,
   files, generations and usage server-to-server through
   `/webapi/mcit/admin/user-activity` (shared `MCIT_ADMIN_BOOTSTRAP_TOKEN`).
   Each request names one MCIT AI account, resolved through the OIDC link, and
   every query is filtered to that person.

## Consequences

- Data written by older builds under upstream tool identifiers is not
  migrated; this branch assumes a fresh Tut Agent database.
- The gateway container image and its base-URL environment variable keep the
  publisher's names (`docker-compose.yml`).
- Distributing Tut Agent requires the commercial license described in
  `agent/NOTICE`.
