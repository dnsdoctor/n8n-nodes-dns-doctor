import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class DnsDoctorApi implements ICredentialType {
	name = 'dnsDoctorApi';

	displayName = 'DNS Doctor API';

	icon: Icon = { light: 'file:../icons/dnsdoctor.svg', dark: 'file:../icons/dnsdoctor.dark.svg' };

	documentationUrl = 'https://github.com/dnsdoctor/n8n-nodes-dns-doctor#credentials';

	properties: INodeProperties[] = [
		{
			displayName: 'API Token',
			name: 'apiToken',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description:
				'A DNS Doctor API token (Dashboard > Settings > API tokens). Optional for scans and tools; required for the monitoring reads. Raises the anonymous rate limit.',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiToken}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://dnsdoctor.dev',
			url: '/api/v1/domains',
			method: 'GET',
		},
	};
}
