import type { INodeProperties } from 'n8n-workflow';

export const customerDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['customer'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new customer',
				action: 'Create a customer',
			},
			{
				name: 'Find by Email',
				value: 'findByEmail',
				description: 'Find customers by email address',
				action: 'Find a customer by email',
			},
		],
		default: 'create',
	},

	// ----------------------------------------
	//            customer: create
	// ----------------------------------------
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		description: 'Full name of the customer',
		displayOptions: {
			show: {
				resource: ['customer'],
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
				resource: ['customer'],
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
				displayName: 'Company',
				name: 'company',
				type: 'string',
				default: '',
				description: 'Company the customer belongs to',
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
				description: 'Email address of the customer',
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Phone number of the customer',
			},
			{
				displayName: 'Province',
				name: 'province',
				type: 'string',
				default: '',
				description: 'State or province of the address',
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
	//          customer: findByEmail
	// ----------------------------------------
	{
		displayName: 'Email',
		name: 'email',
		type: 'string',
		required: true,
		default: '',
		placeholder: 'name@email.com',
		description: 'Email address to search for (exact match)',
		displayOptions: {
			show: {
				resource: ['customer'],
				operation: ['findByEmail'],
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
				resource: ['customer'],
				operation: ['findByEmail'],
			},
		},
	},
];
