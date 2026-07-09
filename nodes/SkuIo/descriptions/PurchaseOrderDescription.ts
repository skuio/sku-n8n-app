import type { INodeProperties } from 'n8n-workflow';

export const purchaseOrderDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new purchase order',
				action: 'Create a purchase order',
			},
		],
		default: 'create',
	},

	// ----------------------------------------
	//          purchaseOrder: create
	// ----------------------------------------
	{
		displayName: 'Supplier Name or ID',
		name: 'supplier_id',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getSuppliers',
		},
		required: true,
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Purchase Order Date',
		name: 'purchase_order_date',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'YYYY-MM-DD',
		description: 'Date the purchase order is issued',
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Currency Code',
		name: 'currency_code',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'USD',
		description: 'Three-letter ISO 4217 currency code',
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Destination Warehouse Name or ID',
		name: 'destination_warehouse_id',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getWarehouses',
		},
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Purchase Order Number',
		name: 'purchase_order_number',
		type: 'string',
		default: '',
		description: 'Purchase order number to assign; leave empty to let SKU.io generate one',
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Estimated Delivery Date',
		name: 'estimated_delivery_date',
		type: 'string',
		default: '',
		placeholder: 'YYYY-MM-DD',
		description: 'Date the stock is expected to arrive',
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Supplier Notes',
		name: 'supplier_notes',
		type: 'string',
		default: '',
		description: 'Notes to share with the supplier',
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Purchase Order Lines',
		name: 'purchase_order_lines',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		default: {},
		placeholder: 'Add Line',
		description: 'Line items of the purchase order',
		displayOptions: {
			show: {
				resource: ['purchaseOrder'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Line',
				name: 'line',
				values: [
					{
						displayName: 'Amount',
						name: 'amount',
						type: 'string',
						required: true,
						default: '',
						description: 'Unit cost of the line as a string, e.g. "4.25"',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						default: '',
						description: 'Description of the line item',
					},
					{
						displayName: 'Discount',
						name: 'discount',
						type: 'number',
						default: 0,
						description: 'Discount applied to the line',
					},
					{
						displayName: 'Product Name or ID',
						name: 'product_id',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getProducts',
						},
						default: '',
						description:
							'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
					},
					{
						displayName: 'Quantity',
						name: 'quantity',
						type: 'number',
						required: true,
						default: 1,
						description: 'Quantity ordered',
					},
					{
						displayName: 'SKU',
						name: 'sku',
						type: 'string',
						default: '',
						description: 'SKU of the product on this line',
					},
				],
			},
		],
	},
];
