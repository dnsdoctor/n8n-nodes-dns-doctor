# Changelog

## 0.1.4

- Tool: Generate DMARC Record, Parse DMARC Report (XML text, or a base64 `.xml`/`.gz`/`.zip` file), Build Parked Domain Records and Check Lookalikes.
- Monitoring: Get Lookalikes (the watched lookalikes of a verified domain; needs an API token).
- Domain: Add Monitored Domain, Check Domain Verification and Get Domain Records describe ownership as one DNS record: the DMARC record with your DNS Doctor report address, or the ownership TXT record instead.
- The node now covers all 22 DNS Doctor tools.

## 0.1.3

- README: the operations tables list the four operations added in 0.1.2 (n8n Creator Portal review, 2026-09-22). No functional change.

## 0.1.2

- Domain: Add Monitored Domain, Check Domain Verification and Get Domain Records (token-authed; Add Monitored Domain needs the `domains:manage` scope).
- Tool: Look Up Registration (RDAP registrar, dates, EPP status codes, nameservers and DNSSEC).

## 0.1.1

- Codex: the `node` field is the fully-qualified `n8n-nodes-dns-doctor.dnsDoctor`, and the categories list drops the unrecognised `Developer Tools` (n8n Creator Portal review, 2026-09-09). No functional change.

## 0.1.0

First release: Domain (Scan, Get Report, Build DMARC Upgrade, Get Monitoring Signup Link), Tool (Check Propagation, Check DNS Record, Check DKIM Selector, Check Reverse DNS, Count SPF Lookups, Audit SPF Includes, Validate DMARC Record) and Monitoring (Get Alerts, Get Readiness) operations over the DNS Doctor API.
