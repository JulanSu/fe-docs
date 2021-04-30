
## Vue3 新特性

距离`Vue3` 发布已经过去半年多了，正好最近有个新的项目，就使用了`Vue3`，记录一下`Vue3`的新特性和使用经验。


### Composition API

Composition API 是 Vue3 中新的概念，组合式API，setup 是他的入口

setup里常用的api:

- ref
- reactive
- toRefs
- watch
- watchEffect
- computed
- 新的生命周期钩子


setup是一个函数，具体执行时间是在 `beforeCreate` 之前
```
export default defineComponent({
  beforeCreate() {
    console.log("----beforeCreate----");
  },
  created() {
    console.log("----created----");
  },
  setup() {
    console.log("----setup----");
  },
});
```

![image](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cfa122fc38624892a1cfdd3efa14fdd6~tplv-k3u1fbpfcp-zoom-1.image)

setup 接收2个参数

- props: 组件传入的属性
- context

props 组件传来的值，是响应式的，会及时更新，不可使用ES6结构，会破坏他的响应式：


```
// 不可解构
export default defineComponent ({
    setup(props, context) {
        const { name } = props
        console.log(name)
    },
})

//想要解构，并且还要响应式，可以使用 toRefs

export default defineComponent ({
    setup(props, context) {
        const { name } = toRefs(props)
        console.log(name)
    },
})

```

我们在Vue2 中，经常用到 this，但是在 setup 里是没有 this的，但是我们可以通过 `context` 来访问 this 中的3个常见属性：

```
interface SetupContext {
  attrs: Data
  slots: Slots
  emit: (event: string, ...args: unknown[]) => void
}

```

以上3个值分别对应 $attr属性、slot插槽 和$emit事件，并且是实时更新的，拿到的都是最新的值。

#### ref

ref 一般将js基本类型数据转化为 响应式数据


```
setup() {
    const a = ref(0)
    setTimeout(() =>{
        a = 1
    }, 1000)
    return{
        a
    }
}

//ref 也可以处理对象
const data = ref({name: 'john'})
//实质上当 ref 处理对象的时候，用的 reactive

```

#### reactive 

reactive函数代理一个对象， 不能代理基本类型，例如字符串、数字、boolean 等。


```
<template>
    <div>
       {{data.text}}
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
    setup() {
         const data = reactive({
             name: 'john',
             text: 'join a hub'
         })
         
         const text = reactive('join') //不会报错，但不是响应式
         
         return {
            text
            data
         }
    }
})
</script>

<style scoped>
.ss {
    width: 100px;
}
</style>

```

#### toRefs

我们在平常写的时候，都不会写 data.xxx，都是直接 xxx 属性拿过来用，那我们直接在最后结构赋值为什么不行

```
<template>
    <div>
       {{text}}
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
    setup() {
         const data = reactive({
             name: 'john',
             text: 'join a hub'
         })
         
         const text = reactive('join') //不会报错，但不是响应式
         
         return {
            ...data
         }
    }
})
</script>

<style scoped>
.ss {
    width: 100px;
}
</style>

```

Vue3 使用的proxy 来代理对象，解构赋值本身是浅拷贝，当我们解构赋值的话，值是基本数据的话，会形成一个新的地址，值是引用数据的话，是还有响应式的：


```
<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
    setup() {
         const data = reactive({
            name: 'john',
            age: {
                big: 17,
                small: 16
            }
         })
         
         const text = reactive('join') //不会报错，但不是响应式
         
         return {
            ...data
         }
    }
})
//此时 name 已经失去响应式，age还有响应式，因为他是引用类型

//因此引入 refs

return {
    ...toRefs(data)
}

</script>
```

#### watch

> watch 函数用来侦听特定的数据源，并在回调函数中执行副作用。默认情况是惰性的，也就是说仅在侦听的源数据变更时才执行回调。

语法：

```
watch(source, callback, [options])

```

- source: 可以支持 string，Object，Function，Array 用于指定要侦听的响应式变量
- callback: 执行的回调函数
- options：支持 deep、immediate 和 flush（默认pre/post/sync） 选项


##### 侦听 reactive 定义的数据


```
import { defineComponent, ref, reactive, toRefs, watch } from "vue";
export default defineComponent({
  setup() {
    const state = reactive({ nickname: "xiaofan", age: 20 });

    setTimeout(() => {
      state.age++;
    }, 1000);

    // 修改age值时会触发 watch的回调
    watch(
      () => state.age,
      (curAge, preAge) => {
        console.log("新值:", curAge, "老值:", preAge);
      }
    );

    return {
      ...toRefs(state),
    };
  },
});

```

##### 侦听 ref 定义的数据

```
const year = ref(0);

setTimeout(() => {
  year.value++;
}, 1000);

watch(year, (newVal, oldVal) => {
  console.log("新值:", newVal, "老值:", oldVal);
});

```

##### 侦听多个数据

侦听多个数据需要用到数组：


```
watch([() => state.age, year], ([curAge, newVal], [preAge, oldVal]) => {
    console.log("新值:", curAge, "老值:", preAge); 
    console.log("新值:", newVal, "老值:", oldVal); 
});

```

##### 侦听复杂的嵌套对象

需要设置 option中 deep: true



```
const state = reactive({ 
  id: 1, 
  attributes: { 
    name: "",
  },
});

watch(
  () => state,
  (state, prevState) => {
    console.log(
      "not deep ",
      state.attributes.name,
      prevState.attributes.name
    );
  }
);

watch(
  () => state,
  (state, prevState) => {
    console.log(
      "deep ",
      state.attributes.name,
      prevState.attributes.name
    );
  },
  { deep: true }
);

state.attributes.name = "Alex"; // Logs: "deep " "Alex" "Alex"
```

默认情况下，watch 是惰性的, 那什么情况下不是惰性的， 可以立即执行回调函数呢？其实使用也很简单，给第三个参数中设置 `immediate: true`，即可，就是初始化的时候也会执行一次回调函数。


#### 停止监听

们在组件中创建的watch监听，会在组件被销毁时自动停止。

如果在组件销毁之前我们想要停止掉某个监听， 可以调用`watch()`函数的返回值：


```
const stopWatchRoom = watch(() => state.room, (newType, oldType) => {
    console.log("新值:", newType, "老值:", oldType);
}, {deep:true});

setTimeout(()=>{
    // 停止监听
    stopWatchRoom()
}, 3000)
```

#### watchEffect

Vue3 新增api，可以不用手动传入依赖


```
// 例子灵感来源于[文档](https://v3.vuejs.org/api/computed-watch-api.html#watcheffect)

import { watchEffect, ref } from 'vue'
setup () {
    const userID = ref(0)
    watchEffect(() => console.log(userID))
    setTimeout(() => {
      userID.value = 1
    }, 1000)
    
    //log: 0 1

    return {
      userID
    }
 }
```

与watch 有3点不同

- watchEffect 不需要手动传入依赖
- watchEffect 会先执行一次用来自动收集依赖
- watchEffect 无法获取到变化前的值， 只能获取变化后的值


##### 停止监听

与watch 用法一样

```
const stop = watchEffect(() => {
  /* ... */
})

// later
stop()
```

如果 `watchEffect` 是在 `setup` 或者 生命周期里面注册的话，在组件取消挂载的时候会自动的停止掉。



##### 清除副作用

> 有时副作用函数会执行一些异步的副作用，这些响应需要在其失效时清除 (即完成之前状态已改变了) 。所以侦听副作用传入的函数可以接收一个 onInvalidate 函数作入参，用来注册清理失效时的回调

假设我们现在用一个用户ID去查询用户的详情信息，然后我们监听了这个用户ID， 当用户ID 改变的时候我们就会去发起一次请求，这很简单，用watch 就可以做到。 

但是如果在请求数据的过程中，我们的用户ID发生了多次变化，那么我们就会发起多次请求，而最后一次返回的数据将会覆盖掉我们之前返回的所有用户详情。这不仅会导致资源浪费，还无法保证 watch 回调执行的顺序。而使用 watchEffect 我们就可以做到。

onInvalidate()

onInvalidate(fn)传入的回调会在 watchEffect 重新运行或者 watchEffect 停止的时候执行


```
watchEffect(() => {
      // 异步api调用，返回一个操作对象
      const apiCall = someAsyncMethod(props.userID)

      onInvalidate(() => {
        // 取消异步api的调用。
        apiCall.cancel()
      })
})
```
借助 onInvalidate 我们就可以对上面所述的情况作出比较优雅的优化。




#### computed

计算属性 


```
const count = ref(1)
const plusOne = computed(() => count.value++)

console.log(plusOne.value) // 2

plusOne.value++ // error
```
或者，它可以使用一个带有 get 和 set 函数的对象来创建一个可写的 ref 对象。


```
const count = ref(1)
const plusOne = computed({
  get: () => count.value + 1,
  set: val => {
    count.value = val - 1
  }
})

plusOne.value = 1
console.log(count.value) // 0
```

#### 生命周期 

生命周期：
![image](https://vkceyugu.cdn.bspapp.com/VKCEYUGU-af45a535-2bbc-49ea-9451-ad8ff28b582e/89f7ee97-4d24-44eb-bfb2-7324742a7a40.jpg)

- setup() :开始创建组件之前，在beforeCreate执行。创建的是data和method
- onBeforeMount() : 组件挂载到节点上之前执行的函数。
- onMounted() : 组件挂载完成后执行的函数。
- onBeforeUpdate(): 组件更新之前执行的函数。
- onUpdated(): 组件更新完成之后执行的函数。
- onBeforeUnmount(): 组件卸载之前执行的函数。
- onUnmounted(): 组件卸载完成后执行的函数
- onActivated(): 被包含在<keep-alive>中的组件，会多出两个生命周期钩子函数。被激活时执行。
- onDeactivated(): 比如从 A 组件，切换到 B 组件，A 组件消失时执行。
- onErrorCaptured(): 当捕获一个来自子孙组件的异常时激活钩子函数。

和 Vue2 作对比：


```
Vue2---------------vue3
beforeCreate    -> setup()
created         -> setup()
beforeMount     -> onBeforeMount
mounted         -> onMounted
beforeUpdate    -> onBeforeUpdate
updated         -> onUpdated
beforeDestroy   -> onBeforeUnmount
destroyed       -> onUnmounted
activated       -> onActivated
deactivated     -> onDeactivated
errorCaptured   -> onErrorCaptured
renderTracked   -> onRenderTracked
renderTriggered -> onRenderTriggered
```


##### onRenderTracked 和 onRenderTriggered

onRenderTracked 状态跟踪：它会跟踪页面上所有响应式变量和方法的状态，也就是我们用return返回去的值，他都会跟踪。

**只要页面有update的情况**，他就会触发，然后生成一个event对象，我们通过event对象来查找程序的问题所在。

onRenderTriggered直译过来是状态触发，它不会跟踪每一个值，而是给你变化值的信息，并且新值和旧值都会给你明确的展示出来。


### Teleport

Teleport 是 Vue3 新增的，直译`瞬间移`动组件，个人觉得不太好理解,我把这个函数叫`独立组件`.

Teleport，可以把 子组件 渲染到你任意想渲染的外部Dom上，不必嵌套再#app里了，这样就不会互相干扰了。

你可以把Teleport看成一个传送门，把你的组件传送到你需要的地方。 teleport组件和其它组件没有任何其它的差异，用起来都是一样的。


定义一个 Dialog组件Dialog.vue


```
<template>
  <teleport to="#dialog">
    <div class="dialog">
      <div class="dialog_wrapper">
        <div class="dialog_header" v-if="title">
          <slot name="header">
            <span>{{ title }}</span>
          </slot>
        </div>
      </div>
      <div class="dialog_content">
        <slot></slot>
      </div>
      <div class="dialog_footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </teleport>
</template>

//to属性要具体到某个元素

```

在index.html文件中定义一个供挂载的元素:


```
<body>
  <div id="app"></div>
  <div id="dialog"></div>
</body>
```

Header 中应用：


```
<div class="header">
    ...
    <navbar />
    <Dialog v-if="dialogVisible"></Dialog>
</div>
```

此时我们就能看到 dialog 组件，和 app 同级，但又是在组件里完全控制的。


teleport 接收2个props:

- to: 需要 prop，必须是有效的查询选择器或 HTMLElement (如果在浏览器环境中使用)。指定将在其中移动 <teleport> 内容的目标元素
- disabled: Boolean(默认false)，是否禁用，禁用的时候子组件和 平常组件一样，不会到指定元素中。


### Suspense

Suspense 异步请求组件，基本用法：


如果你要使用Suspense的话，子组件要返回一个promise对象，而不是原来的那种JSON对象。

AsyncShow: 


```
<template>
  <h1>{{ result }}</h1>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  setup() {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        return resolve({ result: "JSPang" });
      }, 2000);
    });
  },
});
</script>

//一般都是用 async/await，他们是 promise 的语法糖，本质也是返回一个 promise


<template>
  <h1>{{ result }}</h1>
</template>
<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  async setup() {
    const res = await axios.get('https://apiblog.jspang.com/default/getGirl')
    return {
        result: res
    }
  },
});
</script>

```



父组件
```
<template>
  <div>
    <Suspense>
      <template #default>
        <AsyncShow />
      </template>
      <template #fallback>
        <h1>Loading...</h1>
      </template>
    </Suspense>
  </div>
</template>
```

支持2个插槽：
- default：异步请求完成后，显示的内容
- fallback：代表在加载中时，显示的模板内容


### Fragment

Fragment：片段，在 Vue2 中， template中只允许有一个根节点：

```
<template>
    <div>
        <span></span>
        <span></span>
    </div>
</template>

```

但是在 Vue3 中，可以直接写多个根节点:

```
<template>
    <span></span>
    <span></span>
</template>
```


## 其他一些与Vue2 不同的重大变更

### slot 


在 Vue2.x 中， 具名插槽的写法：

```
<!--  子组件中：-->
<slot name="title"></slot>

在父组件中使用：
<template slot="title">
    <h1>歌曲：成都</h1>
<template>
```

如果我们要在 slot 上面绑定数据，可以使用作用域插槽，实现如下：

```
// 子组件
<slot name="content" :data="data"></slot>
export default {
    data(){
        return{
            data:["走过来人来人往","不喜欢也得欣赏","陪伴是最长情的告白"]
        }
    }
}

<!-- 父组件中使用 -->
<template slot="content" slot-scope="scoped">
    <div v-for="item in scoped.data">{{item}}</div>
<template>
```


在 Vue2.x 中具名插槽和作用域插槽分别使用slot和slot-scope来实现， 在 Vue3.0 中将slot和slot-scope进行了合并同意使用。

```
Vue3.0 中v-slot：
<!-- 父组件中使用 -->
 <template v-slot:content="scoped">
   <div v-for="item in scoped.data">{{item}}</div>
</template>

<!-- 也可以简写成： -->
<template #content="{data}">
    <div v-for="item in data">{{item}}</div>
</template>
```

### 自定义指令

Vue 2 中实现一个自定义指令：


```
// 注册一个全局自定义指令 `v-focus`
Vue.directive('focus', {
  // 当被绑定的元素插入到 DOM 中时……
  inserted: function (el) {
    // 聚焦元素
    el.focus()
  }
})

```

在 Vue 2 中， 自定义指令通过以下几个可选钩子创建：

- bind：只调用一次，指令第一次绑定到元素时调用。在这里可以进行一次性的初始化设置。
- inserted：被绑定元素插入父节点时调用 (仅保证父节点存在，但不一定已被插入文档中)。
- update：所在组件的 VNode 更新时调用，但是可能发生在其子 VNode 更新之前。指令的值可能发生了改变，也可能没有。但是你可以通过比较更新前后的值来忽略不必要的模板更新。
- componentUpdated：指令所在组件的 VNode 及其子 VNode 全部更新后调用。
unbind：只调用一次，指令与元素解绑时调用。

在 Vue 3 中对自定义指令的 API 进行了更加语义化的修改， 就如组件生命周期变更一样， 都是为了更好的语义化:


```
const app = Vue.createApp({})

app.directive('pin', {
  mounted(el, binding) {
    el.style.position = 'fixed'
    // binding.value is the value we pass to directive - in this case, it's 200
    el.style.top = binding.value + 'px'
  },
  beforeUpdate() {
      
  }
})

```

### v-model 

变更之处：

- 变更：在自定义组件上使用v-model时， 属性以及事件的默认名称变了
- 变更：v-bind的.sync修饰符在 Vue 3 中又被去掉了, 合并到了v-model里
- 新增：同一组件可以同时设置多个 v-model
- 新增：开发者可以自定义 v-model修饰符

Vue2中，在组件上使用 v-model其实就相当于传递了value属性， 并触发了input事件：

```
<!-- Vue 2 -->
<search-input v-model="searchValue"><search-input>

<!-- 相当于 -->
<search-input :value="searchValue" @input="searchValue=$event"><search-input>
```

这时v-model只能绑定在组件的value属性上， 我们就想给自己的组件用一个别的属性，并且我们不想通过触发input来更新值，在.async出来之前，Vue 2 中这样实现：

```
// 子组件：searchInput.vue
export default {
    model:{
        prop: 'search',
        event:'change'
    }
}
```
修改后， searchInput 组件使用v-model就相当于这样：
```
<search-input v-model="searchValue"><search-input>
<!-- 相当于 -->
<search-input :search="searchValue" @change="searchValue=$event"><search-input>
```


但是在实际开发中，有些场景我们可能需要对一个 prop 进行 “双向绑定”， 这里以最常见的 modal 为例子：

modal 挺合适属性双向绑定的，外部可以控制组件的visible显示或者隐藏，组件内部关闭可以控制 visible属性隐藏，同时 visible 属性同步传输到外部。组件内部， 当我们关闭modal时, 在子组件中以 `update:PropName`模式触发事件：

```
this.$emit('update:visible', false)
```

然后在父组件中可以监听这个事件进行数据更新：
```
<modal :visible="isVisible" @update:visible="isVisible = $event"></modal>
```
此时我们也可以使用v-bind.async来简化实现：
```
<modal :visible.async="isVisible"></modal>
```

Vue3中， 在自定义组件上使用v-model, 相当于传递一个`modelValue` 属性， 同时触发一个`update:modelValue`事件


```
<modal v-model="isVisible"></modal>
<!-- 相当于 -->
<modal :modelValue="isVisible" @update:modelValue="isVisible = $event"></modal>
```
如果要绑定属性名， 只需要给v-model传递一个参数就行, 同时可以绑定多个v-model：


```
<modal v-model:visible="isVisible" v-model:content="content"></modal>

<!-- 相当于 -->
<modal
    :visible="isVisible"
    :content="content"
    @update:visible="isVisible"
    @update:content="content"
/>

```

这里已经没有 .async什么事儿了，所以，Vue 3 中抛弃了.async写法， 统一使用v-model。


### 异步组件

Vue3 中 使用 defineAsyncComponent 创建一个只有在需要时才会加载的异步组件，配置选项 component 替换为 loader ，Loader 函数本身不再接收 resolve 和 reject 参数，且必须返回一个 Promise


```
<template>
  <!-- 异步组件的使用 -->
  <AsyncPage />
</tempate>

<script>
import { defineAsyncComponent } from "vue";

export default {
  components: {
    // 无配置项异步组件
    AsyncPage: defineAsyncComponent(() => import("./NextPage.vue")),

    // 有配置项异步组件
    AsyncPageWithOptions: defineAsyncComponent({
       loader: () => import(".NextPage.vue"),
       delay: 200,
       timeout: 3000,
       errorComponent: () => import("./ErrorComponent.vue"),
       loadingComponent: () => import("./LoadingComponent.vue"),
     })
  }
}
</script>

```

## 最后 

最后对比下 Vue3 和 Vue2 的响应式：

Object.defineProperty 与 Proxy：

1. Object.defineProperty只能劫持对象的属性， 而 Proxy 是直接代理对象
2. Object.defineProperty对新增属性需要手动进行 Observe

proxy 参考文档：https://es6.ruanyifeng.com/#docs/proxy
