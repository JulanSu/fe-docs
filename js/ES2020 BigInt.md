
## 新增基本数据类型 BigInt

### BigInt

BigInt 是一种特殊的数字类型，它提供了对任意长度**整数**的支持。

创建 bigint 的方式有两种：在一个整数字面量后面加 n 或者调用 BigInt 函数，该函数从字符串、数字等中生成 bigint。


```
const bigint = 1234567890123456789012345678901234567890n;

const sameBigint = BigInt("1234567890123456789012345678901234567890");

const bigintFromNumber = BigInt(10); // 与 10n 相同

```


### 数学运算符

BigInt 大多数情况下可以像常规数字类型一样使用，例如：


```
alert(1n + 2n); // 3n

alert(5n / 2n); // 2n

```

由于 Bigint 是整数，所以 5n / 2n = 2n

我们不可以把 bigint 和常规数字类型混合使用：


```
alert(1n + 2); // Error: Cannot mix BigInt and other types

```

如果有需要，我们应该显式地转换它们：使用 BigInt() 或者 Number()，像这样：


```
let bigint = 1n;
let number = 2;

// 将 number 转换为 bigint
alert(bigint + BigInt(number)); // 3

// 将 bigint 转换为 number
alert(Number(bigint) + number); // 3
```

转换操作始终是静默的，绝不会报错，**但是如果 bigint 太大而数字类型无法容纳，则会截断多余的位**，因此我们应该谨慎进行此类转换。

#### BigInt 不支持一元加法


```
let bigint = 1n;

alert( +bigint ); // error
```
所以我们应该用 Number() 来将一个 bigint 转换成一个数字类型。



### 比较运算符

比较运算符，例如 < 和 >，使用它们来对 bigint 和 number 类型的数字进行比较没有问题：


```
alert( 2n > 1n ); // true

alert( 2n > 1 ); // true
```

但是请注意，由于 number 和 bigint 属于不同类型，它们可能在进行 `==` 比较时相等，但在进行 `===`（严格相等）比较时不相等：


```
alert( 1 == 1n ); // true

alert( 1 === 1n ); // false
```

### 布尔运算

当在 if 或其他布尔运算中时，bigint 的行为类似于 number。

例如，在 if 中，bigint 0n 为 false，其他值为 true：

```
if (0n) {
  // 永远不会执行
}
```


布尔运算符，例如 ||，&& 和其他运算符，处理 bigint 的方式也类似于 number：

```
alert( 1n || 2 ); // 1（1n 被认为是 true）

alert( 0n || 2 ); // 2（0n 被认为是 false）
```


### 参考

[MDN BigInt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt)


