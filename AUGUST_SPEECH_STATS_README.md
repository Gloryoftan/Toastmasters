# 8月备稿统计功能说明

## 功能概述

在统计分析页面新增了"8月备稿统计"功能，用于显示2025年8月期间所有会员的备稿演讲情况。

## 功能特性

### 显示内容
- **会员姓名**：演讲者的英文姓名
- **演讲题目**：备稿演讲的标题
- **项目**：对应的Toastmasters项目名称（英文）
- **个评人**：个人点评员的英文姓名
- **会议日期**：演讲举行的日期（MM-dd格式）
- **会议编号**：对应的会议编号

### 🏷️ ET标签功能
- **正式会员标识**：所有 `membershipType` 为 `'member'` 的正式会员，姓名右上角会显示一个绿色的"ET"标签
- **标签样式**：
  - 绿色渐变背景，白色边框
  - 圆角设计，带有阴影效果
  - 位置在姓名右上角，不遮挡文字
  - 响应式设计，支持移动端查看

### 数据来源
- 从会议数据中筛选2025年8月的会议
- 提取每个会议中的备稿演讲信息
- 关联会员信息、项目信息和评估员信息
- 按会议日期倒序排列

### 技术实现

#### 数据模型
在 `src/app/core/models/statistics.model.ts` 中新增了 `AugustSpeechStats` 接口：

```typescript
export interface AugustSpeechStats {
  memberId: string;
  memberName: string;
  speechTitle: string;
  projectId: string;
  projectName: string;
  evaluatorId: string;
  evaluatorName: string;
  meetingDate: Date;
  meetingNumber: number;
}
```

#### 数据服务
在 `src/app/core/services/data.service.ts` 中新增了 `getAugustSpeechStats()` 方法：

```typescript
getAugustSpeechStats(): Observable<AugustSpeechStats[]> {
  return combineLatest([this.meetings$, this.members$, this.projects$]).pipe(
    map(([meetings, members, projects]) => {
      // 筛选8月会议并处理演讲数据
    })
  );
}
```

#### 组件更新
在 `src/app/features/statistics/statistics.component.ts` 中：
- 导入了新的接口和 `combineLatest` 操作符
- 添加了 `augustSpeechStatsWithMembers$` Observable，包含会员类型信息
- 在模板中新增了8月备稿统计的显示区域
- 实现了ET标签的显示逻辑和样式

#### ET标签实现
```typescript
// 创建包含会员类型信息的备稿统计
this.augustSpeechStatsWithMembers$ = combineLatest([
  this.augustSpeechStats$,
  this.members$
]).pipe(
  map(([speeches, members]) => {
    return speeches.map(speech => ({
      ...speech,
      isFormalMember: members.some(m => m.id === speech.memberId && m.membershipType === 'member'),
      isFormalEvaluator: members.some(m => m.id === speech.evaluatorId && m.membershipType === 'member')
    }));
  })
);
```

## 使用方法

1. 访问统计分析页面 (`/statistics`)
2. 在"出勤率统计"下方可以看到两个新的统计区域：
   - **"8月备稿统计"**：显示所有8月的备稿演讲记录
   - **"8月会员参会统计"**：显示每个会员的参会情况统计
3. **正式会员的姓名后面会显示绿色的"ET"标签**
4. 如果没有8月数据，会显示相应的提示信息

## 数据示例

### 8月备稿统计
根据现有的会议数据，8月备稿统计将显示：

- **8月3日**：4个备稿演讲
  - "Who Am I" (Ice Breaker) - 演讲者姓名后面显示ET标签（如果是正式会员）
  - "Overcome Inner Demons, Transcend Self" (Inspire Your Audience)
  - "Keep your own pace" (Writing a Speech With Purpose)
  - "Think like a lawyer" (Evaluation and Feedback)

- **8月8日**：2个备稿演讲
  - "Ice Breaker" (Ice Breaker)
  - "How to sell this pen" (项目PJ50)

- **8月17日**：2个备稿演讲
  - "Rosemarry" (Ice Breaker)
  - "I'm starting to get excited" (Introduction to Vocal Variety and Body Language)

- **8月24日**：3个备稿演讲
  - "Life Is A Book" (Ice Breaker)
  - "What Makes Someone an Entrepreneur?" (Introduction to Vocal Variety and Body Language)
  - "Hello everyone, my name is Xiaofan" (Introduction to Vocal Variety and Body Language)

### 📊 8月会员参会统计
- **会员姓名**：会员的英文姓名
- **总参会数**：实际参加的会议场数（每场会议只算一次，即使担任多个角色）
- **备稿数**：备稿演讲的次数
- **个评数**：个人点评的次数
- **角色数**：担任会议角色的次数

**重要说明**：统计逻辑已优化，确保每场会议每个会员只被计算一次参会。例如：
- 会员A在8月3日的会议中既备稿又当总评 → 只算1次参会，但备稿数+1，角色数+1
- 会员B在8月8日的会议中只备稿 → 算1次参会，备稿数+1
- 会员C在8月17日的会议中既备稿又当个评 → 只算1次参会，但备稿数+1，个评数+1
- 会员D在8月24日的会议中只是参会，没有担任任何角色 → 算1次参会，备稿数、个评数、角色数都是0

**排序逻辑**：采用两段排序方式
1. **第一段**：ET会员（正式会员）按总参会数从高到低排序
2. **第二段**：非ET会员按总参会数从高到低排序

**示例数据**：
```
会员姓名    总参会数  备稿数  个评数  角色数
John Smith    5        2      1      2
Jane Doe      4        1      1      2
Mike Johnson  3        1      0      2
```

**数据说明**：
- **总参会数**：实际参加的会议场数
- **备稿数**：在会议中担任演讲者的次数
- **个评数**：在会议中担任点评员的次数
- **角色数**：在会议中担任其他角色的次数（如主持人、计时员等）

## 注意事项

1. 目前硬编码为2025年8月，如需其他月份可以修改 `getAugustSpeechStats()` 方法中的年份和月份判断
2. 所有姓名都显示英文名，符合用户要求
3. 项目名称优先显示英文名称，如果找不到对应的项目信息则显示项目ID
4. 评估员如果未指定，会显示"未指定"
5. **ET标签只对正式会员（`membershipType === 'member'`）显示**
6. **标签位置经过优化，直接跟在姓名后面，不会遮挡任何文字内容**
7. 使用flexbox布局确保标签与姓名完美对齐，视觉效果更佳

## 扩展建议

1. 可以添加月份选择器，让用户查看任意月份的备稿统计
2. 可以添加按会员、项目类型等维度的筛选功能
3. 可以添加统计图表，如每月备稿数量趋势等
4. 可以添加导出功能，支持导出为Excel或PDF格式
5. 可以自定义ET标签的样式和颜色
6. 可以添加其他类型的会员标识标签（如荣誉会员、前会员等）

## 🆕 新增功能

### 📸 表格截图功能
两个主要统计表格现在都支持保存为截图：

1. **8月备稿统计表格** - 点击"📷 保存截图"按钮
2. **8月会员参会统计表格** - 点击"📷 保存截图"按钮

**功能特点：**
- 使用html2canvas库生成高质量截图
- 自动设置白色背景，确保截图清晰
- 2倍缩放，保证图片质量
- 自动生成带日期的文件名
- 支持PNG格式下载

**使用方法：**
1. 在统计页面找到对应的表格
2. 点击表格右上角的绿色"📷 保存截图"按钮
3. 浏览器会自动下载PNG格式的截图文件
4. 文件名格式：`8月备稿统计_YYYY-MM-DD.png` 或 `8月会员参会统计_YYYY-MM-DD.png`

**技术实现：**
- 依赖：`html2canvas` 库
- 截图配置：2倍缩放、白色背景、支持CORS
- 错误处理：截图失败时显示友好提示
