import type { ICredentialType, INodeProperties } from 'n8n-workflow';

/**
 * OAuth2 credential for SKU.io (Laravel Passport, authorization-code grant).
 *
 * Unlike Zapier/Make there is NO shared first-party OAuth client: every n8n
 * instance has its own callback URL (self-hosted `https://<host>/rest/oauth2-credential/callback`,
 * cloud `https://oauth.n8n.cloud/oauth2/callback`), so each user registers
 * their own OAuth client in SKU.io → Settings → Developer → OAuth Apps with
 * that callback URL and pastes the client ID/secret here.
 *
 * One OAuth connection = one tenant, chosen on the SKU.io consent screen.
 */
export class SkuIoOAuth2Api implements ICredentialType {
	name = 'skuIoOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'SKU.io OAuth2 API';

	// eslint-disable-next-line n8n-nodes-base/cred-class-field-documentation-url-miscased, n8n-nodes-base/cred-class-field-documentation-url-not-http-url
	documentationUrl = 'https://developer.sku.io';

	httpRequestNode = {
		name: 'SKU.io',
		docsUrl: 'https://developer.sku.io',
		apiBaseUrl: 'https://app.sku.io/api/',
	};

	properties: INodeProperties[] = [
		{
			displayName: 'Base URL',
			name: 'baseUrl',
			type: 'string',
			default: 'https://app.sku.io',
			description:
				'SKU.io application URL. Leave as the default unless connecting to a non-production environment.',
		},
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'hidden',
			default: '={{$self["baseUrl"]}}/oauth/authorize',
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'hidden',
			default: '={{$self["baseUrl"]}}/oauth/token',
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default:
				'orders:read orders:write products:read products:write inventory:read inventory:write customers:read customers:write suppliers:read suppliers:write purchase-orders:read purchase-orders:write warehouses:read settings:read webhooks:manage',
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: '',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'header',
		},
	];
}
