import type { INodeProperties } from 'n8n-workflow';

export const supplierDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['supplier'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new supplier',
				action: 'Create a supplier',
			},
			{
				name: 'Find by Name',
				value: 'findByName',
				description: 'Find suppliers by name',
				action: 'Find a supplier by name',
			},
		],
		default: 'create',
	},

	// ----------------------------------------
	//            supplier: create
	// ----------------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Name of the supplier',
		displayOptions: {
			show: {
				resource: ['supplier'],
				operation: ['create'],
			},
		},
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		default: {},
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['supplier'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'Address 1',
				name: 'address1',
				type: 'string',
				default: '',
				description: 'First line of the street address',
			},
			{
				displayName: 'Address 2',
				name: 'address2',
				type: 'string',
				default: '',
				description: 'Second line of the street address',
			},
			{
				displayName: 'City',
				name: 'city',
				type: 'string',
				default: '',
				description: 'City of the address',
			},
			{
				displayName: 'Company Name',
				name: 'company_name',
				type: 'string',
				default: '',
				description: 'Legal company name of the supplier',
			},
			{
				displayName: 'Country Code',
				name: 'country_code',
				type: 'string',
				default: '',
				placeholder: 'US',
				description: 'Two-letter ISO 3166-1 country code',
			},
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				default: '',
				placeholder: 'name@email.com',
				description: 'Email address of the supplier',
			},
			{
				displayName: 'Lead Time',
				name: 'leadtime',
				type: 'number',
				default: 0,
				description: 'Lead time in days',
			},
			{
				displayName: 'Minimum Order Quantity',
				name: 'minimum_order_quantity',
				type: 'number',
				default: 0,
				description: 'Minimum quantity the supplier accepts per order',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Phone number of the supplier',
			},
			{
				displayName: 'Primary Contact Name',
				name: 'primary_contact_name',
				type: 'string',
				default: '',
				description: 'Name of the primary contact person',
			},
			{
				displayName: 'Province',
				name: 'province',
				type: 'string',
				default: '',
				description: 'State or province of the address',
			},
			{
				displayName: 'Purchase Order Email',
				name: 'purchase_order_email',
				type: 'string',
				default: '',
				placeholder: 'name@email.com',
				description: 'Email address purchase orders are sent to',
			},
			{
				displayName: 'Website',
				name: 'website',
				type: 'string',
				default: '',
				description: 'Website of the supplier',
			},
			{
				displayName: 'ZIP Code',
				name: 'zip',
				type: 'string',
				default: '',
				description: 'ZIP or postal code of the address',
			},
		],
	},

	// ----------------------------------------
	//          supplier: findByName
	// ----------------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Name to search for (partial match)',
		displayOptions: {
			show: {
				resource: ['supplier'],
				operation: ['findByName'],
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
				resource: ['supplier'],
				operation: ['findByName'],
			},
		},
	},
];
