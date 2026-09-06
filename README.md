# n8n-nodes-dns-doctor

An [n8n](https://n8n.io) community node for [DNS Doctor](https://dnsdoctor.dev): scan, diagnose and fix a domain's email authentication (SPF, DMARC, DKIM), check a DNS change from six locations on four continents, audit an SPF include chain, and read monitoring alerts. Every verdict is deterministic and every record comes from a validating engine, never from a language model.

The node works without credentials for scans and tools. It is usable as a tool by the AI Agent node.

## Installation

Follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/). Package name: `n8n-nodes-dns-doctor`.

## Operations

**Domain**

| Operation | What it returns |
| --- | --- |
| Scan | The full report: SPF, DKIM, DMARC, MX, DNS health, blacklists, domain and TLS expiry, with per-check verdicts and copy-paste fix records |
| Get Report | The last persisted report for a domain, or a fresh scan when none exists |
| Build DMARC Upgrade | The next safe DMARC record for a domain, alignment-gated, with the rationale. The record can be null; then the rationale is the answer |
| Get Monitoring Signup Link | A link that carries the domain into paid monitoring, for a human to open |

**Tool**

| Operation | What it returns |
| --- | --- |
| Check Propagation | Whether a DNS change has propagated, read from six locations on four continents |
| Check DNS Record | One record at the authoritative nameservers and at public resolvers, with TTLs |
| Check DKIM Selector | One DKIM selector's key and strength |
| Check Reverse DNS | The PTR record of an IP and whether it is forward-confirmed |
| Count SPF Lookups | The DNS lookups an SPF record spends against the limit of 10 |
| Audit SPF Includes | Who can transitively send as the domain, with typed findings |
| Validate DMARC Record | A DMARC record's tags, policy, warnings and errors |

**Monitoring** (needs an API token)

| Operation | What it returns |
| --- | --- |
| Get Alerts | Alerts for your monitored domains, newest first, with a paging cursor |
| Get Readiness | Whether a monitored domain is ready for the next DMARC policy step |

## Credentials

Optional. Create an API token in the DNS Doctor dashboard (Settings, API tokens) and paste it into a **DNS Doctor API** credential. A token raises the anonymous rate limit and unlocks the two monitoring reads. Scans and tools work without one.

## Reading the results

- A check with status `temperror` is a transient lookup failure, not a failure of the domain. Re-run it.
- `not_registered: true` on a report means the domain does not resolve; no check ran.
- Present any returned record verbatim. SPF is diagnose-only: the scan reports SPF findings but never proposes SPF edits.
- The API answers `429` when a caller exceeds the free allowance and `402` with an [x402](https://x402.org) payment offer past it. Both are transient, not verdicts about the domain.
- A human should approve every DNS change; nothing is applied automatically.

## Example: alert on a DMARC regression

Schedule Trigger, then DNS Doctor (Domain, Scan) for your domain, then an IF node on `{{ $json.checks.find(c => c.check === 'dmarc').status }}` not equal to `pass`, then Slack.

## Compatibility

Tested with n8n 1.x. No runtime dependencies.

## Resources

- [DNS Doctor](https://dnsdoctor.dev)
- [API reference](https://dnsdoctor.dev/api/v1/docs)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

MIT
