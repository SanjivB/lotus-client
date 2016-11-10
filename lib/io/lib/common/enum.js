/*
 * @copyright unseen, ehf
 */

'option strict';

module.exports = {
	Mode: {
		DEV: 'DEV',
		PROD: 'PROD'
	},

	Status: {
		SUCCESS: 0,
		ERROR: 1
	},

	ServerProtocol: {
		HTTP: 'HTTP',
		HTTPS: 'HTTPS'
	},

	DataProtocol: {
		SIMPLE: 'SIMPLE',
		CURVE_ZMQ: 'CURVE_ZMQ'
	},

	CurveZMQ: {
		State: {
			SEND_HELLO: 'SEND_HELLO',
			WAIT_WELCOME: 'WAIT_WELCOME',
			READY: 'READY'
		},

		MAX_INT: Math.pow(2, 32)
	},

	Socket: {
		KEEP_ALIVE: true,

		HTTPLongPoll: {
			Command: {
				CONNECT: 1,
				OPEN: 2,
				MESSAGE: 3,
				CLOSE: 4
			},

			State: {
				UNSENT: 0,
				OPENED: 1,
				HEADERS_RECEIVED: 2,
				LOADING: 3,
				DONE: 4
			},

			Status: {
				SUCCESSFULL: 200
			},

			responseTimeoutMillisecs: 500
		}
	},

	Pipe: {
		EVP_VER: 1,
		EVP_PATH: '/_evp',

		MAX_INT: Math.pow(2, 32),

		Command: {
			OPEN: 1,
			PING: 2,
			CLOSE: 3,
			EVENT: 4,
			REQUEST: 5,
			RESPONSE: 6,
			START_TRANSFER: 7,
			TRANSFER: 8,
			TRANSFER_ERROR: 9,
			END_TRANSFER: 10,
			PAUSE_TRANSFER: 11,
			RESUME_TRANSFER: 12
		},

		State: {
			WAIT_READY: 'WAIT_READY',
			READY: 'READY'
		},

		Status: {
			CONNECTION_OPENED: 'CONNECTION_OPENED',
			CONNECTION_CLOSED: 'CONNECTION_CLOSED',
			SESSION_RESTORED: 'SESSION_RESTORED',
			SESSION_UPDATED: 'SESSION_UPDATED',
			SESSION_FAILED: 'SESSION_FAILED',
			MAX_CONNECT_ATTEMPTS: 'MAX_CONNECT_ATTEMPTS'
		},

		ResponseCode: {
			SUCCESS: 1,
			ERROR_SERVER: 501,
			ERROR_UNSUPPORTED: 502,
			ERROR_UNAUTHORISED: 403,
			ERROR_NO_ENTITY: 404,
			ERROR_SOCKET: 498,
			ERROR_TIMEOUT: 499
		}
	},

	Packet: {
		IO: {
			Flag: {
				NONE: 0,
				ACKNOWLEDGE: 1
			}
		},

		Client: {
			Flag: {
				REQUEST: 0,
				BLOB_SEND_REQUEST: 2,
				BLOB_RECEIVE_REQUEST: 3,
				RESPONSE: 4,
				FORWARD_RESPONSE: 7,
				INTERNAL_RESPONSE: 9,
				QUEUE_EVENT: 10,
				QUEUE_REQUEST: 11,
				QUEUE_RESPONSE: 12,
				REST_REQUEST: 13,
				REST_RESPONSE: 14
			}
		},

		Hop: {
			BLOB: 'BLOB',
			CLIENT: 'CLIENT',
			SERVER: 'SERVER',
			SERVER_BUFFER: 'SERVER_BUFFER',
			ROUTER_IN: 'ROUTER_IN',
			ROUTER_OUT: 'ROUTER_OUT',
			EXECUTOR: 'EXECUTOR',
			COMMAND: 'COMMAND'
		}
	},

	Blob: {
		ObjectType: {
			UNKNOWN: 0,
			BYTE: 1,
			SHORT_INTEGER: 2,
			INTEGER: 3,
			STRING: 4,
			JSON: 5,
			ARRAY: 6,
			ARRAY_BUFFER: 7,
			UINT8ARRAY: 8,
			BUFFER: 9,
			Key: {
				0: 'UNKNOWN',
				1: 'BYTE',
				2: 'SHORT_INTEGER',
				3: 'INTEGER',
				4: 'STRING',
				5: 'JSON',
				6: 'ARRAY',
				7: 'ARRAY_BUFFER',
				8: 'UINT8ARRAY',
				9: 'BUFFER'
			}
		},

		Offset: {
			PACKET_LENGTH: 4,
			DATA_OBJECT_METADATA: 5
		}
	},

	ChunkHandler: {
		Type: {
			DATAPACKET: 1,
			FILE: 2
		},
		Direction: {
			SEND: 1,
			RECEIVE: 2
		}
	}
};