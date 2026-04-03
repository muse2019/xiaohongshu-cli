/**
 * Stealth Script - 注入反检测代码
 *
 * 在页面加载前（document_start）注入，隐藏自动化痕迹
 */

(function() {
  'use strict';

  // ========== 隐蔽的重复注入检测 ==========
  // 使用不可枚举的 Symbol 作为标记，比普通属性更难检测
  const stealthKey = Symbol.for('_s' + Math.random().toString(36).slice(2, 8));

  // 检查是否已注入（通过闭包变量，不暴露到 window）
  const hasInjected = (() => {
    try {
      // 尝试从 document 读取隐藏标记
      const marker = document.currentScript?.getAttribute('data-' + stealthKey.toString().slice(1, 8));
      if (marker) return true;

      // 备用检测：检查特定原型修改
      const testProp = '_st' + Date.now().toString(36);
      const descriptor = Object.getOwnPropertyDescriptor(EventTarget.prototype, testProp);
      if (descriptor) return true;

      return false;
    } catch {
      return false;
    }
  })();

  if (hasInjected) return;

  // 设置隐藏标记（使用多个隐蔽位置）
  try {
    // 方法1：在原型上设置不可枚举标记
    const markerProp = '_st' + Math.random().toString(36).slice(2, 6);
    Object.defineProperty(EventTarget.prototype, markerProp, {
      value: true,
      enumerable: false,
      configurable: true,
      writable: false
    });
  } catch {}

  // ========== 1. navigator.webdriver 伪装 ==========
  try {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
      configurable: true,
    });
  } catch {}

  // ========== 2. window.chrome 假对象 ==========
  try {
    if (!window.chrome) {
      window.chrome = {
        runtime: {
          onConnect: { addListener: () => {}, removeListener: () => {} },
          onMessage: { addListener: () => {}, removeListener: () => {} },
        },
        loadTimes: () => ({}),
        csi: () => ({}),
      };
    }
  } catch {}

  // ========== 3. navigator.plugins 伪装 ==========
  try {
    if (!navigator.plugins || navigator.plugins.length === 0) {
      const fakePlugins = [
        { name: 'PDF Viewer', filename: 'internal-pdf-viewer', description: 'Portable Document Format' },
        { name: 'Chrome PDF Viewer', filename: 'internal-pdf-viewer', description: '' },
        { name: 'Chromium PDF Viewer', filename: 'internal-pdf-viewer', description: '' },
        { name: 'Microsoft Edge PDF Viewer', filename: 'internal-pdf-viewer', description: '' },
        { name: 'WebKit built-in PDF', filename: 'internal-pdf-viewer', description: '' },
      ];
      fakePlugins.item = (i) => fakePlugins[i] || null;
      fakePlugins.namedItem = (n) => fakePlugins.find(p => p.name === n) || null;
      fakePlugins.refresh = () => {};
      Object.defineProperty(navigator, 'plugins', {
        get: () => fakePlugins,
        configurable: true,
      });
    }
  } catch {}

  // ========== 4. navigator.languages 伪装 ==========
  try {
    if (!navigator.languages || navigator.languages.length === 0) {
      Object.defineProperty(navigator, 'languages', {
        get: () => ['zh-CN', 'zh', 'en-US', 'en'],
        configurable: true,
      });
    }
  } catch {}

  // ========== 5. Permissions API 修复 ==========
  try {
    const origQuery = window.Permissions?.prototype?.query;
    if (origQuery) {
      window.Permissions.prototype.query = function (parameters) {
        if (parameters?.name === 'notifications') {
          return Promise.resolve({ state: Notification.permission, onchange: null });
        }
        return origQuery.call(this, parameters);
      };
    }
  } catch {}

  // ========== 6. 清除自动化痕迹 ==========
  try {
    delete window.__playwright;
    delete window.__puppeteer;
    for (const prop of Object.getOwnPropertyNames(window)) {
      if (prop.startsWith('cdc_') || prop.startsWith('__cdc_')) {
        try { delete window[prop]; } catch {}
      }
    }
  } catch {}

  // ========== 7. CDP 堆栈清理 ==========
  try {
    const origDescriptor = Object.getOwnPropertyDescriptor(Error.prototype, 'stack');
    const cdpPatterns = [
      'puppeteer_evaluation_script',
      'pptr:',
      'debugger://',
      '__playwright',
      '__puppeteer',
    ];
    if (origDescriptor && origDescriptor.get) {
      Object.defineProperty(Error.prototype, 'stack', {
        get: function () {
          const raw = origDescriptor.get.call(this);
          if (typeof raw !== 'string') return raw;
          return raw.split('\n').filter(line =>
            !cdpPatterns.some(p => line.includes(p))
          ).join('\n');
        },
        configurable: true,
      });
    }
  } catch {}

  // ========== 8. toString 伪装基础设施 ==========
  const origToString = Function.prototype.toString;
  const disguised = new WeakMap();
  try {
    Object.defineProperty(Function.prototype, 'toString', {
      value: function() {
        const override = disguised.get(this);
        return override !== undefined ? override : origToString.call(this);
      },
      writable: true,
      configurable: true,
    });
  } catch {}

  const disguise = (fn, name) => {
    disguised.set(fn, 'function ' + name + '() { [native code] }');
    try {
      Object.defineProperty(fn, 'name', { value: name, configurable: true });
    } catch {}
    return fn;
  };

  // ========== 9. debugger 语句过滤 ==========
  try {
    const OrigFunction = Function;
    const debuggerRe = /(?:^|(?<=[;{}\n\r]))\s*debugger\s*;?/g;
    const cleanDebugger = (src) => typeof src === 'string' ? src.replace(debuggerRe, '') : src;

    const PatchedFunction = function(...args) {
      if (args.length > 0) {
        args[args.length - 1] = cleanDebugger(args[args.length - 1]);
      }
      if (new.target) {
        return Reflect.construct(OrigFunction, args, new.target);
      }
      return OrigFunction.apply(this, args);
    };
    PatchedFunction.prototype = OrigFunction.prototype;
    Object.setPrototypeOf(PatchedFunction, OrigFunction);
    disguise(PatchedFunction, 'Function');
    try { window.Function = PatchedFunction; } catch {}

    const origEval = window.eval;
    const patchedEval = function(code) {
      return origEval.call(this, cleanDebugger(code));
    };
    disguise(patchedEval, 'eval');
    try { window.eval = patchedEval; } catch {}
  } catch {}

  // ========== 10. console 方法伪装 ==========
  try {
    const consoleMethods = ['log', 'warn', 'error', 'info', 'debug', 'table', 'trace', 'dir', 'group', 'groupEnd', 'groupCollapsed', 'clear', 'count', 'assert', 'profile', 'profileEnd', 'time', 'timeEnd', 'timeStamp'];
    for (const m of consoleMethods) {
      if (typeof console[m] !== 'function') continue;
      const origMethod = console[m];
      const nativeStr = 'function ' + m + '() { [native code] }';
      try {
        const currentStr = origToString.call(origMethod);
        if (currentStr === nativeStr) continue;
      } catch {}
      const wrapper = function() { return origMethod.apply(console, arguments); };
      Object.defineProperty(wrapper, 'length', { value: origMethod.length || 0, configurable: true });
      disguise(wrapper, m);
      try { console[m] = wrapper; } catch {}
    }
  } catch {}

  // ========== 11. window 尺寸修复 ==========
  try {
    const normalWidthDelta = window.outerWidth - window.innerWidth;
    const normalHeightDelta = window.outerHeight - window.innerHeight;
    if (normalWidthDelta > 100 || normalHeightDelta > 200) {
      Object.defineProperty(window, 'outerWidth', {
        get: () => window.innerWidth,
        configurable: true,
      });
      const heightOffset = Math.max(40, Math.min(120, normalHeightDelta));
      Object.defineProperty(window, 'outerHeight', {
        get: () => window.innerHeight + heightOffset,
        configurable: true,
      });
    }
  } catch {}

  // ========== 12. Performance API 清理 ==========
  try {
    const origGetEntries = Performance.prototype.getEntries;
    const origGetByType = Performance.prototype.getEntriesByType;
    const origGetByName = Performance.prototype.getEntriesByName;
    const suspiciousPatterns = ['debugger', 'devtools', '__puppeteer', '__playwright', 'pptr:'];
    const filterEntries = (entries) => {
      if (!Array.isArray(entries)) return entries;
      return entries.filter(e => {
        const name = e.name || '';
        return !suspiciousPatterns.some(p => name.includes(p));
      });
    };
    Performance.prototype.getEntries = function() {
      return filterEntries(origGetEntries.call(this));
    };
    Performance.prototype.getEntriesByType = function(type) {
      return filterEntries(origGetByType.call(this, type));
    };
    Performance.prototype.getEntriesByName = function(name, type) {
      return filterEntries(origGetByName.call(this, name, type));
    };
  } catch {}

  // ========== 13. iframe chrome 一致性 ==========
  try {
    const origHTMLIFrame = HTMLIFrameElement.prototype;
    const origContentWindow = Object.getOwnPropertyDescriptor(origHTMLIFrame, 'contentWindow');
    if (origContentWindow && origContentWindow.get) {
      Object.defineProperty(origHTMLIFrame, 'contentWindow', {
        get: function() {
          const w = origContentWindow.get.call(this);
          if (w) {
            try {
              if (!w.chrome) {
                Object.defineProperty(w, 'chrome', {
                  value: window.chrome,
                  writable: true,
                  configurable: true,
                });
              }
            } catch {}
          }
          return w;
        },
        configurable: true,
      });
    }
  } catch {}

  // ========== 14. WebGL 指纹伪装 ==========
  try {
    const getParameterProxyHandler = {
      apply: function(target, thisArg, args) {
        const param = args[0];
        if (param === 37445) return 'Intel Inc.';  // UNMASKED_VENDOR_WEBGL
        if (param === 37446) return 'Intel Iris OpenGL Engine';  // UNMASKED_RENDERER_WEBGL
        return Reflect.apply(target, thisArg, args);
      }
    };

    WebGLRenderingContext.prototype.getParameter = new Proxy(
      WebGLRenderingContext.prototype.getParameter,
      getParameterProxyHandler
    );

    if (typeof WebGL2RenderingContext !== 'undefined') {
      WebGL2RenderingContext.prototype.getParameter = new Proxy(
        WebGL2RenderingContext.prototype.getParameter,
        getParameterProxyHandler
      );
    }
  } catch {}

  // ========== 15. Canvas 指纹噪声 ==========
  try {
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    const noise = () => Math.random() * 0.0001;

    HTMLCanvasElement.prototype.getContext = function(type, attributes) {
      const context = origGetContext.call(this, type, attributes);
      if (!context) return context;

      if (type === '2d') {
        const origGetImageData = context.getImageData;
        context.getImageData = function(x, y, w, h) {
          const data = origGetImageData.call(this, x, y, w, h);
          // 添加微弱噪声
          for (let i = 0; i < data.data.length; i += 4) {
            data.data[i] = Math.max(0, Math.min(255, data.data[i] + (noise() > 0.5 ? 1 : -1)));
          }
          return data;
        };
        disguise(context.getImageData, 'getImageData');
      }

      return context;
    };
    disguise(HTMLCanvasElement.prototype.getContext, 'getContext');
  } catch {}

  // ========== 16. Audio 指纹噪声 ==========
  try {
    const origCreateAnalyser = AudioContext.prototype.createAnalyser;
    AudioContext.prototype.createAnalyser = function() {
      const analyser = origCreateAnalyser.call(this);
      const origGetFloatFrequencyData = analyser.getFloatFrequencyData;
      analyser.getFloatFrequencyData = function(array) {
        origGetFloatFrequencyData.call(this, array);
        for (let i = 0; i < array.length; i++) {
          array[i] += (Math.random() - 0.5) * 0.0001;
        }
      };
      disguise(analyser.getFloatFrequencyData, 'getFloatFrequencyData');
      return analyser;
    };
    disguise(AudioContext.prototype.createAnalyser, 'createAnalyser');
  } catch {}

  // ========== 17. DevTools 检测防护 ==========

  // 防止通过 debugger 语句检测
  // 网站用 performance.now() 测量 debugger 执行时间
  try {
    const origNow = performance.now.bind(performance);
    let lastNow = origNow();
    let callCount = 0;

    // 重写 performance.now，返回的时间不能突变
    performance.now = function() {
      const realNow = origNow();
      callCount++;

      // 防止时间倒流
      if (realNow < lastNow) {
        return lastNow;
      }

      // 如果两次调用之间时间跳跃太大（可能是 debugger 暂停），平滑处理
      const delta = realNow - lastNow;
      if (delta > 100 && callCount < 1000) {
        // 返回一个合理的增量
        lastNow = lastNow + Math.min(delta, 50);
        return lastNow;
      }

      lastNow = realNow;
      return realNow;
    };
    disguise(performance.now, 'now');
  } catch {}

  // 防止通过 console.log 的 getter 检测 DevTools
  try {
    const devtoolsDetector = /./;
    let detectorOpened = false;

    Object.defineProperty(devtoolsDetector, 'toString', {
      get: function() {
        // 不设置 opened 标记
        return function() { return ''; };
      }
    });

    // 阻止常见的 DevTools 检测模式
    const origLog = console.log;
    console.log = function(...args) {
      // 检查是否有检测器
      for (const arg of args) {
        if (arg && typeof arg === 'object' && 'opened' in arg) {
          // 伪造 opened 为 false
          Object.defineProperty(arg, 'opened', {
            value: false,
            configurable: true
          });
        }
      }
      return origLog.apply(console, args);
    };
    disguise(console.log, 'log');
  } catch {}

  // 防止通过 window 尺寸检测 DevTools
  // DevTools 打开时 window.outerWidth 会变化
  try {
    const cachedOuterWidth = window.outerWidth || window.innerWidth;
    const cachedOuterHeight = window.outerHeight || window.innerHeight + 100;

    Object.defineProperty(window, 'outerWidth', {
      get: function() {
        // 如果 DevTools 实际关闭，返回真实值
        const realOuter = window.outerWidth;
        // 返回与 innerWidth 的合理差值
        return Math.max(realOuter, window.innerWidth);
      },
      configurable: true
    });

    Object.defineProperty(window, 'outerHeight', {
      get: function() {
        const realOuter = window.outerHeight;
        // DevTools 打开时 outerHeight 会变小
        // 我们返回一个合理的值
        const minExpected = window.innerHeight + 50;
        return Math.max(realOuter, minExpected);
      },
      configurable: true
    });
  } catch {}

  // 防止通过 Function 构造函数检测
  try {
    const origFunction = Function;
    const fnToString = origFunction.prototype.toString;

    // 检测 body 是否包含可疑代码
    origFunction.prototype.toString = function() {
      const str = fnToString.call(this);
      // 如果函数体内包含检测代码，返回正常的函数体
      if (str.includes('debugger') && str.includes('constructor')) {
        return 'function() { [native code] }';
      }
      return str;
    };
  } catch {}

  // ========== 18. 防止时间戳指纹 ==========
  try {
    // Date.now() 和 performance.now() 返回值添加微弱随机性
    const origDateNow = Date.now.bind(Date);
    let timeOffset = Math.random() * 0.5 - 0.25;  // -0.25 到 0.25 ms

    Date.now = function() {
      return Math.floor(origDateNow() + timeOffset);
    };
    disguise(Date.now, 'now');
  } catch {}

  console.log('[XHS Stealth] Anti-detection applied');
})();
