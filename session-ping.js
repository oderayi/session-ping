/**
Session-Ping.js 0.0.1

@author: Steven Oderayi <oderayi at gmail dot com>

Copyright (C) 2018

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

@dependencies jquery
NOTE: All times are in seconds.
*/

var SessionPing = (function() {
  /* default options */
  var _options = {
    interval: 60,
    url: "/",
    triggers: ["mousemove", "touchstart", "scroll", "keydown"],
    onSessionExpired: null,
    onSessionOk: null,
    onPingError: null,
    onPingOk: null
  };

  var _xhr = null;
  var _lastPingTime = 0;

  function _setOptions(options) {
    if (_empty(options)) {
      return;
    }

    if (!_undefined(options.interval)) {
      _options.interval = options.interval;
    }

    if (!_undefined(options.url)) {
      _options.url = options.url;
    }

    if (_isFunction(options.onSessionExpired)) {
      _options.onSessionExpired = options.onSessionExpired;
    }

    if (_isFunction(options.onSessionOk)) {
      _options.onSessionOk = options.onSessionOk;
    }

    if (_isFunction(options.onPingError)) {
      _options.onPingError = options.onPingError;
    }

    if (_isFunction(options.onPingOk)) {
      _options.onPingOk = options.onPingOk;
    }
  }

  function _getOptions() {
    return _options;
  }

  function _ping() {
    _lastPingTime = _now();
    /* clear / stop previous request if exists */
    if (_xhr) {
      _xhr.abort();
    }
    _xhr = $.ajax({
      type: "GET",
      url: _options.url,
      async: true,
      dataType: "json",
      success: function(response) {
        _handlePingOk(response);
      },
      error: function(jqXHR, textStatus, errorThrown) {
        _handlePingError(jqXHR, textStatus, errorThrown);
      }
    });
  }

  function _handlePingOk(response) {
    if (_isFunction(_options.onPingOk)) {
      _options.onPingOk(response);
		}
		if (response.status == true) {
			if (_isFunction(_options.onSessionOk)) {
				_options.onSessionOk();
			}
		} else {
			if (_isFunction(_options.onSessionExpired)) {
        _options.onSessionExpired();
      }
		}
  }

  function _handlePingError(jqXHR, textStatus, errorThrown) {
    if (_isFunction(_options.onPingError)) {
      _options.onPingError(jqXHR, textStatus, errorThrown);
    }
  }

  function _handleSessionOk(response) {
    if (_isFunction(_options.onSessionOk)) {
      _options.onSessionOk(response);
    }
  }

  function _handleSessionExpired() {
    if (_isFunction(_options.onSessionExpired)) {
      _options.onSessionExpired();
    }
  }
	
  function _now() {
	return new Date().getTime() / 1000;
  }

  function _empty(obj) {
    return $.isEmptyObject(obj);
  }

  function _undefined(obj) {
    return typeof obj === "undefined";
  }

  function _isFunction(func) {
    return !_undefined(func) && typeof func === "function";
  }

  function _init(options) {
    if (options) {
      _setOptions(options);
    }
    _setupTriggers(_options.triggers);
  }

  function _setupTriggers(triggers) {
    triggers.forEach(trigger => {
      window.addEventListener(trigger, _triggerEventHandler, false);
    });
	}
	
	function _triggerEventHandler(e) {
		if (_lastPingTime == 0) {
			_ping();
			return;
		}

		if (_now() - _lastPingTime >= _options.interval) {
			_ping();
			return;
		}

	}

  return {
    init: function(options) {
      _init(options);
    },

    setOptions: function(options) {
      _setOptions(options);
    },

    getOptions: function() {
      return _getOptions();
    }
  };
})();
