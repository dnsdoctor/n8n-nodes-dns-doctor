import type { INodeProperties } from 'n8n-workflow';

const showOnlyForMonitoring = { resource: ['monitoring'] };

export const monitoringDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForMonitoring },
		options: [
			{
				name: 'Get Alerts',
				value: 'alerts',
				action: 'Get monitoring alerts',
				description:
					'Alerts for your monitored domains, newest first, with a paging cursor. Needs an API token.',
				routing: { request: { method: 'GET', url: '/api/v1/alerts' } },
			},
			{
				name: 'Get Readiness',
				value: 'readiness',
				action: 'Get DMARC enforcement readiness',
				description:
					'Whether a monitored domain is ready for the next DMARC policy step, from its aggregate reports. Needs an API token.',
				routing: { request: { method: 'GET', url: '/api/v1/readiness' } },
			},
		],
		default: 'alerts',
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'example.com',
		description: 'A monitored domain you own',
		displayOptions: { show: { ...showOnlyForMonitoring, operation: ['readiness'] } },
		routing: { send: { type: 'query', property: 'domain' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showOnlyForMonitoring, operation: ['alerts'] } },
		options: [
			{
				displayName: 'Alert Type',
				name: 'type',
				type: 'string',
				default: '',
				description: 'Only alerts of this type',
				routing: { send: { type: 'query', property: 'type' } },
			},
			{
				displayName: 'Before',
				name: 'before',
				type: 'string',
				default: '',
				description: 'The paging cursor from a previous page (next_before)',
				routing: { send: { type: 'query', property: 'before' } },
			},
			{
				displayName: 'Domain',
				name: 'domain',
				type: 'string',
				default: '',
				description: 'Only alerts for this monitored domain',
				routing: { send: { type: 'query', property: 'domain' } },
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1 },
				default: 50,
				description: 'Max number of results to return',
				routing: { send: { type: 'query', property: 'limit' } },
			},
			{
				displayName: 'Since',
				name: 'since',
				type: 'string',
				default: '',
				description: 'Only alerts created at or after this ISO-8601 timestamp',
				routing: { send: { type: 'query', property: 'since' } },
			},
		],
	},
];
