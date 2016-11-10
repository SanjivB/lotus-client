/*
 * @copyright unseen, ehf
 */

'option strict';

var Enum = require('../lib/client/web/browser/enum'),
	Config = {
		mode: Enum.Mode.PROD,

		Packet: {
			bufferSize: 136 * 1024
		},

		Socket: {
			protocol: Enum.ServerProtocol.HTTP,
			device: Enum.Socket.Device.WEB_SOCKET,
			host: 'localhost',
			port: 8098,
			maxConnectAttempts: 100,
			connectTimeoutSecs: 10,
			reconnectWaitSecs: 1,
			requestTimeoutSecs: 15,
			blobTimeoutSecs: 60 * 60
		},

		Pipe: {
			maxListeners: 2 * 1024,

			HeartBeat: {
				intervalSecs: 30,
				timeoutSecs: 0
			},

			ChunkHandler: {
				maxSize: 100 * 1024 * 1024,
				chunkSize: 63 * 1024,
				timeoutSecs: 60,
				retrySecs: 1
			}
		},

		DataProtocol: {
			protocol: Enum.DataProtocol.CURVE_ZMQ,
			CurveZMQ: {
				bufferSize: 136 * 1024,
				serverPublicKey: '5Jz3NhPHKUYP2JfU2n+xsT8Q5xC57yhhWa2Mdprva0A=',
				publicKey: 'r4dHh2mSrijGSOK76k1DssBNcrjyGrV4LA9abowFTAk=',
				secretKey: 'Uih8sq+XRSbQO4ySOs0a0WovV8YDdw28efPf+NPt9M4='
			}
		},

		MetaData: {
			idToken: null,
			sessionToken: null
		}
	}

Config.Pipe.HeartBeat.timeoutSecs = Config.Pipe.HeartBeat.intervalSecs * 2 + 1;

module.exports = Config;