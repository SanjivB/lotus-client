/*
 * @copyright unseen, ehf
 */

'option strict';

var nacl = require('tweetnacl'),
	Enum = require('../enum').CurveZMQ,
	BufferView = require('../data/buffer-view');

module.exports = CurveZMQ;

function CurveZMQ(config, metaData) {
	this.config = config;
	this.metaData = metaData;

	this.serverPublicKeyPermanent = nacl.util.decodeBase64(this.config.serverPublicKey);
	this.publicKeyPermanent = nacl.util.decodeBase64(this.config.publicKey);
	this.secretKeyPermanent = nacl.util.decodeBase64(this.config.secretKey);

	var keys = nacl.box.keyPair();
	this.publicKeyTemporary = keys.publicKey;
	this.secretKeyTemporary = keys.secretKey;

	this.messageBufferView = new BufferView(new Uint8Array(this.config.bufferSize));
}

CurveZMQ.prototype.start = function(listeners, packetHelper) {
	this.packetHelper = packetHelper;
	this.listeners = listeners;
	this.keepAlive = false;
	this.state = Enum.State.SEND_HELLO;
}

CurveZMQ.prototype.open = function(keepAlive) {
	this.listeners.log.trace('CurveZMQ', 'Open');

	this.keepAlive = keepAlive;
	this.state = Enum.State.WAIT_WELCOME;

	var hello = this.encode_hello();
	if (hello) {
		this.short_nonce = hello.s_nonce;
		this.listeners.send(hello.pkt);
	}
}

CurveZMQ.prototype.onClose = function() {
	this.listeners.log.trace('CurveZMQ', 'onClose');

	if (this.state !== Enum.State.SEND_HELLO) {
		this.state = Enum.State.SEND_HELLO;
		this.listeners.onClose();
	}
}

CurveZMQ.prototype.send = function(data) {
	increment_nonce(this.short_nonce);
	var msg = this.encode_message(data, this.messageBufferView, this.short_nonce);
	this.listeners.send(msg.pkt);
}

CurveZMQ.prototype.receive = function(uint8Array) {
	var bufferView = new BufferView(uint8Array);

	switch (this.state) {
		case Enum.State.WAIT_WELCOME:
			var welcome = this.decode_welcome(bufferView);
			if (!welcome.err) {
				this.listeners.log.trace('CurveZMQ', 'Received welcome, sending initiate');
				this.state = Enum.State.WAIT_READY;

				this.serverPublicKeyTemporary = welcome.sk;
				increment_nonce(this.short_nonce);

				var metaData = this.packetHelper.writeMetaData(this.metaData.idToken, this.metaData.sessionToken);

				var pkt = this.encode_initiate(welcome.c, this.short_nonce, metaData);
				this.listeners.send(pkt);

			} else {
				this.listeners.log.error('CurveZMQ', welcome.err);
				this.listeners.close();
			}
			break;

		case Enum.State.WAIT_READY:
			var ready = this.decode_ready(bufferView);
			if (!ready.err) {
				this.listeners.log.trace('CurveZMQ', 'Ready');
				this.state = Enum.State.READY;
				this.srv_short_nonce = ready.s_nonce;
				this.listeners.open(this.keepAlive);

			} else {
				this.listeners.log.error('CurveZMQ', ready.err);
				this.listeners.close();
			}
			break;

		case Enum.State.READY:
			increment_nonce(this.srv_short_nonce);
			var message = this.decode_message(bufferView, this.srv_short_nonce);
			if (!message.err)
				this.listeners.forward(message.data);

			else {
				this.listeners.log.error('CurveZMQ', message.err);
				this.listeners.close();
			}
			break;

		default:
			this.listeners.log.error('CurveZMQ', 'Invalid adaptor state:' + this.state);
			this.listeners.close();
			break;
	}
}

CurveZMQ.prototype.encode_hello = function() {
	try {
		var pkt_hello = new BufferView(new Uint8Array(215 + 16));
		pkt_hello.fill(0);
		pkt_hello.rewind();
		pkt_hello.writeUTF8('HELLO');
		pkt_hello.writeUInt8(1);
		pkt_hello.writeUInt8(0);
		pkt_hello.fill(0, pkt_hello.offset, pkt_hello.offset + 72);
		pkt_hello.skip(72);
		pkt_hello.append(this.publicKeyTemporary);

		var nonce = gen_nonce('CurveZMQHELLO---', 8);
		var zeros = new Uint8Array(64);
		var box = nacl.box(zeros, nonce, this.serverPublicKeyPermanent, this.secretKeyTemporary);

		pkt_hello.append(nonce);
		pkt_hello.append(new Uint8Array(box.buffer));

		return {
			pkt: pkt_hello.buffer,
			s_nonce: nonce.subarray(16)
		};

	} catch (error) {
		this.listeners.log.error('CurveZMQ', error.message, error.code);
	}
}

CurveZMQ.prototype.decode_welcome = function(bufferView) {
	try {
		if (bufferView.length() !== (183 + 32))
			return {
				err: 'wrong length'
			};

		var cmd = bufferView.readUTF8(7);
		if (cmd !== 'WELCOME')
			return {
				err: 'wrong cmd'
			};

		var welcome_nonce = bufferView.slice(bufferView.offset, bufferView.offset + 24);
		bufferView.skip(24);
		var welcome = nacl.box.open(bufferView.slice(bufferView.offset + 16), welcome_nonce, this.serverPublicKeyPermanent, this.secretKeyTemporary);
		if (!welcome)
			return {
				err: 'authentication fails'
			};
		var serverPublicKeyTemporary = welcome.subarray(0, 32);

		var cookie = welcome.subarray(32);
		return {
			c: cookie,
			sk: serverPublicKeyTemporary
		};

	} catch (error) {
		this.listeners.log.error('CurveZMQ', error.message, error.code);
	}
}

CurveZMQ.prototype.decode_ready = function(bufferView) {
	try {
		if (bufferView.length() < 46)
			return {
				err: 'wrong length'
			};

		var cmd = bufferView.readUTF8(5);
		if (cmd !== 'READY')
			return {
				err: 'wrong cmd'
			};

		var ready_nonce = bufferView.slice(bufferView.offset, bufferView.offset + 24);
		bufferView.skip(24);

		var ready = nacl.box.open(bufferView.slice(bufferView.offset + 16), ready_nonce, this.serverPublicKeyTemporary, this.secretKeyTemporary);
		if (!ready)
			return {
				err: 'authentication fails'
			};
		// no need to check meta data for the time being
		return {
			s_nonce: ready_nonce.subarray(16)
		};

	} catch (error) {
		this.listeners.log.error('CurveZMQ', error.message, error.code);
	}
}

CurveZMQ.prototype.encode_initiate = function(cookie, short_nonce, metaData) {
	try {
		var vouch = new BufferView(new Uint8Array(120));
		var vouch_nonce = gen_nonce('VOUCH---', 16);
		vouch.append(vouch_nonce);
		vouch.append(this.publicKeyTemporary);
		vouch.append(this.serverPublicKeyPermanent);
		var vouch_box = nacl.box(vouch.slice(24, 24 + 64), vouch_nonce, this.serverPublicKeyTemporary, this.secretKeyPermanent);
		vouch.append(new Uint8Array(vouch_box.buffer), 24);

		var len = 8 + cookie.byteLength + 24 + 32 + vouch.length() + 32 + metaData.length;
		var pkt_initiate = new BufferView(new Uint8Array(len));
		pkt_initiate.writeUTF8('INITIATE');
		pkt_initiate.append(cookie);
		var mark = pkt_initiate.offset;
		pkt_initiate.writeUTF8('CurveZMQINITIATE');
		pkt_initiate.append(short_nonce);
		var initiate_nonce = pkt_initiate.slice(mark, pkt_initiate.offset);
		mark = pkt_initiate.offset;
		pkt_initiate.append(this.publicKeyPermanent);
		pkt_initiate.append(vouch.buffer);
		pkt_initiate.append(metaData);

		var init_box = nacl.box(pkt_initiate.slice(mark, pkt_initiate.offset), initiate_nonce, this.serverPublicKeyTemporary, this.secretKeyTemporary);
		pkt_initiate.append(new Uint8Array(init_box.buffer), mark);

		return pkt_initiate.buffer;

	} catch (error) {
		this.listeners.log.error('CurveZMQ', error.message, error.code);
	}
}

CurveZMQ.prototype.encode_message = function(payload, bufferView, short_nonce) {
	try {
		bufferView.rewind();
		bufferView.writeUTF8('MESSAGE');

		var mark = bufferView.offset;
		bufferView.writeUTF8('CurveZMQMESSAGE-');
		bufferView.append(short_nonce);
		var message_nonce = bufferView.slice(mark, bufferView.offset);

		mark = bufferView.offset;
		bufferView.append(payload);

		var box = nacl.box(bufferView.slice(mark, bufferView.offset), message_nonce, this.serverPublicKeyTemporary, this.secretKeyTemporary);
		var b = new Uint8Array(box.buffer);
		bufferView.append(b, mark);
		bufferView.set(mark + b.byteLength);
		return {
			pkt: bufferView.buffer.subarray(0, bufferView.offset)
		};

	} catch (error) {
		this.listeners.log.error('CurveZMQ', error.message, error.code);
	}
}

CurveZMQ.prototype.decode_message = function(bufferView, short_nonce) {
	try {
		if (bufferView.length() < 49)
			return {
				err: 'wrong length'
			};

		var cmd = bufferView.readUTF8(7);
		if (cmd !== 'MESSAGE')
			return {
				err: 'wrong cmd'
			};

		var message_nonce = bufferView.slice(bufferView.offset, bufferView.offset + 24);
		bufferView.skip(24);

		var expected_nonce = new BufferView(new Uint8Array(24));
		expected_nonce.writeUTF8('CurveZMQMESSAGE-');
		expected_nonce.append(short_nonce);

		var err = comp(expected_nonce.buffer, message_nonce);
		if (err)
			return {
				err: 'wrong nonce'
			};
		var message = nacl.box.open(bufferView.slice(bufferView.offset + 16), message_nonce, this.serverPublicKeyTemporary, this.secretKeyTemporary);
		if (!message)
			return {
				err: 'authentication fails'
			};

		return {
			data: message
		};

	} catch (error) {
		this.listeners.log.error('CurveZMQ', error.message, error.code);
	}
}

function increment_nonce(n) {
	var hi = (n[0] << 24 & 0xffffffff) | (n[1] << 16 & 0xffffff) | (n[2] << 8 & 0xffff) | (n[3] & 0xff);
	var lo = (n[4] << 24 & 0xffffffff) | (n[5] << 16 & 0xffffff) | (n[6] << 8 & 0xffff) | (n[7] & 0xff);
	lo += 1;
	if (lo >= Enum.MAX_INT) {
		lo -= Enum.MAX_INT;
		hi += 1;
	}
	n[0] = (hi >>> 24 & 0xff);
	n[1] = (hi >>> 16 & 0xff);
	n[2] = (hi >>> 8 & 0xff);
	n[3] = (hi & 0xff);
	n[4] = (lo >>> 24 & 0xff);
	n[5] = (lo >>> 16 & 0xff);
	n[6] = (lo >>> 8 & 0xff);
	n[7] = (lo & 0xff);
};

function comp(a, b) {
	if (a.byteLength == b.byteLength) {
		for (var i = 0; i < a.byteLength; i++)
			if (a[i] != b[i])
				return i + ':' + a[i] + '<->' + b[i];
	} else
		return 'len<>';
}

function gen_nonce(prefix, len) {
	var b = new Uint8Array(24);
	var buf = new BufferView(b);
	var start = buf.offset;
	buf.writeUTF8(prefix);
	var rnd = nacl.randomBytes(len);
	buf.append(rnd);
	return b;
}