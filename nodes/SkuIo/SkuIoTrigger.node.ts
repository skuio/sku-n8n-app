import crypto from 'node:crypto';

import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';

import { skuIoApiRequest } from './GenericFunctions';

/**
 * REST-hook trigger: subscribes this workflow's webhook URL to one SKU.io
 * event via POST /webhook-subscriptions and verifies each delivery's
 * `X-SKU-Signature: sha256=<hex>` HMAC against the per-subscription secret
 * (returned exactly once at create time, kept in workflow static data).
 */
export class SkuIoTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SKU.io Trigger',
		name: 'skuIoTrigger',
		icon: 'file:skuio.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["event"]}}',
		description: 'Starts a workflow when an event happens in SKU.io',
		defaults: {
			name: 'SKU.io Trigger',
		},
		inputs: [],
		outputs: ['main'],
		credentials: [
			{
				name: 'skuIoOAuth2Api',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Event',
				name: 'event',
				type: 'options',
				required: true,
				default: 'sales_order.created',
				description: 'The SKU.io event that starts the workflow',
				options: [
					{
						name: 'Inventory Adjusted',
						value: 'inventory.adjusted',
					},
					{
						name: 'New Customer',
						value: 'customer.created',
					},
					{
						name: 'New Product',
						value: 'product.created',
					},
					{
						name: 'New Purchase Order',
						value: 'purchase_order.created',
					},
					{
						name: 'New Sales Order',
						value: 'sales_order.created',
					},
					{
						name: 'Purchase Order Approved',
						value: 'purchase_order.approved',
					},
					{
						name: 'Purchase Order Received',
						value: 'purchase_order.received',
					},
					{
						name: 'Purchase Order Submitted',
						value: 'purchase_order.submitted',
					},
					{
						name: 'Sales Order Cancelled',
						value: 'sales_order.cancelled',
					},
					{
						name: 'Sales Order Shipped',
						value: 'sales_order.shipped',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');

				if (staticData.webhookId === undefined) {
					return false;
				}

				let response: IDataObject;
				try {
					response = await skuIoApiRequest.call(
						this,
						'GET',
						`/webhook-subscriptions/${staticData.webhookId}`,
					);
				} catch {
					delete staticData.webhookId;
					delete staticData.webhookSecret;
					return false;
				}

				const subscription = (response.data ?? response) as IDataObject;

				if (
					subscription.is_active === true &&
					subscription.target_url === this.getNodeWebhookUrl('default')
				) {
					return true;
				}

				delete staticData.webhookId;
				delete staticData.webhookSecret;
				return false;
			},

			async create(this: IHookFunctions): Promise<boolean> {
				const webhookUrl = this.getNodeWebhookUrl('default');
				const event = this.getNodeParameter('event') as string;

				const response = await skuIoApiRequest.call(this, 'POST', '/webhook-subscriptions', {
					event,
					target_url: webhookUrl,
				});

				const subscription = (response.data ?? response) as IDataObject;

				const staticData = this.getWorkflowStaticData('node');
				staticData.webhookId = subscription.id;
				staticData.webhookSecret = subscription.secret;

				return true;
			},

			async delete(this: IHookFunctions): Promise<boolean> {
				const staticData = this.getWorkflowStaticData('node');

				if (staticData.webhookId !== undefined) {
					try {
						await skuIoApiRequest.call(
							this,
							'DELETE',
							`/webhook-subscriptions/${staticData.webhookId}`,
						);
					} catch {
						// DELETE is idempotent on the SKU.io side; a subscription that is
						// already gone must not block deactivating the workflow.
					}
				}

				delete staticData.webhookId;
				delete staticData.webhookSecret;

				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const staticData = this.getWorkflowStaticData('node');
		const secret = staticData.webhookSecret;

		if (typeof secret === 'string' && secret !== '') {
			const headers = this.getHeaderData() as IDataObject;
			const signatureHeader = headers['x-sku-signature'];
			const providedSignature =
				typeof signatureHeader === 'string' && signatureHeader.startsWith('sha256=')
					? signatureHeader.slice('sha256='.length)
					: '';

			const request = this.getRequestObject() as unknown as { rawBody?: Buffer };
			const rawBody = Buffer.isBuffer(request.rawBody)
				? request.rawBody
				: Buffer.from(JSON.stringify(this.getBodyData()), 'utf8');

			const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

			const providedBuffer = Buffer.from(providedSignature, 'utf8');
			const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
			const signatureIsValid =
				providedBuffer.length === expectedBuffer.length &&
				crypto.timingSafeEqual(providedBuffer, expectedBuffer);

			if (!signatureIsValid) {
				const response = this.getResponseObject();
				response.status(401).json({ message: 'Invalid signature' });
				return { noWebhookResponse: true };
			}
		}

		return {
			workflowData: [this.helpers.returnJsonArray(this.getBodyData() as IDataObject)],
		};
	}
}
