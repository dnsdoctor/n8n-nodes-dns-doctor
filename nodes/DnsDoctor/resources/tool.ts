import type { IExecuteSingleFunctions, IHttpRequestOptions, INodeProperties } from 'n8n-workflow';

const showOnlyForTool = { resource: ['tool'] };

// The report-parse route takes ONE multipart file part named `file` (the claude-plugin
// client's `upload` route kind). Built by hand so the node keeps zero runtime deps.
const BOUNDARY = '----dnsdoctor-n8n-report';

async function reportAsMultipart(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const report = this.getNodeParameter('report') as string;
	const encoding = this.getNodeParameter('reportEncoding') as string;
	const bytes = Buffer.from(report, encoding === 'base64' ? 'base64' : 'utf8');
	requestOptions.body = Buffer.concat([
		Buffer.from(
			`--${BOUNDARY}\r\nContent-Disposition: form-data; name="file"; filename="report.xml"\r\n` +
				'Content-Type: application/octet-stream\r\n\r\n',
		),
		bytes,
		Buffer.from(`\r\n--${BOUNDARY}--\r\n`),
	]);
	requestOptions.headers = {
		...requestOptions.headers,
		'Content-Type': `multipart/form-data; boundary=${BOUNDARY}`,
	};
	return requestOptions;
}

export const toolDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showOnlyForTool },
		options: [
			{
				name: 'Audit SPF Includes',
				value: 'spfAudit',
				action: 'Audit an SPF include chain',
				description:
					'Walk every include and redirect and report who can transitively send as the domain, with typed findings',
				routing: { request: { method: 'POST', url: '/api/tools/spf-audit' } },
			},
			{
				name: 'Build Parked Domain Records',
				value: 'parkedRecords',
				action: 'Build parked domain records for a domain that sends no email',
				description:
					'Null MX, hard-fail SPF and p=reject DMARC for a NON-SENDING domain only. The server re-checks DNS and returns null records with a rationale when it finds evidence of mail.',
				routing: { request: { method: 'POST', url: '/api/tools/parked-domain-records' } },
			},
			{
				name: 'Check DKIM Selector',
				value: 'dkimCheck',
				action: 'Check a DKIM selector',
				description: 'Read one DKIM selector and report the key and its strength',
				routing: { request: { method: 'POST', url: '/api/tools/dkim-check' } },
			},
			{
				name: 'Check DNS Record',
				value: 'checkRecord',
				action: 'Check a DNS record',
				description:
					'Read one record at the authoritative nameservers and at public resolvers, with TTLs and whether they agree',
				routing: { request: { method: 'POST', url: '/api/tools/check-record' } },
			},
			{
				name: 'Check Lookalikes',
				value: 'checkLookalikes',
				action: 'Check a domain for lookalike domains',
				description:
					'DNS-only: which close variants of the name resolve and accept mail. Facts, never a verdict; a name that could not be checked counts as unknown.',
				routing: { request: { method: 'POST', url: '/api/tools/lookalikes' } },
			},
			{
				name: 'Check Propagation',
				value: 'propagation',
				action: 'Check DNS propagation',
				description:
					'Read one name from six locations on four continents and report whether a change has propagated',
				routing: { request: { method: 'POST', url: '/api/tools/propagation-check' } },
			},
			{
				name: 'Check Reverse DNS',
				value: 'reverseDns',
				action: 'Check reverse DNS for an IP',
				description: 'The PTR record of an IP address and whether it is forward-confirmed',
				routing: { request: { method: 'POST', url: '/api/tools/reverse-dns-check' } },
			},
			{
				name: 'Count SPF Lookups',
				value: 'spfCount',
				action: 'Count SPF DNS lookups',
				description: 'The DNS lookups an SPF record spends against the limit of 10, term by term',
				routing: { request: { method: 'POST', url: '/api/tools/spf-count' } },
			},
			{
				name: 'Generate DMARC Record',
				value: 'dmarcGenerate',
				action: 'Generate a DMARC record',
				description:
					'Build a DMARC record from scratch for a domain that has none, re-validated before it is returned. Every record carries np=reject.',
				routing: { request: { method: 'POST', url: '/api/tools/dmarc-generate' } },
			},
			{
				name: 'Look Up Registration',
				value: 'whois',
				action: 'Look up a domain registration',
				description:
					'Read the registry over RDAP for registrar, dates, EPP status codes, nameservers and DNSSEC',
				routing: { request: { method: 'POST', url: '/api/tools/whois' } },
			},
			{
				name: 'Parse DMARC Report',
				value: 'dmarcReportParse',
				action: 'Parse a DMARC aggregate report',
				description:
					'Parse one DMARC aggregate (RUA) report into per-source aggregates: who sent as the domain, how much, and what share aligned. Nothing is stored.',
				routing: {
					request: { method: 'POST', url: '/api/tools/dmarc-report-parse' },
					send: { preSend: [reportAsMultipart] },
				},
			},
			{
				name: 'Validate DMARC Record',
				value: 'dmarcValidate',
				action: 'Validate a DMARC record',
				description: 'Parse a DMARC record and report its tags, policy, warnings and errors',
				routing: { request: { method: 'POST', url: '/api/tools/dmarc-validate' } },
			},
		],
		default: 'propagation',
	},
	// Audit SPF Includes
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'example.com',
		description: 'The domain whose SPF include chain to audit',
		displayOptions: { show: { ...showOnlyForTool, operation: ['spfAudit'] } },
		routing: { send: { type: 'body', property: 'domain' } },
	},
	// Look Up Registration
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'example.com',
		description: 'The domain whose registry record to read',
		displayOptions: { show: { ...showOnlyForTool, operation: ['whois'] } },
		routing: { send: { type: 'body', property: 'domain' } },
	},
	// Check DKIM Selector
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'example.com',
		description: 'The signing domain (the d= value)',
		displayOptions: { show: { ...showOnlyForTool, operation: ['dkimCheck'] } },
		routing: { send: { type: 'body', property: 'domain' } },
	},
	{
		displayName: 'Selector',
		name: 'selector',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'selector1',
		description: 'The DKIM selector (the s= value)',
		displayOptions: { show: { ...showOnlyForTool, operation: ['dkimCheck'] } },
		routing: { send: { type: 'body', property: 'selector' } },
	},
	// Check DNS Record
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'example.com',
		description: 'The domain to read the record from',
		displayOptions: { show: { ...showOnlyForTool, operation: ['checkRecord'] } },
		routing: { send: { type: 'body', property: 'domain' } },
	},
	{
		displayName: 'Record Kind',
		name: 'kind',
		type: 'options',
		options: [
			{ name: 'A', value: 'a' },
			{ name: 'AAAA', value: 'aaaa' },
			{ name: 'CNAME', value: 'cname' },
			{ name: 'DMARC', value: 'dmarc' },
			{ name: 'MX', value: 'mx' },
			{ name: 'SPF', value: 'spf' },
			{ name: 'TXT', value: 'txt' },
		],
		default: 'spf',
		description: 'Which record to read. SPF and DMARC read the well-known TXT records.',
		displayOptions: { show: { ...showOnlyForTool, operation: ['checkRecord'] } },
		routing: { send: { type: 'body', property: 'kind' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showOnlyForTool, operation: ['checkRecord'], kind: ['a', 'aaaa', 'cname', 'txt'] } },
		options: [
			{
				displayName: 'Host',
				name: 'host',
				type: 'string',
				default: '',
				placeholder: 'www',
				description: 'A host label under the domain. Omit for the apex.',
				routing: { send: { type: 'body', property: 'host' } },
			},
		],
	},
	// Check Propagation
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'www.example.com',
		description: 'The DNS name to read from every location',
		displayOptions: { show: { ...showOnlyForTool, operation: ['propagation'] } },
		routing: { send: { type: 'body', property: 'name' } },
	},
	{
		displayName: 'Record Type',
		name: 'recordType',
		type: 'options',
		options: [
			{ name: 'A', value: 'A' },
			{ name: 'AAAA', value: 'AAAA' },
			{ name: 'CNAME', value: 'CNAME' },
			{ name: 'MX', value: 'MX' },
			{ name: 'NS', value: 'NS' },
			{ name: 'TXT', value: 'TXT' },
		],
		default: 'A',
		description: 'The record type to read',
		displayOptions: { show: { ...showOnlyForTool, operation: ['propagation'] } },
		routing: { send: { type: 'body', property: 'record_type' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showOnlyForTool, operation: ['propagation'] } },
		options: [
			{
				displayName: 'Expected Value',
				name: 'expectedValue',
				type: 'string',
				default: '',
				description:
					'The value every location should answer with. Without it the check reports whether all locations agree.',
				routing: { send: { type: 'body', property: 'expected_value' } },
			},
		],
	},
	// Check Reverse DNS
	{
		displayName: 'IP Address',
		name: 'ip',
		type: 'string',
		required: true,
		default: '',
		placeholder: '203.0.113.10',
		description: 'The IPv4 or IPv6 address to look up',
		displayOptions: { show: { ...showOnlyForTool, operation: ['reverseDns'] } },
		routing: { send: { type: 'body', property: 'ip' } },
	},
	// Count SPF Lookups
	{
		displayName: 'Input',
		name: 'spfInput',
		type: 'options',
		options: [
			{ name: 'Domain', value: 'domain' },
			{ name: 'Record', value: 'record' },
		],
		default: 'domain',
		description: 'Count the lookups of a domain’s published SPF record, or of a record you paste',
		displayOptions: { show: { ...showOnlyForTool, operation: ['spfCount'] } },
	},
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'example.com',
		description: 'The domain whose published SPF record to count',
		displayOptions: { show: { ...showOnlyForTool, operation: ['spfCount'], spfInput: ['domain'] } },
		routing: { send: { type: 'body', property: 'domain' } },
	},
	{
		displayName: 'SPF Record',
		name: 'record',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'v=spf1 include:_spf.example.net ~all',
		description: 'The SPF record text to count',
		displayOptions: { show: { ...showOnlyForTool, operation: ['spfCount'], spfInput: ['record'] } },
		routing: { send: { type: 'body', property: 'record' } },
	},
	// Validate DMARC Record
	{
		displayName: 'DMARC Record',
		name: 'record',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'v=DMARC1; p=none; rua=mailto:dmarc@example.com',
		description: 'The DMARC record text to validate',
		displayOptions: { show: { ...showOnlyForTool, operation: ['dmarcValidate'] } },
		routing: { send: { type: 'body', property: 'record' } },
	},
	// Build Parked Domain Records
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'example.com',
		description: 'The non-sending domain to harden',
		displayOptions: { show: { ...showOnlyForTool, operation: ['parkedRecords'] } },
		routing: { send: { type: 'body', property: 'domain' } },
	},
	{
		displayName: 'Owner Confirms No Mail',
		name: 'confirmNoMail',
		type: 'boolean',
		required: true,
		default: false,
		description:
			'Whether the human who owns the domain confirms it sends no email at all. Only they may decide it. It unlocks the question, not the answer: the server re-checks DNS for evidence of mail and refuses when it finds any.',
		displayOptions: { show: { ...showOnlyForTool, operation: ['parkedRecords'] } },
		routing: { send: { type: 'body', property: 'confirm_no_mail' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showOnlyForTool, operation: ['parkedRecords'] } },
		options: [
			{
				displayName: 'RUA Email',
				name: 'ruaEmail',
				type: 'string',
				default: '',
				placeholder: 'dmarc@example.com',
				description:
					'Mailbox to receive DMARC aggregate reports. Strongly recommended: without it nobody can see who sends as the domain.',
				routing: { send: { type: 'body', property: 'rua_email' } },
			},
		],
	},
	// Check Lookalikes
	{
		displayName: 'Domain',
		name: 'domain',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'example.com',
		description: 'The domain whose lookalike names to check',
		displayOptions: { show: { ...showOnlyForTool, operation: ['checkLookalikes'] } },
		routing: { send: { type: 'body', property: 'domain' } },
	},
	// Generate DMARC Record
	{
		displayName: 'Policy',
		name: 'policy',
		type: 'options',
		options: [
			{ name: 'None', value: 'none', description: 'Monitor only' },
			{ name: 'Quarantine', value: 'quarantine', description: 'Send failing mail to spam' },
			{ name: 'Reject', value: 'reject', description: 'Refuse failing mail outright' },
		],
		default: 'none',
		description:
			"The p= policy. Start at None unless the domain's aggregate reports already justify enforcement.",
		displayOptions: { show: { ...showOnlyForTool, operation: ['dmarcGenerate'] } },
		routing: { send: { type: 'body', property: 'policy' } },
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: { show: { ...showOnlyForTool, operation: ['dmarcGenerate'] } },
		options: [
			{
				displayName: 'RUA Email',
				name: 'ruaEmail',
				type: 'string',
				default: '',
				placeholder: 'dmarc@example.com',
				description:
					'Mailbox to receive DMARC aggregate reports. Strongly recommended: without it nobody can see who sends as the domain.',
				routing: { send: { type: 'body', property: 'rua_email' } },
			},
			{
				displayName: 'Strict Alignment',
				name: 'strictAlignment',
				type: 'boolean',
				default: false,
				description:
					'Whether to emit strict alignment (aspf=s adkim=s). Leave off unless every sender aligns strictly.',
				routing: { send: { type: 'body', property: 'strict_alignment' } },
			},
			{
				displayName: 'Subdomain Policy',
				name: 'subdomainPolicy',
				type: 'options',
				options: [
					{ name: 'None', value: 'none' },
					{ name: 'Quarantine', value: 'quarantine' },
					{ name: 'Reject', value: 'reject' },
				],
				default: 'none',
				description: 'An sp= policy for subdomains when it should differ from p=. Omit to inherit p=.',
				routing: { send: { type: 'body', property: 'subdomain_policy' } },
			},
		],
	},
	// Parse DMARC Report (sent as a multipart file by reportAsMultipart)
	{
		displayName: 'Report Encoding',
		name: 'reportEncoding',
		type: 'options',
		options: [
			{ name: 'XML Text', value: 'text', description: 'The report XML pasted or mapped as text' },
			{
				name: 'Base64',
				value: 'base64',
				description: 'The attachment bytes base64-encoded (.xml, .xml.gz or .zip)',
			},
		],
		default: 'text',
		description: 'How the report is given. Compressed (.gz, .zip) reports need Base64.',
		displayOptions: { show: { ...showOnlyForTool, operation: ['dmarcReportParse'] } },
	},
	{
		displayName: 'Report',
		name: 'report',
		type: 'string',
		typeOptions: { rows: 4 },
		required: true,
		default: '',
		description: 'One DMARC aggregate (RUA) report, up to 2 MiB decoded',
		displayOptions: { show: { ...showOnlyForTool, operation: ['dmarcReportParse'] } },
	},
];
