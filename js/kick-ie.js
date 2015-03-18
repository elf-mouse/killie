/**
 * Kick IE
 * @author Elf-mousE
 * @since 2015.03.14
 * @updated 2015.03.18
 */
(function(window, document, undefined) {
  'use strict';

  var KickIE = {
      css: '#kick-ie,body{margin:0}#kick-ie,#kick-ie-heading{right:0;left:0;text-align:center}#kick-ie{font:16px/1.5 Arial,sans-serif;position:fixed;top:0;padding:.2em 0;border:1px solid}#kick-ie a{font-weight:700;text-decoration:none;border-bottom:1px dashed}#kick-ie-close{font:700 24px/1 Arial,sans-serif;position:fixed;top:0;right:0;height:inherit;padding:.2em;cursor:pointer;border:none!important}#kick-ie-heading{font:32px/1.5 Arial,sans-serif;position:absolute;top:45%}', // from kick-ie.min.css
      idName: {
        wrap: 'kick-ie',
        close: 'kick-ie-close',
        heading: 'kick-ie-heading'
      }
    },
    killIE = 9, // default for lteIE9
    isIE = false,
    IE = {
      label: '365 安全卫士提醒',
      ver: -1,
      lte9: false,
      lte8: false,
      lte7: false,
      IE9: {
        color: '#000',
        borderColor: '#CCC',
        background: '#CCC',
        message: '您的浏览器太古董了，还不速速 <a href="{{chromeURL}}" target="_blank">升(geng)级(xin)</a>！',
        upgrade: null
      },
      IE8: {
        color: '#FFF',
        borderColor: '#EDC048',
        background: '#E29808',
        message: '您的浏览器不是最新的。您正在使用 Internet Explorer 的一个老版本。为了获得最佳的浏览体验，我们建议您选用 <a href="{{chromeURL}}" target="_blank">谷歌浏览器</a>。',
        upgrade: null
      },
      IE7: {
        color: '#FFF',
        borderColor: '#AC1B1B',
        background: '#AC1B1B',
        message: '似乎您正在使用 Internet Explorer 的一个不安全的版本。使用老旧浏览器会对您的计算机安全造成威胁。<br>在 Windows XP 上，您无法升级到最新版本。为了获得最佳的浏览体验，我们建议您选用 <a href="{{chromeURL}}" target="_blank">谷歌浏览器</a>。',
        upgrade: null
      },
      cookieName: 'browsehappy',
      cookieExpires: 1000 * 60 * 60 * 24 * 7 // one week
    },
    microsoft = {
      message: '是时候<a href="http://windows.microsoft.com/zh-cn/windows/upgrade-your-browser" target="_blank">升级</a>你的浏览器了'
    },
    google = {
      chromeURL: 'http://www.google.com/chrome'
    },
    htmlRoot = document.getElementsByTagName('html')[0],
    bodyRoot = document.getElementsByTagName('body')[0];

  /**
   * KickIE Util
   */
  (function(KickIE) {
    /**
     * Parsing the User-Agent String
     * https://msdn.microsoft.com/en-us/library/ms537509(v=vs.85).aspx
     */

    // Returns the version of Internet Explorer or a -1
    // (indicating the use of another browser).
    KickIE.getInternetExplorerVersion = function() {
      var rv = -1; // Return value assumes failure.
      if (navigator.appName === 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp('MSIE ([0-9]{1,}[\.0-9]{0,})');
        var mode = document.documentMode;
        if (re.exec(ua) !== null) {
          rv = parseFloat(RegExp.$1);
        }
        rv = mode < rv ? mode : rv;
        if (rv === 7 && mode > 7) { // Compatibility View
          rv = mode;
        }
      }
      return rv;
    };

    /**
     * from HTML5 workgroup
     * http://www.oschina.net/question/54100_25614
     */
    KickIE.addEvent = (function() {
      if (document.addEventListener) {
        return function(el, type, fn) {
          if (el.length) {
            for (var i = 0; i < el.length; i++) {
              addEvent(el[i], type, fn);
            }
          } else {
            el.addEventListener(type, fn, false);
          }
        };
      } else {
        return function(el, type, fn) {
          if (el.length) {
            for (var i = 0; i < el.length; i++) {
              addEvent(el[i], type, fn);
            }
          } else {
            el.attachEvent('on' + type, function() {
              return fn.call(el, window.event);
            });
          }
        };
      }
    })();

    // from cookies.js
    KickIE.cookies = {
      getItem: function(sKey) {
        if (!sKey) {
          return null;
        }
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
      },
      setItem: function(sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
          return false;
        }
        var sExpires = "";
        if (vEnd) {
          switch (vEnd.constructor) {
            case Number:
              sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
              break;
            case String:
              sExpires = "; expires=" + vEnd;
              break;
            case Date:
              sExpires = "; expires=" + vEnd.toUTCString();
              break;
          }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
      }
    };

    KickIE.hideMessage = function() {
      var btn = document.getElementById(KickIE.idName.close);

      KickIE.addEvent(btn, 'click', function() {
        var date = new Date();
        date.setTime(date.getTime() + IE.cookieExpires);
        document.getElementById(KickIE.idName.wrap).style.display = 'none';
        KickIE.cookies.setItem(IE.cookieName, ':(', date);
      });
    };

    KickIE.showMessage = function(object) {
      if (KickIE.cookies.getItem(IE.cookieName) === null) {
        var warning = document.createElement('p');
        warning.id = KickIE.idName.wrap;
        warning.innerHTML = IE.label + '：' + object.message.replace('{{chromeURL}}', google.chromeURL);
        warning.style.color = object.color;
        warning.style.borderColor = object.borderColor;
        warning.style.background = object.background;

        if (IE.ver > 7) {
          var warningClose = document.createElement('a');
          warningClose.id = KickIE.idName.close;
          warningClose.innerHTML = '×';
          warning.appendChild(warningClose);
        }
        bodyRoot.appendChild(warning);

        if (IE.ver > 7) {
          KickIE.hideMessage();
        }
      }
    };

    KickIE.addClass = function(className) {
      htmlRoot.className += ' ' + className;
    };

    /**
     * http://stackoverflow.com/questions/524696/how-to-create-a-style-tag-with-javascript
     */
    KickIE.addCss = function() {
      var head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');
      style.type = 'text/css';
      if (style.styleSheet) { // IE
        style.styleSheet.cssText = KickIE.css;
      } else { // W3C
        style.appendChild(document.createTextNode(KickIE.css));
      }
      head.appendChild(style);
    };

  })(KickIE);

  // Upgrade IE
  function guideUpgrade() {
    KickIE.showMessage(IE.IE8);
  }

  // Kill IE
  function forceUpgrade() {
    var heading = document.createElement('h1');
    heading.id = KickIE.idName.heading;
    heading.innerHTML = microsoft.message;
    bodyRoot.appendChild(heading);

    KickIE.showMessage(IE.IE7);

    var links = document.getElementsByTagName('a');
    links[0].style.color = 'red';
    links[1].style.color = 'white';
  }

  // KickIE set options
  function setOptions(opts) {
    opts = opts || {};
    if (opts.killIE !== undefined) {
      killIE = opts.killIE;
    }
    if (opts.url !== undefined) {
      google.chromeURL = opts.url;
    }
    if (opts.label !== undefined) {
      IE.label = opts.label;
    }
    for (var i = 7; i <= 9; i++) {
      if (opts['up' + i] !== undefined && typeof opts['up' + i] === 'function') {
        IE['IE' + i].upgrade = opts['up' + i];
      }
    }
  }

  KickIE.init = function(opts) {
    if (IE.ver !== -1) { // Singleton
      console.warn('KickIE was initialized!');
      return;
    }
    IE.ver = KickIE.getInternetExplorerVersion();
    if (IE.ver === -1) {
      // nonIE
    } else {
      setOptions(opts);
      isIE = true;
      htmlRoot.className = 'ie'; // outdated website never use "Modernizr", I think!
      switch (IE.ver) {
        case 9:
          KickIE.addClass('ie9');
          IE.lte9 = true;
          break;
        case 8:
          KickIE.addClass('ie8');
          IE.lte9 = true;
          IE.lte8 = true;
          break;
        case 7:
          KickIE.addClass('ie7');
          IE.lte9 = true;
          IE.lte8 = true;
          IE.lte7 = true;
          break;
      }
      if (IE.lte9) {
        KickIE.addCss(); // include css
        KickIE.addClass('lte9');
        // ES5 polyfill, if you want
        // placeholder plugin or others, if you want
        if (IE.ver === 9 && killIE === 9) {
          if (IE.IE9.upgrade) {
            IE.IE9.upgrade();
          } else {
            KickIE.showMessage(IE.IE9);
          }
        }
        if (IE.lte8) {
          KickIE.addClass('lte8');
          if (IE.lte7) {
            KickIE.addClass('lte7');
            bodyRoot.innerHTML = ''; // clear body
            (IE.IE7.upgrade ? IE.IE7.upgrade : forceUpgrade)();
          } else {
            (IE.IE8.upgrade ? IE.IE8.upgrade : guideUpgrade)();
          }
        }
      }
    }
  };

  window.KickIE = KickIE.init;
  window.isIE = isIE;
  window.IE = {
    ver: IE.ver,
    lte9: IE.lte9,
    lte8: IE.lte8,
    lte7: IE.lte7
  };

})(window, document);
