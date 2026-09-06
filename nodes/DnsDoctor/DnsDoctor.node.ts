import { NodeConnectionTypes, type INodeType, type INodeTypeDescription } from 'n8n-workflow';
import { domainDescription } from './resources/domain';
import { monitoringDescription } from './resources/monitoring';
import { toolDescription } from './resources/tool';

export class DnsDoctor implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'DNS Doctor',
		name: 'dnsDoctor',
		icon: { light: 'file:../../icons/dnsdoctor.svg', dark: 'file:../../icons/dnsdoctor.dark.svg' },
		group: ['input'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description:
			"Scan, diagnose and fix a domain's DNS and email authentication (SPF, DMARC, DKIM) with DNS Doctor",
		defaults: {
			name: 'DNS Doctor',
		},
		usableAsTool: true,
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'dnsDoctorApi',
				required: false,
			},
		],
		requestDefaults: {
			baseURL: 'https://dnsdoctor.dev',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				'User-Agent': 'dnsdoctor-n8n/0.1.0 (+https://dnsdoctor.dev)',
			},
		},
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Domain',
						value: 'domain',
					},
					{
						name: 'Monitoring',
						value: 'monitoring',
					},
					{
						name: 'Tool',
						value: 'tool',
					},
				],
				default: 'domain',
			},
			...domainDescription,
			...toolDescription,
			...monitoringDescription,
		],
	};
}
