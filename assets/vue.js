function MyVue (opts){

  this.data = opts.data;

  observer(this.data,this)

  var id = opts.el;

  var dom =nodeToFragment(document.getElementById(id),this);

  document.getElementById(id).appendChild(dom)
}


//文档片段
function nodeToFragment (node,vm){
  var flag = document.createDocumentFragment();

  var child;

  while (child = node.firstChild){
    compile(child,vm);

    flag.appendChild(child);
  }


  return flag
}

function compile (node,vm){
  var reg = /\{\{(.*)\}\}/;

  //节点类型：元素
  if(node.nodeType ===1){
    var attr = node.attributes;
    // 有属性
    for(var i=0;i<attr.length;i++){
      
      if(attr[i].nodeName == 'v-model'){

        var name = attr[i].nodeValue;

        node.addEventListener('input', function (e) {
          // 给相应的 data 属性赋值，进而触发该属性的 set 方法
          vm[name] = e.target.value;
        });

        node.value = vm.data[name];

        node.removeAttribute('v-model');

      }

      new Watcher(vm,node,name,'input')
    }


    var childs = node.childNodes;
    //有子元素
    for(var i=0;i<childs.length;i++){
      compile(childs[i],vm)
    }
  }  
  //节点类型：text
  else if(node.nodeType ===3){
    if(reg.test(node.nodeValue)){
      //指的是与正则表达式匹配的第一个 子匹配(以括号为标志)字符串
      var name = RegExp.$1;
      name = name.trim();
      // node.nodeValue = vm[name];
      new Watcher(vm,node,name,'text')
    }
  }
}


function observer (obj, vm) {
  Object.keys(obj).forEach(function (key) {
    defineReactive(vm, key, obj[key]);
  })
}

function defineReactive (obj, key, val) {
  var dep = new Dep();

  Object.defineProperty(obj, key, {
    get: function () {
      // 添加订阅者 watcher 到主题对象 Dep
      if (Dep.target) {
        dep.addSub(Dep.target)
      };
      return val
    },
    set: function (newVal) {
      if (newVal === val) return
      val = newVal;
      // 作为发布者发出通知
      dep.notify();
    }
  });
}







function Dep () {
  this.subs = []
}

Dep.prototype = {
  addSub: function(sub) {
    this.subs.push(sub);
  },

  notify: function() {
    this.subs.forEach(function(sub) {
      sub.update();
    });
  }
}



function Watcher (vm, node, name, nodeType) {
  Dep.target = this;
  this.name = name;
  this.node = node;
  this.vm = vm;
  this.nodeType = nodeType;
  this.update();
  Dep.target = null;
}

Watcher.prototype = {
  update: function () {
    this.get();
    if (this.nodeType == 'text') {
      this.node.nodeValue = this.value;
    }
    if (this.nodeType == 'input') {
      this.node.value = this.value;
    }
  },
  // 获取 data 中的属性值
  get: function () {
    this.value = this.vm[this.name]; // 触发相应属性的 get
  }
}

