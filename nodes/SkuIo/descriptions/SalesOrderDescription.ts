import type { INodeProperties } from 'n8n-workflow';

export const salesOrderDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['salesOrder'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new sales order',
				action: 'Create a sales order',
			},
			{
				name: 'Find by Number',
				value: 'findByNumber',
				description: 'Find sales orders by sales order number',
				action: 'Find a sales order by number',
			},
		],
		default: 'create',
	},

	// ----------------------------------------
	//            salesOrder: create
	// ----------------------------------------
	{
		displayName: 'Order Date',
		name: 'order_date',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'YYYY-MM-DD',
		description: 'Date the order was placed',
		displayOptions: {
			show: {
				resource: ['salesOrder'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Order Status',
		name: 'order_status',
		type: 'options',
		required: true,
		// eslint-disable-next-line n8n-nodes-base/node-param-options-type-unsorted-items
		options: [
			{ name: 'Draft', value: 'draft' },
			{ name: 'Reserved', value: 'reserved' },
			{ name: 'Open', value: 'open' },
			{ name: 'Closed', value: 'closed' },
			{ name: 'Cancelled', value: 'cancelled' },
		],
		default: 'draft',
		description: 'Status the order is created with',
		displayOptions: {
			show: {
				resource: ['salesOrder'],
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
				resource: ['salesOrder'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Customer Name or ID',
		name: 'customer_id',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getCustomers',
		},
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		displayOptions: {
			show: {
				resource: ['salesOrder'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Store Name or ID',
		name: 'store_id',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getStores',
		},
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		displayOptions: {
			show: {
				resource: ['salesOrder'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Sales Order Number',
		name: 'sales_order_number',
		type: 'string',
		default: '',
		description: 'Order number to assign; leave empty to let SKU.io generate one',
		displayOptions: {
			show: {
				resource: ['salesOrder'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Customer PO Number',
		name: 'customer_po_number',
		type: 'string',
		default: '',
		description: 'Purchase order number supplied by the customer',
		displayOptions: {
			show: {
				resource: ['salesOrder'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Ship by Date',
		name: 'ship_by_date',
		type: 'string',
		default: '',
		placeholder: 'YYYY-MM-DD',
		description: 'Latest date the order should ship',
		displayOptions: {
			show: {
				resource: ['salesOrder'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Sales Order Lines',
		name: 'sales_order_lines',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		required: true,
		default: {},
		placeholder: 'Add Line',
		description: 'Line items of the sales order',
		displayOptions: {
			show: {
				resource: ['salesOrder'],
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
						description: 'Unit price of the line as a string, e.g. "19.99"',
					},
					{
						displayName: 'Description',
						name: 'description',
						type: 'string',
						required: true,
						default: '',
						description: 'Description of the line item',
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
					{
						displayName: 'Warehouse Name or ID',
						name: 'warehouse_id',
						type: 'options',
						typeOptions: {
							loadOptionsMethod: 'getWarehouses',
						},
						default: '',
						description:
							'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
					},
				],
			},
		],
	},

	// ----------------------------------------
	//         salesOrder: findByNumber
	// ----------------------------------------
	{
		displayName: 'Sales Order Number',
		name: 'sales_order_number',
		type: 'string',
		required: true,
		default: '',
		description: 'Sales order number to search for (exact match)',
		displayOptions: {
			show: {
				resource: ['salesOrder'],
				operation: ['findByNumber'],
			},
		},
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		typeOptions: {
			minValue: 1,
		},
		default: 50,
		description: 'Max number of results to return',
		displayOptions: {
			show: {
				resource: ['salesOrder'],
				operation: ['findByNumber'],
			},
		},
	},
];
