var PushWoosh = {
	getHWId : function() {
		return device.uuid;
	},

	register : function(token, lambda, lambdaerror) {
		glog2.log("token lambda", lambda);
		glog2.log("register lambda", lambda);
		glog2.log("register lambdaerror", lambdaerror);
		var method = 'POST';
		var url = PushWoosh.baseurl + 'registerDevice';

		var offset = new Date().getTimezoneOffset() * 60;
		//in seconds

		var language = window.navigator.language;
		var lang = 'en';
		if (language) {
			lang = language.substring(0, 2);
		}

		var deviceType = 1;
		if (device.platform == 'android' || device.platform == 'Android') {
			deviceType = 3;
		}

		var params = {
			request : {
				application : PushWoosh.appCode,
				push_token : token,
				language : lang,
				hwid : PushWoosh.getHWId(),
				timezone : offset,
				device_type : deviceType
			}
		};

		payload = (params) ? JSON.stringify(params) : '';
		PushWoosh.helper(url, method, payload, lambda, lambdaerror);
	},

	unregister : function(lambda, lambdaerror) {
		glog2.log("unregister lambda", lambda);
		glog2.log("unregister lambdaerror", lambdaerror);
		var method = 'POST';
		var url = PushWoosh.baseurl + 'unregisterDevice';

		var params = {
			request : {
				application : PushWoosh.appCode,
				hwid : PushWoosh.getHWId()
			}
		};

		payload = (params) ? JSON.stringify(params) : '';
		PushWoosh.helper(url, method, payload, lambda, lambdaerror);
	},

	sendBadge : function(badgeNumber, lambda, lambdaerror) {
		glog2.log("sendBadge badgeNumber", badgeNumber);
		glog2.log("sendBadge lambda", lambda);
		glog2.log("sendBadge lambdaerror", lambdaerror);

		var method = 'POST';
		var url = PushWoosh.baseurl + 'setBadge';

		var params = {
			request : {
				application : PushWoosh.appCode,
				hwid : PushWoosh.getHWId(),
				badge : badgeNumber
			}
		};

		payload = (params) ? JSON.stringify(params) : '';
		PushWoosh.helper(url, method, payload, lambda, lambdaerror);
	},

	sendAppOpen : function(lambda, lambdaerror) {
		glog2.log("sendAppOpen lambda", lambda);
		glog2.log("sendAppOpen lambdaerror", lambdaerror);
		var method = 'POST';
		var url = PushWoosh.baseurl + 'applicationOpen';

		var params = {
			request : {
				application : PushWoosh.appCode,
				hwid : PushWoosh.getHWId()
			}
		};

		payload = (params) ? JSON.stringify(params) : '';
		PushWoosh.helper(url, method, payload, lambda, lambdaerror);
	},

	sendPushStat : function(hashValue, lambda, lambdaerror) {
		glog2.log("sendPushStat hashValue", hashValue);
		glog2.log("sendPushStat lambda", lambda);
		glog2.log("sendPushStat lambdaerror", lambdaerror);
		var method = 'POST';
		var url = PushWoosh.baseurl + 'pushStat';

		var params = {
			request : {
				application : PushWoosh.appCode,
				hwid : PushWoosh.getHWId(),
				hash : hashValue
			}
		};

		payload = (params) ? JSON.stringify(params) : '';
		PushWoosh.helper(url, method, payload, lambda, lambdaerror);
	},

	setTags : function(tagsJsonObject, lambda, lambdaerror) {
		glog2.log("setTags tagsJsonObject", tagsJsonObject);
		glog2.log("setTags lambda", lambda);
		glog2.log("setTags lambdaerror", lambdaerror);
		var method = 'POST';
		var url = PushWoosh.baseurl + 'setTags';

		var params = {
			request : {
				application : PushWoosh.appCode,
				hwid : PushWoosh.getHWId(),
				tags : tagsJsonObject
			}
		};

		payload = (params) ? JSON.stringify(params) : '';
		PushWoosh.helper(url, method, payload, lambda, lambdaerror);
	},

	helper : function(url, method, params, lambda, lambdaerror) {
		glog2.log("helper url", url);
		glog2.log("helper method", method);
		glog2.log("helper params", params);
		glog2.log("helper lambda", lambda);
		glog2.log("helper lambdaerror", lambdaerror);
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {//Request complete !!
				if (xhr.status == 200) {
					if (lambda)
						lambda(xhr.responseText);
				} else {
					if (lambdaerror)
						lambdaerror(xhr.responseText);
				}
			}
		};

		// open the client
		xhr.open(method, url, true);
		xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
		// send the data
		xhr.send(params);
	}
};

PushWoosh.baseurl = 'https://cp.pushwoosh.com/json/1.3/'; 