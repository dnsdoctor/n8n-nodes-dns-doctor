import type { INodeProperties } from 'n8n-workflow';

const showOnlyForDomain = { resource: ['domain'] };

export const domainDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForDomain },
		options: [
			{
				name: 'Add Monitored Domain',
				value: 'addDomain',
				action: 'Add a domain to monitoring',
				description:
					'Adds a domain to the token account\'s monitoring and returns the ownership TXT record to publish. Requires a credential with the domains:manage scope.',
				routing: { request: { method: 'POST', url: '/api/v1/domains' } },
			},
			{
				name: 'Build DMARC Upgrade',
				value: 'dmarcUpgrade',
				action: 'Build the next safe DMARC record for a domain',
				description:
					'The next safe DMARC record (alignment-gated) with the rationale. The record can be null; then the rationale is the answer.',
				routing: { request: { method: 'POST', url: '/api/v1/dmarc-upgrade' } },
			},
			{
				name: 'Check Domain Verification',
				value: 'verifyDomain',
				action: 'Check whether a domain ownership record is visible',
				description:
					'Re-checks the ownership TXT record and marks the domain verified on a match. A transient outcome is our lookup, never a verdict about the DNS.',
				routing: { request: { method: 'POST', url: '/api/v1/domains/verify' } },
			},
			{
				name: 'Get Domain Records',
				value: 'domainRecords',
				action: 'Get the records a monitored domain still needs',
				description:
					'The ownership record while unverified, and the DMARC reporting record once verified. Read-only.',
				routing: {
					request: {
						method: 'GET',
						url: '/api/v1/domains/records',
						qs: { domain: '={{ $parameter.domain }}' },
					},
				},
			},
			{
				name: 'Get Monitoring Signup Link',
				value: 'signupUrl',
				action: 'Get a monitoring signup link for a domain',
				description:
					'A link that carries the domain into paid monitoring, for a human to open. Nothing is created and no email is sent.',
				routing: { request: { method: 'POST', url: '/api/v1/signup-url' } },
			},
			{
				name: 'Get Report',
				value: 'report',
				action: 'Get the persisted report for a domain',
				description: 'The last persisted report, or a fresh scan when none exists',
				routing: {
					request: {
						method: 'GET',
						url: '=/api/v1/report/{{ encodeURIComponent($parameter.domain) }}',
					},
				},
			},
			{
				name: 'Scan',
				value: 'scan',
				action: 'Scan a domain',
				description:
					'SPF, DKIM, DMARC, MX, DNS health, blacklists and expiry with deterministic per-check verdicts and copy-paste fix records',
				routing: { request: { method: 'POST', url: '/api/v1/scan' } },
			},
		],
		default: 'scan',
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'example.com',
		description: 'The domain to check, without scheme or path',
		displayOptions: { show: { ...showOnlyForDomain, operation: ['scan', 'dmarcUpgrade', 'signupUrl', 'addDomain', 'verifyDomain'] } },
		routing: { send: { type: 'body', property: 'domain' } },
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'example.com',
		description: 'The domain whose report to read',
		displayOptions: { show: { ...showOnlyForDomain, operation: ['report'] } },
	},
	{
		// The records read carries the domain as a QUERY parameter (the
		// `get_readiness` shape), so it declares its own property rather than
		// joining the body-sending group above.
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'example.com',
		description: 'The monitored domain whose outstanding records to read',
		displayOptions: { show: { ...showOnlyForDomain, operation: ['domainRecords'] } },
	},
];
