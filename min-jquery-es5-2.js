(function(window){

	/* ========================== 构造原型函数 ========================= */ 
	const Fly = function(selector) {
		return new Fly.prototype.init(selector);
	} 
	Fly.fn = Fly.prototype = {
		init: function(selector){
			if(!selector){
				return this;
			}
			// 当前的节点数组
			this.elements = [];
			this.selector = selector;
			// 入口分支
			// 1. 传入的是 html
			if (/^\<([\s\S]{7,})\>$/.test(this.selector)){
				this.elements.push(fns.createElement(this.selector));
				this.selector = 'createElement';
			}
			// 2. 传入的是选择器 
			else if (typeof this.selector === 'string'){
				// 把字符串类型交给 querySelectorAll判断
				document.querySelectorAll(this.selector).forEach(item=>{
					this.elements.push(item);
				})
			}
			// 3. 传入的是节点对象
			else if (this.selector.nodeType === 1){
				this.elements.push(this.selector);
				this.selector = 'node';
			}
			// 4. 传入的是匿名函数
			else if(typeof this.selector === 'function'){
				// 只接受匿名函数
				if (this.selector.name) {
					throw new Error('post method must be no name');
				} else {
					this.ready(this.selector);
					this.selector = 'ready';
				}
			}
			// 5. 传入其他的直接不解析
			else{
				throw new Error('不知道你传的是什么鬼，解析不了,请检查');
			}
			// 保存选取节点的长度
			this.length = this.elements.length;

			return this;
		}
	}
	/* ========================== 扩展原型方法 ========================= */ 
	// 多次初始化
	Fly.fn.ready = function(fn){
		document.addEventListener('DOMContentLoaded', () => {
			//注销事件, 避免反复触发
			document.removeEventListener('DOMContentLoaded', fn.call);
			//执行函数
			fn();
		});
	}
	// 遍历节点数组
	Fly.fn.each = function(array, callback){
		if (arguments.length === 1) {
			this.elements.forEach((item, index) => {
				array(item, index);
			});
		} else {
			let arr = array.selector ? array.elements : array;
			arr.forEach((item, index) => {
				callback(item, index);
			});
		}
		return this;
	}
	// 通用绑定事件
	Fly.fn.on = function(event, target, callback){
		if (arguments.length < 2) {
			throw new Error('params error')
		}
		this.each(item => {
			item.addEventListener(event, (Fly) => {
				if (arguments.length === 3) {
					let element = Fly.target
					if (element.matches(target)) {
						callback.call(element, Fly)
					}
				} else if (arguments.length === 2) {
					target(Fly)
				}
			})
		});
		return this;
	}
	// 移除事件
	Fly.fn.off = function(event, callbackName){
		this.each(item => {
			item.removeEventListener(event, callbackName);
		});
		return this;
	}
	// 选中的某一个元素
	Fly.fn.eq = function(index){
		index = index ? index : 0;
		if(index > this.elements.length-1){
			throw new Error(`The 'index = ${index}' exceeds the element array length`)
		}	
		let element = [];
		element.push(this.elements[index]);
		this.elements = element;
		this.length = 1;
		return this;
	}
	// 选中的第一个元素
	Fly.fn.first = function(){
		return this.eq(0);
	}
	// 选中最后一个元素
	Fly.fn.last = function(){
		return this.eq(this.elements.length - 1);
	}
	// 获取 或者 设置html属性 获取的时候默认得到当前选择元素的第一个
	Fly.fn.attr = function(name, val){
		if (arguments.length === 0) {
			throw new Error('attr(attrName,val) maybe you lost param');
		} else if (arguments.length === 1) {
			return this.elements[0].getAttribute(name);
		} else {
			this.each(item => {
				item.setAttribute(name, val);
			});
		}
		return this;
	}
	// 移除属性
	Fly.fn.removeAttr = function(name){
		this.each(item => {
			item.removeAttribute(name);
		});
		return this;
	}
	// 添加和获取 html 方法
	Fly.fn.html = function(html){
		if (html) {
			this.each(item => item.innerHTML = html);
			return this;
		} else {
			return this.elements[0].innerHTML;
		}
	},
	// 查找下一个兄弟节点
	Fly.fn.next = function(){
		let elements = [];
		this.each(item => {
			let isNext = item.nextSibling;
			if (isNext && isNext.nodeType === 1) {
				elements.push(isNext);
			} else {
				if (isNext.nextSibling) {
					elements.push(isNext.nextSibling);
				}
			}
		});
		this.elements = element;
		this.length = this.elements.length;
		return this;
	}
	// 找到某一个子节点
	Fly.fn.find = function(selector){
		let findNodes = [];
		let elements = [];
		this.each(item => {
			findNodes.push(item.querySelectorAll(selector));
		});
		this.each(findNodes, item => {
			this.each(item, every => {
				elements.push(every);
			})
		});
		this.elements = elements;
		this.length = elements.length;
		this.selector = this.selector + ' ' + selector;
		return this;
	}
	// 上一个兄弟节点
	Fly.fn.prev = function(){
		let prev = [];
		this.each(item => {
			let isPrev = item.previousSibling;
			if (isPrev && isPrev.nodeType === 1) {
				prev.push(isPrev);
			} else {
				if (isPrev.previousSibling) {
					prev.push(isPrev.previousSibling);
				}
			}
		});
		this.elements = prev;
		this.length = prev.length;
		return this;
	}
	// 上层父节点
	Fly.fn.parent = function(){
		let parent = [];
		this.each((item, index) => {
			if (index === 0) {
				parent.push(item.parentNode);
			} else {
				if (parent[parent.length - 1] !== item.parentNode) {
					parent.push(item.parentNode);
				}
			}
		});
		this.elements = parent;
		this.length = parent.length;
		this.selector = this.selector + ' < parentNode';
		return this;
	}
	// 在选中元素的末尾插入节点
	Fly.fn.appendAfter = function(val){
		this.each(item => {
			if (val.nodeType === 1) {
				item.appendChild(val);
			} else if(/^\<([\s\S]{7,})\>$/.test(val)) {
				item.appendChild(this.createElement(val));
			} else {
				throw new Error('插入的内容必须是节点，或者是 html 片段')
			}
		});
		return this;
	}
	// 在选中元素的头部插入节点
	Fly.fn.appendBefore = function(val){
		return this.appendWhere(val, 0);
	}
	// 在选中元素的何处插入节点
	Fly.fn.appendWhere = function(val,num){
		this.each(item => {
			if (val.nodeType === 1) {
				item.insertBefore(val, item.children[num]);
			} else if(/^\<([\s\S]{7,})\>$/.test(val)) {
				item.insertBefore(this.createElement(val), item.children[num]);
			}else{
				throw new Error('插入的内容必须是节点，或者是 html 片段')
			}
		});
		return this;
	}
	// 移除某个节点
	Fly.fn.removeNode = function(){
		this.each(item => {
			item.parentNode.removeChild(item);
		});
		return this;
	}
	// 克隆某个节点
	Fly.fn.cloneNode = function(){

	}
	// 添加和获取css方法 
	Fly.fn.css = function(val){
		if (!val) {
			throw new Error('css method must have a param');
		}
		if (typeof val === 'object') {
			this.each(item => {
				for (let key in val) {
					item.style[key] = val[key];
				}
			});
			return this;
		} else {
			// 这里返回的颜色代码是 rgb
			return getComputedStyle(this.elements[0])[val];
		}
	}
	// 添加类名方法
	Fly.fn.addClass = function(className){
		this.each(item => {
			if (item.className.indexOf(className) === -1) {
				if (item.className) {
					item.className = item.className + ' ' + className;
				} else {
					item.className = className;
				}
			}
		});
		return this;
	}
	// 判断是否有某一个class
	Fly.fn.hasClass = function(className){
		if (this.elements[0].className.indexOf(className) !== -1) {
			return true;
		} else {
			return false;
		}
	}
	// 移除class
	Fly.fn.removeClass = function(className){
		this.each(item => {
			if (item.className.indexOf(className) !== -1) {
				let str, arr;
				arr = item.className.split(' ');
				arr.splice(arr.indexOf(className), 1);
				str = arr.join(' ');
				if (str) {
					item.className = str;
				} else {
					item.removeAttribute('class');
				}
			} else {
				return false;
			}
		});
		return this;
	}
	// 切换 class
	Fly.fn.toggleClass = function(className){
		if (this.hasClass(className)) {
			this.removeClass(className);
		} else {
			this.addClass(className);
		}
	}
	/* ========================== 扩展对象方法 ========================= */ 
	// 拓展对象方法方便使用 $.each() 种类的 API
	// 遍历节点数组
	Fly.createElement = Fly.fn.createElement = function(htmlStr){
		if (typeof htmlStr !== 'string' && /^\<([\s\S]{7,})\>$/.test(htmlStr)) {
			throw new Error('param or maybe not html string');
		} else {
			// 取出 开头<> 中的内容；
			let sContStr = htmlStr.match(/\<([\s\S]*?)\>/)[1];
			// 去掉标签名和后面的空格 剩下属性
			let sAttrStr = sContStr.replace(/[a-z]+\s?/, '');
			// 取出标签名称
			let sTagName = sContStr.match(/[a-z]+/)[0];
			// 取出属性值保存为数组
			let aValues = sAttrStr.match(/\"([\s\S]*?)\"/g);
			// 去掉属性值 取出属性名称
			let aNature = sAttrStr.replace(/\=\"([\s\S]*?)\"/g, '').match(/([a-z]+(\-?))+/g);
			// 取出innerHTML的内容
			let sInText = htmlStr.match(/\>([\s\S]*)\</)[1];
			// 创建dom元素
			let dom = document.createElement(sTagName);
			// 设置属性值和属性名
			if (aNature && aNature.length > 0) {
				let reg = /[\"|\']?/g;
				aNature.forEach((item,index)=>{
					dom.setAttribute(item,aValues[index].replace(reg,''));
				})
			}
			// 设置innerHTML的内容
			dom.innerHTML = sInText;
			// 返回dom对象
			return dom;
		}
	}
	// 共用遍历方法
	Fly.each = Fly.fn.each;
	// 实验性 fetch请求
	Fly.fetch = function(options){
		// return fetch(url, {
		//   method: "POST", // *GET, POST, PUT, DELETE, etc.
		//   mode: "cors", // no-cors, cors, *same-origin
		//   cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
		//   credentials: "same-origin", // include, same-origin, *omit
		//   headers: {
		//       "Content-Type": "application/json; charset=utf-8",
		//       // "Content-Type": "application/x-www-form-urlencoded",
		//   },
		//   redirect: "follow", // manual, *follow, error
		//   referrer: "no-referrer", // no-referrer, *client
		//   body: JSON.stringify(data), // body data type must match "Content-Type" header
		// })
		// .then(response => response.json()) // parses response to JSON
		// .catch(error => console.error(`Fetch Error =\n`, error));
		if (window.fetch) {
			options = options || {};
			options.url = options.url || '';
			options.type = options.type || 'get';
			// 执行fetch
			return fetch(options.url, {
				method: options.type,
			}).then(response => response.json())
			  .catch(error => console.error(`Fetch Error =\n`, error))
		} else {
			this.axios(options)
		}
	}
	// 简易的axios
	Fly.axios = function(options){
		// 这里有6个参数 url type data dataType
		// dataType 是指的是将返回的数据尝试进行json格式解析
		// 处理传过来的数据
		return new Promise((resolve, reject) => {
			options = options || {};
			options.url = options.url || '';
			options.type = options.type || 'GET';
			options.data = options.data || {};
			options.dataType = options.dataType || 'text';
			//不兼容IE6
			let xhr = new XMLHttpRequest();
			//数据组装
			let arr = [];
			for (let name in options.data) {
				arr.push(`${encodeURIComponent(name)}=${encodeURIComponent(options.data[name])}`);
			}
			let strData = arr.join('&');
			// 判断类型 就支持post get好了
			if (options.type.toLowerCase() === 'post') {
				xhr.open('POST', options.url, true);
				xhr.setRequestHeader('content-type', 'application/x-www-form-urlencoded');
				xhr.send(strData);
			} else {
				let url = strData ? `${options.url}?${strData}` : options.url;
				xhr.open('GET', url, true);
				xhr.send();
			}
			//接收
			xhr.onreadystatechange = () => {
				//4——完事
				if (xhr.readyState === 4) {
					//成功——2xx、304
					if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
						let data = xhr.responseText;
						switch (options.dataType) {
							// 解析json
							case 'json':
								if (window.JSON && JSON.parse) {
									data = JSON.parse(data);
								} else {
									data = eval('(' + data + ')');
								}
								break;
								// 解析xml
							case 'xml':
								data = xhr.responseXML;
								break;
							default:
								if (window.JSON && JSON.parse) {
									data = JSON.parse(data);
								} else {
									data = eval('(' + data + ')');
								}
								break;
						}
						resolve(data)
					} else {
						reject(xhr.status)
					}
				}
			}
		});
	}
	// 简易的跨域请求
	Fly.jsonp = function(options){
		// 测试用的 百度api
		// options = {
		// 	url:'https://sp0.baidu.com/5a1Fazu8AA54nxGko9WTAnF6hhy/su',
		// 	cbName:'cb',
		// 	data:{
		// 		wd:'黄',
		// 		json: 1,
		// 		p: 3,
		// 	}
		// }
		// 参数判断
		return new Promise((resolve, reject) => {
			options = options || {};
			options.cbFunc = options.cbFunc || 'jsonpCallback';
			options.cbName = options.cbName || 'callback';
			options.url = options.url || '';
			options.data = options.data || {};
			// 组装数据
			let arr = [];
			for (let name in options.data) {
				arr.push(`${encodeURIComponent(name)}=${encodeURIComponent(options.data[name])}`);
			}
			let strData = arr.join('&');
			// 生成一个随机数
			let random = (Math.random() * 10000000 + '').slice(0, 7);
			let callbackName = options.cbFunc + random
			// 拼合url
			let url = strData ? `${options.url}?${strData}&${options.cbName}=${callbackName}` : options.url;
			// 移除上一次的回调
			let oldScript = document.querySelector('.script-jsonp');
			if (oldScript) {
				document.head.removeChild(oldScript);
			}
			// 创建新的回调
			let newScript = document.createElement('script');
			newScript.className = 'script-jsonp';
			newScript.src = url;
			document.head.appendChild(newScript);
			window[callbackName] = (data) => {
				if (data) {
					resolve(data)
				} else {
					reject(null)
				}
			}
		})
	}
	// cookie处理
	Fly.cookie = function(options){
		options = options || {}
		options.method = options.method || 'get';
		options.key = options.key || '';
		options.value = options.value || '';
		options.time = options.time || 7;
		if (options.method == 'get') {
			if (!options.key) {
				throw new Error('method get need the key')
			}
			let value = ''
			let arr = document.cookie.split('; ');
			this.each(arr, item => {
				let arrName = item.split('=');
				if (arrName[0] == options.key) {
					value =  arrName[1];
				}
			})
			return value;
		} else if (options.method == 'set') {
			if(!options.key || !options.value){
				throw new Error('method set need the key and value')
			}
			let oDate = new Date();
			oDate.setTime(oDate.getTime() + options.time*24*3600*1000);
			document.cookie = `${options.key}=${encodeURIComponent(options.value)}; expires=${oDate.toUTCString()}`;
		} else if (options.method == 'del') {
			if (!options.key) {
				throw new Error('method get need the key')
			}
			options.time = -1
			let oDate = new Date();
			options.value = ''
			oDate.setTime(oDate.getTime() + options.time*24*3600*1000);
			document.cookie = `${options.key}=${options.value}; expires=${oDate.toUTCString()}`;
		}
	}
	// 本地储存
	Fly.getStorage = function(key){
		return localStorage.getItem(key);
	}
	Fly.setStorage = function(key,value){
		localStorage.setItem(key,value)
	}
	Fly.removeStorage = function(key){
		localStorage.removeItem(key);
	}
	/* ========================== 暴露对外接口 ========================= */ 
	Fly.prototype.init.prototype = Fly.prototype;

	window.$ = window.Fly = Fly
	
})(window)