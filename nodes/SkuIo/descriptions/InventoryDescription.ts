import type { INodeProperties } from 'n8n-workflow';

export const inventoryDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['inventory'],
			},
		},
		options: [
			{
				name: 'Create Adjustment',
				value: 'createAdjustment',
				description: 'Create a new inventory adjustment',
				action: 'Create an inventory adjustment',
			},
		],
		default: 'createAdjustment',
	},

	// ----------------------------------------
	//       inventory: createAdjustment
	// ----------------------------------------
	{
		displayName: 'Adjustment Date',
		name: 'adjustment_date',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'YYYY-MM-DD',
		description: 'Date the adjustment takes effect',
		displayOptions: {
			show: {
				resource: ['inventory'],
				operation: ['createAdjustment'],
			},
		},
	},
	{
		displayName: 'Product Name or ID',
		name: 'product_id',
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
				resource: ['inventory'],
				operation: ['createAdjustment'],
			},
		},
	},
	{
		displayName: 'Warehouse Name or ID',
		name: 'warehouse_id',
		type: 'options',
		typeOptions: {
			loadOptionsMethod: 'getWarehouses',
		},
		required: true,
		default: '',
		description:
			'Choose from the list, or specify an ID using an <a href="https://docs.n8n.io/code/expressions/">expression</a>',
		displayOptions: {
			show: {
				resource: ['inventory'],
				operation: ['createAdjustment'],
			},
		},
	},
	{
		displayName: 'Adjustment Type',
		name: 'adjustment_type',
		type: 'options',
		required: true,
		options: [
			{ name: 'Increase', value: 'increase' },
			{ name: 'Decrease', value: 'decrease' },
			{ name: 'Set', value: 'set' },
		],
		default: 'increase',
		description: 'Whether to increase, decrease, or set the on-hand quantity',
		displayOptions: {
			show: {
				resource: ['inventory'],
				operation: ['createAdjustment'],
			},
		},
	},
	{
		displayName: 'Quantity',
		name: 'quantity',
		type: 'number',
		required: true,
		default: 1,
		description: 'Quantity to adjust by, or the new quantity when the type is "set"',
		displayOptions: {
			show: {
				resource: ['inventory'],
				operation: ['createAdjustment'],
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
				resource: ['inventory'],
				operation: ['createAdjustment'],
			},
		},
	},
	{
		displayName: 'Notes',
		name: 'notes',
		type: 'string',
		default: '',
		description: 'Reason or reference for the adjustment',
		displayOptions: {
			show: {
				resource: ['inventory'],
				operation: ['createAdjustment'],
			},
		},
	},
];
