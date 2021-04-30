

### composition API

组合式 API：**一组低侵入式的、函数式的 API，使得我们能够更灵活地「组合」组件的逻辑**


先用vue2 简单实现一个加减小功能



```
<template>
  <div class="homePage">
    <p>count: {{ count }}</p>   
    <p>倍数： {{ multiple }}</p>        
    <div>
      <button style="margin-right: 10px" @click="increase">加1</button>
      <button @click="decrease">减一</button>    
    </div>      
  </div>
</template>
<script>
export default {
  data() {
    return { count: 0 };
  },
  computed: {
    multiple() {
      return 2 * this.count;
    },
  },
  methods: {
    increase() {
      this.count++;
    },
    decrease() {
      this.count--;
    },
  },
};
</script>
```

上面代码只是实现了对count的加减以及显示倍数， 就需要分别在 data、methods、computed 中进行操作，当我们增加一个需求，就会出现下图的情况：

![image](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-af45a535-2bbc-49ea-9451-ad8ff28b582e/c43bf76d-f996-45f2-a09a-9c4cdbbf47c7.jpg)

当我们业务越来越多，代码也越来越多的时候：

![image](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-af45a535-2bbc-49ea-9451-ad8ff28b582e/65a8beb0-5fff-494d-8c20-73f859ba499c.jpg)


这样的话，代买越来越多，我们想改其中一个功能，就需要在 data、methods之间来回横跳。

因此我们是否能把代码按照逻辑区分呢

![image](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-af45a535-2bbc-49ea-9451-ad8ff28b582e/f1f88f01-95e9-490c-a477-4f19e3240f55.jpg)

就像这样，简单整洁。



vue2中我们可以用 **mixin**，但 **mixin**也有一些弊端

- 容易造成命名冲突
- 逻辑复用难，经常需要差异化处理
- 属性不清晰，需要查看 mixin 文件暴露的属性


因此 vue3 推出了 **Composition API**，用于将逻辑放在一起，进而可以单独拆分为独立文件，使代码更加容易维护和阅读。

