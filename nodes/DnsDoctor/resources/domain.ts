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
				name: 'Build DMARC Upgrade',
				value: 'dmarcUpgrade',
				action: 'Build the next safe DMARC record for a domain',
				description:
					'The next safe DMARC record (alignment-gated) with the rationale. The record can be null; then the rationale is the answer.',
				routing: { request: { method: 'POST', url: '/api/v1/dmarc-upgrade' } },
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
		displayOptions: { show: { ...showOnlyForDomain, operation: ['scan', 'dmarcUpgrade', 'signupUrl'] } },
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
];
