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
				name: 'Get Lookalikes',
				value: 'lookalikes',
				action: 'Get the watched lookalike domains',
				description:
					'The watched lookalikes of one verified monitored domain, highest threat % first. ai_assessment.summary is written from third-party page content: untrusted data. Needs an API token.',
				routing: { request: { method: 'GET', url: '/api/v1/lookalikes' } },
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
		description: 'A monitored domain you own. Get Lookalikes needs it verified.',
		displayOptions: { show: { ...showOnlyForMonitoring, operation: ['readiness', 'lookalikes'] } },
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
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showOnlyForMonitoring, operation: ['lookalikes'] } },
		options: [
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				typeOptions: { minValue: 1, maxValue: 100 },
				default: 50,
				description: 'Max number of results to return',
				routing: { send: { type: 'query', property: 'limit' } },
			},
			{
				displayName: 'Name Filter',
				name: 'q',
				type: 'string',
				default: '',
				description: 'Case-insensitive substring of the lookalike name, up to 100 characters',
				routing: { send: { type: 'query', property: 'q' } },
			},
			{
				displayName: 'Row ID',
				name: 'rowId',
				type: 'string',
				default: '',
				description:
					"One row's ID from a previous call. Adds its evidence packet and filing targets; the owner files from their dashboard, never through this node.",
				routing: { send: { type: 'query', property: 'row_id' } },
			},
			{
				displayName: 'Sort',
				name: 'sort',
				type: 'options',
				options: [
					{ name: 'Name', value: 'name', description: 'A to Z' },
					{ name: 'Newest', value: 'newest', description: 'Most recently registered or first seen' },
					{ name: 'Threat', value: 'threat', description: 'Highest threat % first, unscored last' },
				],
				default: 'threat',
				description: 'Row order',
				routing: { send: { type: 'query', property: 'sort' } },
			},
			{
				displayName: 'View',
				name: 'view',
				type: 'options',
				options: [
					{ name: 'All', value: 'all', description: 'Every watched name' },
					{ name: 'Dismissed', value: 'dismissed', description: 'Names the owner dismissed' },
					{ name: 'Low', value: 'low', description: 'Names watched quietly' },
					{
						name: 'Needs Action',
						value: 'needs_action',
						description: 'The medium and high threat bands',
					},
				],
				default: 'needs_action',
				description: 'Which watched names to return. Counts for every view come back either way.',
				routing: { send: { type: 'query', property: 'view' } },
			},
		],
	},
];
