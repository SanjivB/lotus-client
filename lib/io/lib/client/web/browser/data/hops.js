/*
 * @copyright sanjiv.bhalla@gmail.com
 *
 * Released under the MIT license
 */

'option strict';

function elapsedMillisecs(startTime) {
	return Math.floor(Date.now() - startTime);
}

module.exports = Hops;

function Hops(key) {
	if (key) {
		return {
			key: Date.now()
		};

	} else {
		return {};
	}
};

Hops.new = function(key) {
	return new Hops(key);
}

Hops.addItem = function(hops, key) {
	hops[key] = Date.now();
	return hops;
}

Hops.removeItem = function(hops, key) {
	delete hops[key];
	return hops;
}

var computeDuration = function(hops, key) {
	var ms = hops[key];
	if (ms) {
		if (ms > 10000) {
			ms = elapsedMillisecs(ms);
			hops[key] = ms;
		}
		return ms;
	}
	return 0;
}

Hops.updateDuration = function(hops, key) {
	computeDuration(hops, key)
	return hops;
}

Hops.duration = function(hops, key, subKey1, subKey2) {
	var duration = 0;

	if (subKey1) {
		duration = computeDuration(hops, key) - computeDuration(hops, subKey1);
		if (subKey2) {
			duration = duration - computeDuration(hops, subKey2);
		}

	} else {
		duration = computeDuration(hops, key);
	}

	return duration;
}

Hops.totalDuration = function(hops, key, subKey1, subKey2) {
	var duration = 0;

	if (subKey1) {
		duration = computeDuration(hops, key) + computeDuration(hops, subKey1);
		if (subKey2) {
			duration = duration + computeDuration(hops, subKey2);
		}

	} else {
		duration = computeDuration(hops, key);
	}

	return duration;
}

Hops.toJson = function(hops) {
	return JSON.stringify(hops);
}

Hops.fromJson = function(jsonString) {
	return JSON.parse(jsonString);
}