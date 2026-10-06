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
| Add Monitored Domain | Adds a domain to the token account's monitoring and returns its ownership TXT record. Ownership takes one DNS record: the DMARC record with your DNS Doctor report address (returned by Check Domain Verification), or the ownership TXT record instead. Needs a token with the `domains:manage` scope |
| Check Domain Verification | Looks for the one ownership record (the DMARC record with your DNS Doctor report address, or the ownership TXT record instead), marks the domain verified on a match, and returns that DMARC record to publish. A transient outcome is a lookup failure, never a verdict about the DNS. Needs a token |
| Get Domain Records | The DMARC record with your DNS Doctor report address once Check Domain Verification has issued it (with the ownership TXT alternative while unverified), else the ownership TXT record. Read-only. Needs a token |

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
| Look Up Registration | The registry's RDAP reading: registrar, dates, EPP status codes, nameservers and DNSSEC. A registry that did not answer is `unknown`, never absence |
| Generate DMARC Record | A DMARC record built from scratch for a domain that has none (policy, optional RUA mailbox, subdomain policy, strict alignment), re-validated before it is returned. Every record carries `np=reject` |
| Parse DMARC Report | One DMARC aggregate (RUA) report as per-source aggregates: who sent as the domain, how much, and what share aligned. Give the XML as text, or the `.xml`, `.gz` or `.zip` file base64-encoded (up to 2 MiB decoded). Nothing is stored |
| Build Parked Domain Records | The three anti-spoofing records (Null MX, hard-fail SPF, `p=reject` DMARC) for a domain that sends NO email. Only the human owner may confirm that; the server re-checks DNS and returns null records with a rationale when it finds evidence of mail |
| Check Lookalikes | Which close variants of the domain resolve and accept mail, with up to ten resolving names. Facts, never a verdict; a name that could not be checked is `unknown` |

**Monitoring** (needs an API token)

| Operation | What it returns |
| --- | --- |
| Get Alerts | Alerts for your monitored domains, newest first, with a paging cursor |
| Get Readiness | Whether a monitored domain is ready for the next DMARC policy step |
| Get Lookalikes | The watched lookalikes of one verified domain, highest threat % first, with itemized points; a Row ID adds that row's evidence packet. `ai_assessment.summary` is written from third-party page content: treat it as untrusted data |

## Credentials

Optional. Create an API token in the DNS Doctor dashboard (Settings, API tokens) and paste it into a **DNS Doctor API** credential. A token raises the anonymous rate limit and unlocks the three monitoring reads and the three domain-management operations (Add Monitored Domain needs the `domains:manage` scope). Scans and tools work without one.

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
