import type { INodeProperties } from 'n8n-workflow';

export const productDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['product'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new product',
				action: 'Create a product',
			},
			{
				name: 'Find by SKU',
				value: 'findBySku',
				description: 'Find products by SKU',
				action: 'Find a product by SKU',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an existing product',
				action: 'Update a product',
			},
		],
		default: 'create',
	},

	// ----------------------------------------
	//             product: create
	// ----------------------------------------
	{
		displayName: 'SKU',
		name: 'sku',
		type: 'string',
		required: true,
		default: '',
		description: 'Unique SKU of the product',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Name of the product',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		required: true,
		options: [
			{ name: 'Blemished', value: 'blemished' },
			{ name: 'Bundle', value: 'bundle' },
			{ name: 'Kit', value: 'kit' },
			{ name: 'Manufactured', value: 'manufactured' },
			{ name: 'Matrix', value: 'matrix' },
			{ name: 'Standard', value: 'standard' },
		],
		default: 'standard',
		description: 'Type of the product',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Barcode',
		name: 'barcode',
		type: 'string',
		default: '',
		description: 'Barcode of the product (UPC, EAN, etc)',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		default: '',
		description: 'Description of the product',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Unit Cost',
		name: 'unit_cost',
		type: 'string',
		default: '',
		description: 'Unit cost as a string, e.g. "4.25"',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['create'],
			},
		},
	},

	// ----------------------------------------
	//             product: update
	// ----------------------------------------
	{
		displayName: 'Product Name or ID',
		name: 'id',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getProducts',
		},
		required: true,
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['update'],
			},
		},
	},
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		default: {},
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Barcode',
				name: 'barcode',
				type: 'string',
				default: '',
				description: 'Barcode of the product (UPC, EAN, etc)',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Name of the product',
			},
			{
				displayName: 'SKU',
				name: 'sku',
				type: 'string',
				default: '',
				description: 'Unique SKU of the product',
			},
			{
				displayName: 'Type',
				name: 'type',
				type: 'options',
				options: [
					{ name: 'Blemished', value: 'blemished' },
					{ name: 'Bundle', value: 'bundle' },
					{ name: 'Kit', value: 'kit' },
					{ name: 'Manufactured', value: 'manufactured' },
					{ name: 'Matrix', value: 'matrix' },
					{ name: 'Standard', value: 'standard' },
				],
				default: 'standard',
				description: 'Type of the product',
			},
			{
				displayName: 'Unit Cost',
				name: 'unit_cost',
				type: 'string',
				default: '',
				description: 'Unit cost as a string, e.g. "4.25"',
			},
		],
	},

	// ----------------------------------------
	//            product: findBySku
	// ----------------------------------------
	{
		displayName: 'SKU',
		name: 'sku',
		type: 'string',
		required: true,
		default: '',
		description: 'SKU to search for (exact match)',
		displayOptions: {
			show: {
				resource: ['product'],
				operation: ['findBySku'],
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
				resource: ['product'],
				operation: ['findBySku'],
			},
		},
	},
];
