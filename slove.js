{
	class S {
		/*===================================================================
		 * 构造器
		 *===================================================================*/
		constructor(selector) {
			this.selector = selector || '';
			// 上下文是否还有用？
			// this.context = context || document;
			this.elements = [];
			// 传入的是html片段
			if (/^\<([\s\S]{7,})\>$/.test(this.selector)) {
				let dom = this.createNode(this.selector);
				this.elements.push(dom);
				this.selector = 'createDom';
				// 传入的是选择器
			} else if (typeof this.selector === 'string') {
				// if(this.selector.indexOf(' ') !== -1){
				// 	selectorArr = this.selector.split(' ')
				// }
				let dom = document.querySelectorAll(selector);
				for (let i = 0; i < dom.length; i++) {
					this.elements.push(dom[i]);
				}
				// 传入的是节点对象
			} else if (this.selector.nodeType === 1) {
				this.elements.push(this.selector);
				this.selector = 'domObject';
				// 传入的是一个匿名函数
			} else if (typeof this.selector === 'function') {
				if (this.selector.name) {
					throw new Error('post method must be no name');
				} else {
					this.ready(this.selector);
					this.selector = 'ready';
				}
			}
			this.length = this.elements.length;
		}
		// 多次加载
		ready(fn) {
			document.addEventListener('DOMContentLoaded', () => {
				//注销事件, 避免反复触发
				document.removeEventListener('DOMContentLoaded', fn.call);
				//执行函数
				fn();
			});
		}
		/*===================================================================
		 * 筛选方法
		 *===================================================================*/
		// 添加筛选方法 默认选择第一个
		eq(index = 0) {
			let arr = [];
			arr.push(this.elements[index]);
			this.elements = arr;
			this.length = 1;
			return this;
		}
		// 第一个元素
		first() {
			this.eq(0);
		}
		// 最后一个元素
		last() {
			this.eq(this.elements.length - 1);
		}
		/*===================================================================
		 * 查找dom 当前都是单个操作没有批量操作
		 *===================================================================*/
		// 当前选择元素集合的下一个兄弟节点 集合
		next() {
			let next = [];
			this.each(item => {
				let isNext = item.nextSibling;
				if (isNext && isNext.nodeType === 1) {
					next.push(isNext);
				} else {
					if (isNext.nextSibling) {
						next.push(isNext.nextSibling);
					}
				}
			});
			this.elements = next;
			this.length = next.length;
			return this;
		}
		// 找到某一个子节点
		find(selector) {
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
		prev() {
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
		parent() {
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
		/*===================================================================
		 * 节点属性 的操作属性
		 *===================================================================*/
		// 获取 或者 设置html属性 获取的时候默认得到当前选择元素的第一个
		attr(attrName, val) {
			if (arguments.length === 0) {
				throw new Error('attr(attrName,val) maybe you lost param');
			} else if (arguments.length === 1) {
				return this.elements[0].getAttribute(attrName);
			} else {
				this.each(item => {
					item.setAttribute(attrName, val);
				});
			}
			return this;
		}
		// 移除属性
		removeAttr(attrName) {
			this.each(item => {
				item.removeAttribute(attrName);
			});
			return this;
		}
		/*===================================================================
		 * CSS 的操作属性 批量操作
		 *===================================================================*/
		// 添加css方法 参数类型 css属性:获取对应属性  属性对象：设置属性
		css(val) {
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
		// 添加 class
		addClass(className) {
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
		hasClass(className) {
			if (this.elements[0].className.indexOf(className) !== -1) {
				return true;
			} else {
				return false;
			}
		}
		// 移除class
		removeClass(className) {
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
		toggleClass(className) {
			if (this.hasClass(className)) {
				this.removeClass(className);
			} else {
				this.addClass(className);
			}
		}
		/*===================================================================
		 * 元素遍历
		 *===================================================================*/
		// 遍历节点数组方法
		each(arg1, arg2) {
			if (arguments.length === 1) {
				this.elements.forEach((item, index) => {
					arg1(item, index);
				});
			} else {
				let arr = arg1.selector ? arg1.elements : arg1;
				arr.forEach((item, index) => {
					arg2(item, index);
				});
			}
			return this;
		}
		/*===================================================================
		 * 事件 只提供通用事件绑定方法
		 *===================================================================*/
		// 绑定事件 ???????
		on(event, arg1, arg2) {
			if (arguments.length < 2) {
				throw new Error('params error')
			}
			this.each(item => {
				item.addEventListener(event, (e) => {
					if (arguments.length === 3) {
						let target = e.target
						if (target.matches(arg1)) {
							arg2.call(target, e)
						}
					} else if (arguments.length === 2) {
						arg1(e)
					}
				})
			});
			return this;
		}
		// 移除事件 ???????
		off(event, fn) {
			this.each(item => {
				item.removeEventListener(event, fn);
			});
			return this;
		}
		/*===================================================================
		 * Dom节点操作
		 *===================================================================*/
		// 根据html字符串创建 dom 元素
		createNode(str) {
			if (typeof str !== 'string' && /^\<([\s\S]{7,})\>$/.test(str)) {
				throw new Error('param or maybe not html string');
			} else {
				// 取出 开头<> 中的内容；
				let sContStr = str.match(/\<([\s\S]*?)\>/)[1];
				// 去掉标签名和后面的空格 剩下属性
				let sAttrStr = sContStr.replace(/[a-z]+\s?/, '');
				// 取出标签名称
				let sTagName = sContStr.match(/[a-z]+/)[0];
				// 取出属性值保存为数组
				let aValues = sAttrStr.match(/\"([\s\S]*?)\"/g);
				// 去掉属性值 取出属性名称
				let aNature = sAttrStr.replace(/\=\"([\s\S]*?)\"/g, '').match(/([a-z]+(\-?))+/g);
				// 取出innerHTML的内容
				let sInText = str.match(/\>([\s\S]*)\</)[1];
				// 创建dom元素
				let dom = document.createElement(sTagName);
				// 设置属性值和属性名
				if (aNature && aNature.length > 0) {
					let reg = /[\"|\']?/g;
					for (let i = 0; i < aNature.length; i++) {
						dom.setAttribute(aNature[i], aValues[i].replace(reg, ''))
					}
				}
				// 设置innerHTML的内容
				dom.innerHTML = sInText;
				// 返回dom对象
				return dom;
			}
		}
		// 添加 html 方法 存在参数则设置 元素的内容为 参数内容，没有参数则获取 第一个匹配元素的html
		html(html) {
			if (html) {
				this.each(item => item.innerHTML = html);
				return this;
			} else {
				return this.elements[0].innerHTML;
			}
		}
		// 在内部末尾插入节点 参数：节点html或者节点对象
		appendAfter(val) {
			this.each(item => {
				if (typeof val === 'object') {
					item.appendChild(val);
				} else {
					item.appendChild(this.createNode(val));
				}
			});
			return this;
		}
		// 在内部开始插入节点 参数：节点html或者节点对象
		appendBefore(val) {
			this.appendWhere(val, 0);
			return this;
		}
		// 在内部何处插入节点 参数1：节点html或者节点对象。 参数2：在哪个位置。
		appendWhere(val, num) {
			this.each(item => {
				if (typeof val === 'object') {
					item.insertBefore(val, item.children[num]);
				} else {
					item.insertBefore(this.createNode(val), item.children[num]);
				}
			});
		}
		// 移除某个父节点的全部子节点
		removeNode() {
			this.each(item => {
				item.parentNode.removeChild(item);
			});
			return this;
		}
		// 克隆元素 参数
		cloneNode(boolen) {

		}
		/*===================================================================
		 * 网络请求
		 *===================================================================*/
		// 实验性
		fetch(options) {
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
				// options.data = options.data || {};
				// 执行fetch
				return fetch(options.url, {
						method: options.type,
					})
					.then(response => response.json())
					.catch(error => console.error(`Fetch Error =\n`, error))
			} else {
				this.axios(options)
			}
		}
		axios(options) {
			// 这里有6个参数 url type data dataType
			// dataType 是指的是将返回的数据尝试进行json格式解析
			// 处理传过来的数据
			return new Promise((resolve, reject) => {
				options = options || {};
				options.url = options.url || '';
				options.type = options.type || 'get';
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
				// 判断类型
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
		// 跨域
		jsonp(options) {
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
		/*===================================================================
		 * 存储
		 *===================================================================*/
		cookie(options) {
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
		getStorage(key) {
			return localStorage.getItem(key)
		}
		setStorage(key,value) {
			localStorage.setItem(key,value)
		}
		removeStorage(key) {
			localStorage.removeItem(key);
		}
	}
	/*===================================================================
	 * 接口 $ 和 Slove
	 *===================================================================*/
	let Slove = selector => new S(selector);
	Slove.__proto__ = S.prototype;
	window.$ = window.Slove = Slove;
}