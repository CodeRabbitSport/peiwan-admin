# CategorySelect 商品分类选择器

商品分类下拉选择组件，自动从后端加载分类数据。

## 基本用法

```vue
<template>
  <CategorySelect v-model="categoryId" />
</template>

<script setup lang="ts">
const categoryId = ref<number>()
</script>
```

## Props

| 参数 | 说明 | 类型 | 默认值 |
|------|------|------|--------|
| modelValue | 绑定值 | `number \| null` | `undefined` |
| placeholder | 占位文本 | `string` | `'请选择商品分类'` |
| clearable | 是否可清空 | `boolean` | `true` |
| disabled | 是否禁用 | `boolean` | `false` |
| multiple | 是否多选 | `boolean` | `false` |

## Events

| 事件名 | 说明 | 回调参数 |
|--------|------|----------|
| change | 选中值发生变化时触发 | `(value: number \| null) => void` |

## 暴露方法

| 方法名 | 说明 | 参数 |
|--------|------|------|
| refresh | 刷新分类列表 | - |

## 示例

### 基础用法
```vue
<CategorySelect v-model="form.categoryId" />
```

### 禁用状态
```vue
<CategorySelect v-model="form.categoryId" disabled />
```

### 多选
```vue
<CategorySelect v-model="form.categoryIds" multiple />
```

### 监听变化
```vue
<CategorySelect 
  v-model="form.categoryId" 
  @change="handleCategoryChange"
/>
```

### 手动刷新
```vue
<template>
  <CategorySelect ref="categorySelectRef" v-model="form.categoryId" />
  <el-button @click="handleRefresh">刷新</el-button>
</template>

<script setup lang="ts">
const categorySelectRef = ref()

function handleRefresh() {
  categorySelectRef.value?.refresh()
}
</script>
```

## 使用场景

- ✅ 等级申请列表筛选
- ✅ 商品表单分类选择
- ✅ 用户名片分类选择
- ✅ 任何需要选择商品分类的场景
