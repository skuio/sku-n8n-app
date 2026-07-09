import type {
	IDataObject,
	IExecuteFunctions,
	ILoadOptionsFunctions,
	INodeExecutionData,
	INodePropertyOptions,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import {
	customerDescription,
	inventoryDescription,
	productDescription,
	purchaseOrderDescription,
	salesOrderDescription,
	supplierDescription,
} from './descriptions';
import { compact, loadIdNameOptions, skuIoApiRequest, unwrapList } from './GenericFunctions';

/**
 * Pull the line items out of a fixedCollection value (`{line: [{...}]}`)
 * and compact each line so blanks never reach the API.
 */
function collectLines(collection: IDataObject): IDataObject[] {
	return ((collection.line as IDataObject[] | undefined) ?? []).map((line) => compact(line));
}

export class SkuIo implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'SKU.io',
		name: 'skuIo',
		icon: 'file:skuio.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Consume the SKU.io API',
		defaults: {
			name: 'SKU.io',
		},
		usableAsTool: true,
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'skuIoOAuth2Api',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Customer', value: 'customer' },
					{ name: 'Inventory', value: 'inventory' },
					{ name: 'Product', value: 'product' },
					{ name: 'Purchase Order', value: 'purchaseOrder' },
					{ name: 'Sales Order', value: 'salesOrder' },
					{ name: 'Supplier', value: 'supplier' },
				],
				default: 'salesOrder',
			},
			...customerDescription,
			...inventoryDescription,
			...productDescription,
			...purchaseOrderDescription,
			...salesOrderDescription,
			...supplierDescription,
		],
	};

	methods = {
		loadOptions: {
			async getCustomers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await loadIdNameOptions.call(this, '/v2/customers', ['name', 'company', 'email']);
			},
			async getProducts(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await loadIdNameOptions.call(this, '/v2/products/lookup', ['name', 'sku']);
			},
			async getStores(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await loadIdNameOptions.call(this, '/v2/stores', ['name']);
			},
			async getSuppliers(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await loadIdNameOptions.call(this, '/v2/suppliers', ['name', 'company_name']);
			},
			async getWarehouses(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				return await loadIdNameOptions.call(this, '/v2/warehouses', ['name']);
			},
		},
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let output: IDataObject[] | undefined;

				if (resource === 'salesOrder') {
					if (operation === 'create') {
						const linesCollection = this.getNodeParameter(
							'sales_order_lines',
							i,
							{},
						) as IDataObject;

						const body = compact({
							order_date: this.getNodeParameter('order_date', i) as string,
							order_status: this.getNodeParameter('order_status', i) as string,
							currency_code: this.getNodeParameter('currency_code', i) as string,
							customer_id: this.getNodeParameter('customer_id', i, '') as string | number,
							store_id: this.getNodeParameter('store_id', i, '') as string | number,
							sales_order_number: this.getNodeParameter('sales_order_number', i, '') as string,
							customer_po_number: this.getNodeParameter('customer_po_number', i, '') as string,
							ship_by_date: this.getNodeParameter('ship_by_date', i, '') as string,
							sales_order_lines: collectLines(linesCollection),
						});

						const response = await skuIoApiRequest.call(this, 'POST', '/sales-orders', body);
						output = [(response.data as IDataObject | undefined) ?? response];
					} else if (operation === 'findByNumber') {
						const response = await skuIoApiRequest.call(
							this,
							'GET',
							'/sales-orders/list',
							{},
							{
								'filter[sales_order_number.is]': this.getNodeParameter(
									'sales_order_number',
									i,
								) as string,
								per_page: this.getNodeParameter('limit', i) as number,
							},
						);
						output = unwrapList(response);
					}
				} else if (resource === 'purchaseOrder') {
					if (operation === 'create') {
						const linesCollection = this.getNodeParameter(
							'purchase_order_lines',
							i,
							{},
						) as IDataObject;

						const body = compact({
							supplier_id: this.getNodeParameter('supplier_id', i) as string | number,
							purchase_order_date: this.getNodeParameter('purchase_order_date', i) as string,
							currency_code: this.getNodeParameter('currency_code', i) as string,
							destination_warehouse_id: this.getNodeParameter('destination_warehouse_id', i, '') as
								| string
								| number,
							purchase_order_number: this.getNodeParameter(
								'purchase_order_number',
								i,
								'',
							) as string,
							estimated_delivery_date: this.getNodeParameter(
								'estimated_delivery_date',
								i,
								'',
							) as string,
							supplier_notes: this.getNodeParameter('supplier_notes', i, '') as string,
							purchase_order_lines: collectLines(linesCollection),
						});

						const response = await skuIoApiRequest.call(this, 'POST', '/purchase-orders', body);
						output = [(response.data as IDataObject | undefined) ?? response];
					}
				} else if (resource === 'product') {
					if (operation === 'create') {
						const body = compact({
							sku: this.getNodeParameter('sku', i) as string,
							name: this.getNodeParameter('name', i) as string,
							type: this.getNodeParameter('type', i) as string,
							barcode: this.getNodeParameter('barcode', i, '') as string,
							description: this.getNodeParameter('description', i, '') as string,
							unit_cost: this.getNodeParameter('unit_cost', i, '') as string,
						});

						const response = await skuIoApiRequest.call(this, 'POST', '/products', body);
						output = [(response.data as IDataObject | undefined) ?? response];
					} else if (operation === 'update') {
						const id = this.getNodeParameter('id', i) as string | number;
						const updateFields = this.getNodeParameter('updateFields', i, {}) as IDataObject;

						const response = await skuIoApiRequest.call(
							this,
							'PUT',
							`/products/${id}`,
							compact(updateFields),
						);
						output = [(response.data as IDataObject | undefined) ?? response];
					} else if (operation === 'findBySku') {
						const response = await skuIoApiRequest.call(
							this,
							'GET',
							'/v2/products',
							{},
							{
								'filter[sku.is]': this.getNodeParameter('sku', i) as string,
								per_page: this.getNodeParameter('limit', i) as number,
							},
						);
						output = unwrapList(response);
					}
				} else if (resource === 'customer') {
					if (operation === 'create') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;

						const body = compact({
							name: this.getNodeParameter('name', i) as string,
							...additionalFields,
						});

						const response = await skuIoApiRequest.call(this, 'POST', '/customers', body);
						output = [(response.data as IDataObject | undefined) ?? response];
					} else if (operation === 'findByEmail') {
						const response = await skuIoApiRequest.call(
							this,
							'GET',
							'/v2/customers',
							{},
							{
								'filter[email.is]': this.getNodeParameter('email', i) as string,
								per_page: this.getNodeParameter('limit', i) as number,
							},
						);
						output = unwrapList(response);
					}
				} else if (resource === 'supplier') {
					if (operation === 'create') {
						const additionalFields = this.getNodeParameter(
							'additionalFields',
							i,
							{},
						) as IDataObject;
						const { phone, address1, address2, city, province, zip, country_code, ...rest } =
							additionalFields;

						const body = compact({
							name: this.getNodeParameter('name', i) as string,
							...rest,
							address: { phone, address1, address2, city, province, zip, country_code },
						});

						const response = await skuIoApiRequest.call(this, 'POST', '/suppliers', body);
						output = [(response.data as IDataObject | undefined) ?? response];
					} else if (operation === 'findByName') {
						const response = await skuIoApiRequest.call(
							this,
							'GET',
							'/v2/suppliers',
							{},
							{
								'filter[name.contains]': this.getNodeParameter('name', i) as string,
								per_page: this.getNodeParameter('limit', i) as number,
							},
						);
						output = unwrapList(response);
					}
				} else if (resource === 'inventory') {
					if (operation === 'createAdjustment') {
						const body = compact({
							adjustment_date: this.getNodeParameter('adjustment_date', i) as string,
							product_id: this.getNodeParameter('product_id', i) as string | number,
							warehouse_id: this.getNodeParameter('warehouse_id', i) as string | number,
							adjustment_type: this.getNodeParameter('adjustment_type', i) as string,
							quantity: this.getNodeParameter('quantity', i) as number,
							unit_cost: this.getNodeParameter('unit_cost', i, '') as string,
							notes: this.getNodeParameter('notes', i, '') as string,
						});

						const response = await skuIoApiRequest.call(
							this,
							'POST',
							'/inventory-adjustments',
							body,
						);
						output = [(response.data as IDataObject | undefined) ?? response];
					}
				}

				if (output === undefined) {
					throw new NodeOperationError(
						this.getNode(),
						`The operation "${operation}" is not supported for resource "${resource}"`,
						{ itemIndex: i },
					);
				}

				returnData.push(
					...this.helpers.constructExecutionMetaData(this.helpers.returnJsonArray(output), {
						itemData: { item: i },
					}),
				);
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push(
						...this.helpers.constructExecutionMetaData(
							this.helpers.returnJsonArray({ error: (error as Error).message }),
							{ itemData: { item: i } },
						),
					);
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
