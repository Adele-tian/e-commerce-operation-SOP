// ============================================================
// Mock 数据 - 涂抹面膜全流程SOP自动化系统
// ============================================================

// --- Dashboard ---
export const dashboardStats = {
  totalProducts: 12,
  totalKeywords: 348,
  pendingReview: 7,
  monthlyGenerated: 56,
}

export const trendData = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 5, i + 1)
  return {
    date: `${d.getMonth() + 1}/${d.getDate()}`,
    impressions: Math.floor(8000 + Math.random() * 4000 + i * 100),
    clicks: Math.floor(400 + Math.random() * 200 + i * 8),
    conversions: Math.floor(30 + Math.random() * 20 + i * 1.5),
  }
})

export const recentActivities = [
  { id: 1, type: 'keyword', text: '新增关键词 "补水涂抹面膜敏感肌"', time: '10分钟前' },
  { id: 2, type: 'image', text: '主图V3版本已审核通过', time: '1小时前' },
  { id: 3, type: 'competitor', text: '竞品"珀莱雅"评价分析完成', time: '2小时前' },
  { id: 4, type: 'content', text: '详情页脚本已生成待审核', time: '3小时前' },
  { id: 5, type: 'social', text: '小红书笔记已标记发布', time: '昨天' },
  { id: 6, type: 'video', text: '短视频脚本审核通过', time: '昨天' },
]

// --- 蓝海探测 ---
export const marketScanResult = {
  blueOceanScore: 72,
  marketCapacity: '¥2.8亿/年',
  avgPrice: '¥89',
  totalProducts: 1240,
  topSellerShare: 34,
  newProductSurvival: 18,
}

export const priceDistribution = [
  { range: '0-30', count: 180, avgSales: 450 },
  { range: '30-60', count: 320, avgSales: 680 },
  { range: '60-100', count: 410, avgSales: 890 },
  { range: '100-150', count: 200, avgSales: 560 },
  { range: '150-200', count: 80, avgSales: 340 },
  { range: '200+', count: 50, avgSales: 220 },
]

export const competitionTrend = Array.from({ length: 12 }, (_, i) => ({
  month: `${i + 1}月`,
  competition: +(0.6 + Math.random() * 0.3 - i * 0.01).toFixed(2),
  newProducts: Math.floor(40 + Math.random() * 30),
}))

export const marketReport = `## 涂抹面膜市场机会评估

### 市场概况
涂抹面膜品类近6个月搜索量增长23%，市场容量约2.8亿/年。品类竞争度中等偏低，存在明显的细分市场机会。

### 关键发现
1. **价格带空白**: 60-100元价格带竞争最激烈，但100-150元价格带存在品质型消费空白
2. **功效需求**: "补水保湿"搜索占比38%，"美白提亮"占比22%，"修护舒缓"增长最快(+45%)
3. **场景机会**: "睡前免洗"场景搜索量月均增长15%，目前头部产品未重点布局

### 建议策略
- 主攻100-150元价格带，定位"功效型涂抹面膜"
- 核心卖点聚焦"夜间修护+免洗"概念
- 配合"敏感肌可用"差异化标签`

export const entryStrategies = [
  { title: '功效差异化', desc: '主打"夜间修护+免洗"概念，切入100-150元价格带', score: 85, difficulty: '中等' },
  { title: '人群细分', desc: '针对敏感肌人群，强调温和无刺激配方', score: 78, difficulty: '较低' },
  { title: '场景创新', desc: '打造"旅行便携装"场景，小规格高频复购', score: 72, difficulty: '较低' },
]

// --- 关键词 ---
export const keywordsList = [
  { id: 1, keyword: '涂抹面膜', searchVolume: 52000, competition: 0.82, potential: 65, category: '功能', source: '下拉词' },
  { id: 2, keyword: '涂抹面膜补水保湿', searchVolume: 18000, competition: 0.68, potential: 78, category: '功能', source: '下拉词' },
  { id: 3, keyword: '涂抹面膜美白', searchVolume: 12000, competition: 0.55, potential: 82, category: '功能', source: '相关搜索' },
  { id: 4, keyword: '免洗睡眠面膜', searchVolume: 9500, competition: 0.45, potential: 88, category: '场景', source: '下拉词' },
  { id: 5, keyword: '敏感肌面膜', searchVolume: 15000, competition: 0.72, potential: 74, category: '人群', source: '相关搜索' },
  { id: 6, keyword: '涂抹面膜推荐', searchVolume: 8000, competition: 0.38, potential: 90, category: '功能', source: '下拉词' },
  { id: 7, keyword: '夜间修护面膜', searchVolume: 6200, competition: 0.32, potential: 92, category: '场景', source: '生意参谋' },
  { id: 8, keyword: '珀莱雅涂抹面膜', searchVolume: 22000, competition: 0.91, potential: 42, category: '品牌', source: '下拉词' },
  { id: 9, keyword: '涂抹面膜学生党', searchVolume: 4800, competition: 0.28, potential: 86, category: '人群', source: '相关搜索' },
  { id: 10, keyword: '涂抹面膜去黄提亮', searchVolume: 7500, competition: 0.41, potential: 89, category: '功能', source: '下拉词' },
  { id: 11, keyword: '面膜泥膜', searchVolume: 11000, competition: 0.65, potential: 70, category: '功能', source: '生意参谋' },
  { id: 12, keyword: '旅行便携面膜', searchVolume: 3200, competition: 0.22, potential: 94, category: '场景', source: '相关搜索' },
]

export const keywordCategoryStats = [
  { category: '功能需求', count: 156, percent: 45 },
  { category: '场景需求', count: 87, percent: 25 },
  { category: '人群需求', count: 63, percent: 18 },
  { category: '品牌需求', count: 42, percent: 12 },
]

// --- 竞品 ---
export const competitorsList = [
  { id: 1, name: '珀莱雅双抗面膜', price: 129, reviewCount: 28400, rating: 4.8, image: '', store: '珀莱雅官方旗舰店' },
  { id: 2, name: '自然堂烟酰胺面膜', price: 89, reviewCount: 15600, rating: 4.7, image: '', store: '自然堂官方旗舰店' },
  { id: 3, name: '薇诺娜舒敏面膜', price: 168, reviewCount: 9200, rating: 4.9, image: '', store: '薇诺娜官方旗舰店' },
  { id: 4, name: '润百颜玻尿酸面膜', price: 119, reviewCount: 12800, rating: 4.6, image: '', store: '润百颜官方旗舰店' },
  { id: 5, name: 'HBN视黄醇面膜', price: 139, reviewCount: 7800, rating: 4.7, image: '', store: 'HBN官方旗舰店' },
  { id: 6, name: '谷雨光感面膜', price: 99, reviewCount: 18200, rating: 4.5, image: '', store: '谷雨官方旗舰店' },
]

export const sentimentData = { positive: 80.8, neutral: 16.9, negative: 2.3 }

export const reviewTrend = [
  { month: '2025/1', count: 1420 },
  { month: '2025/2', count: 1580 },
  { month: '2025/3', count: 1750 },
  { month: '2025/4', count: 1890 },
  { month: '2025/5', count: 2050 },
  { month: '2025/6', count: 2180 },
]

export const userNeedsTop10 = [
  { need: '补水效果', percent: 8.83, count: 257, color: '#3b82f6' },
  { need: '质地肤感', percent: 5.09, count: 148, color: '#6366f1' },
  { need: '美白提亮', percent: 4.21, count: 122, color: '#8b5cf6' },
  { need: '温和不刺激', percent: 3.56, count: 103, color: '#a855f7' },
  { need: '使用效果', percent: 2.44, count: 71, color: '#ec4899' },
  { need: '性价比', percent: 2.13, count: 62, color: '#f43f5e' },
  { need: '售后服务', percent: 2.13, count: 62, color: '#f97316' },
  { need: '气味体验', percent: 1.62, count: 47, color: '#eab308' },
  { need: '包装设计', percent: 1.44, count: 42, color: '#22c55e' },
  { need: '复购意愿', percent: 1.27, count: 37, color: '#14b8a6' },
]

export const dimensionInterpretation = [
  { dimension: '补水效果', count: 257, percent: '8.83%', interpretation: '用户最关心面膜的补水保湿能力，"补水效果好""持久水润"是高频正面评价，但也有用户反映保湿时间不够长' },
  { dimension: '质地肤感', count: 148, percent: '5.09%', interpretation: '用户对涂抹质地要求高，偏好"细腻好推开"的奶油质地，差评集中在"太稠不好涂""有颗粒感"' },
  { dimension: '美白提亮', count: 122, percent: '4.21%', interpretation: '美白是核心诉求之一，但多数用户认为"短期效果不明显"，需要长期使用才能看到变化' },
  { dimension: '温和不刺激', count: 103, percent: '3.56%', interpretation: '敏感肌用户高度关注刺激性，好评提到"完全不刺激"，差评提到"用了有刺痛感""泛红"' },
  { dimension: '使用效果', count: 71, percent: '2.44%', interpretation: '综合使用满意度，包括皮肤滑嫩度、光泽度、毛孔改善等多维度效果反馈' },
  { dimension: '性价比', count: 62, percent: '2.13%', interpretation: '用户普遍关注价格与效果的匹配度，"性价比高""值回票价"是正面关键词' },
]

export const reviewKeywords = [
  { word: '补水效果好', count: 2340, sentiment: 'positive' },
  { word: '质地细腻', count: 1890, sentiment: 'positive' },
  { word: '味道好闻', count: 1560, sentiment: 'positive' },
  { word: '容易清洗', count: 1230, sentiment: 'positive' },
  { word: '有点刺激', count: 890, sentiment: 'negative' },
  { word: '效果不明显', count: 760, sentiment: 'negative' },
  { word: '包装简陋', count: 540, sentiment: 'negative' },
  { word: '价格偏高', count: 480, sentiment: 'negative' },
  { word: '吸收快', count: 1100, sentiment: 'positive' },
  { word: '持久保湿', count: 950, sentiment: 'positive' },
]

export const painPoints = [
  { id: 1, text: '使用后皮肤有刺痛感，敏感肌用户反馈泛红', frequency: 890, intensity: 0.85 },
  { id: 2, text: '美白效果不明显，用了很久没变化', frequency: 760, intensity: 0.72 },
  { id: 3, text: '涂抹不方便，质地太稠不好推开', frequency: 650, intensity: 0.65 },
  { id: 4, text: '清洗困难，残留多需要反复冲洗', frequency: 580, intensity: 0.78 },
  { id: 5, text: '味道太香，感觉添加了香精', frequency: 520, intensity: 0.60 },
]

export const positivePoints = [
  { id: 1, text: '补水效果立竿见影，敷完皮肤水当当', frequency: 2340 },
  { id: 2, text: '质地细腻好推开，奶油般丝滑触感', frequency: 1890 },
  { id: 3, text: '味道清新自然，使用体验舒适', frequency: 1560 },
  { id: 4, text: '用后皮肤滑嫩，触感明显改善', frequency: 1230 },
  { id: 5, text: '性价比高，效果对得起价格', frequency: 980 },
]

export const userNeedsSummary = [
  {
    rank: 1, title: '补水效果', percent: '8.83%',
    desc: '用户最关心面膜的补水保湿能力。高频评价"补水效果好""持久水润"表明产品在此维度表现优秀，但也有部分用户反映保湿时间不够持久，建议产品强调72小时长效保湿卖点。',
    quote: '"补水效果真的好，第二天起来脸还是润润的，比贴片面膜方便多了！"',
  },
  {
    rank: 2, title: '质地与肤感', percent: '5.09%',
    desc: '用户对涂抹质地要求很高，偏好细腻、好推开、不黏腻的奶油质地。差评集中在"太稠""有颗粒感""涂不匀"，需要在产品描述中突出质地特点。',
    quote: '"质地超级细腻，像奶油一样好推开，敷在脸上凉凉的很舒服。"',
  },
  {
    rank: 3, title: '美白提亮效果', percent: '4.21%',
    desc: '美白是核心购买动机之一，但多数用户反映短期效果不明显。建议在详情页增加使用周期说明（如"坚持使用28天可见提亮"），配合before/after对比图。',
    quote: '"用了两周感觉肤色确实亮了一点，但没有宣传的那么夸张。"',
  },
  {
    rank: 4, title: '温和不刺激', percent: '3.56%',
    desc: '敏感肌用户高度关注产品刺激性。好评提到"完全不刺激"，差评提到"用了有刺痛感""泛红"。建议突出敏感肌测试报告和无添加认证。',
    quote: '"我是敏感肌，用了完全没有刺激感，终于找到一款放心用的涂抹面膜了！"',
  },
  {
    rank: 5, title: '性价比与经济性', percent: '2.13%',
    desc: '用户普遍关注价格与效果的匹配度，"性价比高""值回票价"是正面高频词。建议增加大容量装和复购优惠策略。',
    quote: '"这个价位能买到这个效果真的很值，比专柜便宜多了。"',
  },
  {
    rank: 6, title: '服务与售后支持', percent: '2.13%',
    desc: '涉及客服响应速度、退换货流程、物流速度等。好评提到"客服态度好""发货快"，建议持续优化售后体验。',
    quote: '"客服很耐心，问了很多问题都一一解答了，发货也超快。"',
  },
  {
    rank: 7, title: '复购与推荐意愿', percent: '1.27%',
    desc: '用户表示"会再买""推荐给朋友"的比例较高，说明产品满意度良好。可考虑建立会员复购体系和分享奖励机制。',
    quote: '"已经回购第三瓶了，还推荐给了闺蜜，她也很喜欢！"',
  },
]

export const reviewDetails = [
  { id: 1, content: '补水效果超好，质地很细腻很好推开，敷20分钟洗掉皮肤滑滑的。就是美白效果短期看不出来，要坚持用才行。', sku: '100g 水润保湿款', needs: '补水保湿、美白提亮', persona: '女性 25-35岁', scene: '日常护肤', sentiment: '正面' },
  { id: 2, content: '用了一周来评价，保湿效果确实持久，第二天起来脸还是润的。但是味道有点太香了，感觉加了香精。敏感肌用了没有不适。', sku: '100g 水润保湿款', needs: '持久保湿、温和不刺激', persona: '女性 20-30岁', scene: '夜间护理', sentiment: '正面' },
  { id: 3, content: '质地有点太稠了，不太好推开，需要配合硅胶刷。清洗也有点麻烦，要反复冲水才能洗干净。补水效果还行吧。', sku: '150g 大容量装', needs: '使用便捷、易清洗', persona: '男性 25-35岁', scene: '日常护肤', sentiment: '负面' },
  { id: 4, content: '性价比很高的一款涂抹面膜，比XX牌好用太多了。质地像奶油，上脸很服帖，敷完不用洗直接睡觉也可以。会回购！', sku: '100g 水润保湿款', needs: '性价比、使用效果', persona: '女性 30-40岁', scene: '睡眠面膜', sentiment: '正面' },
  { id: 5, content: '敏感肌慎入！用了之后脸上有点刺痛，第二天还泛红了。可能是我皮肤太敏感了吧，给闺蜜用了她说挺好的。', sku: '50g 旅行便携装', needs: '温和不刺激', persona: '女性 20-25岁', scene: '日常护肤', sentiment: '负面' },
  { id: 6, content: '第三次回购了！这款面膜真的是我的救星，秋冬换季再也不怕干燥起皮了。质地细腻好涂，保湿时间也很长，推荐！', sku: '100g 水润保湿款', needs: '持久保湿、复购推荐', persona: '女性 25-35岁', scene: '换季护肤', sentiment: '正面' },
]

export const optimizationSuggestions = [
  '强化"无刺激"配方卖点，在详情页突出敏感肌测试报告和皮肤刺激性检测认证，降低敏感肌用户购买顾虑',
  '增加涂抹工具（硅胶面膜刷）作为赠品，解决"涂抹不方便、不好推开"的用户痛点，提升使用体验',
  '优化产品质地配方，强调"易清洗、无残留"的使用体验，在详情页展示清洗便捷性的对比实验',
  '添加before/after对比图（使用7天/14天/28天），直观展示美白提亮效果，管理用户对效果的时间预期',
  '推出大容量装(200g) + 复购折扣策略，满足高复购意愿用户需求，建立会员积分体系',
  '优化产品香型，推出"无香型"SKU，满足对气味敏感的用户群体',
]

// --- 主图生成 ---
export const imageBriefDefault = {
  composition: '产品居中45°俯拍，背景渐变浅蓝到白',
  colorScheme: '主色调浅蓝+白色，点缀金色高光',
  copyText: '涂抹面膜 补水保湿 72小时持久水润',
  sellingPoints: ['72小时持久保湿', '敏感肌适用', '免洗配方', '专利成分'],
}

export const generatedImages = [
  { id: 1, version: 'V1-A', status: 'approved', score: 4.5, notes: '构图清晰，文案位置合理' },
  { id: 2, version: 'V1-B', status: 'draft', score: 3.8, notes: '' },
  { id: 3, version: 'V1-C', status: 'draft', score: 4.0, notes: '' },
  { id: 4, version: 'V2-A', status: 'pending_review', score: 4.2, notes: '优化了配色方案' },
  { id: 5, version: 'V2-B', status: 'draft', score: 3.5, notes: '' },
  { id: 6, version: 'V2-C', status: 'published', score: 4.8, notes: '最终选用版本' },
]

// --- 详情页 ---
export const detailPageBlocks = [
  { id: 'b1', type: '冲击区', title: '开场冲击', content: '72小时持久水润，告别干燥肌', order: 1 },
  { id: 'b2', type: '展示区', title: '产品展示', content: '产品实拍 + 质地展示 + 成分亮点', order: 2 },
  { id: 'b3', type: '功效区', title: '功效证明', content: '实验室数据 + 用户对比图 + 权威认证', order: 3 },
  { id: 'b4', type: '口碑区', title: '用户口碑', content: '真实用户评价 + KOL推荐 + 销量数据', order: 4 },
  { id: 'b5', type: '引导区', title: '购买引导', content: '限时优惠 + 赠品信息 + 售后保障', order: 5 },
]

// --- 买家秀 ---
export const buyerShowTemplates = [
  { id: 't1', name: '使用体验型', desc: '真实分享使用感受，强调肤感和效果', icon: '✨' },
  { id: 't2', name: '效果展示型', desc: '对比使用前后变化，用数据和图片说话', icon: '📊' },
  { id: 't3', name: '对比评测型', desc: '与其他产品横向对比，突出优势', icon: '⚖️' },
]

export const generatedBuyerShows = [
  {
    id: 1,
    template: '使用体验型',
    content: '用了一周来评价，质地很细腻很好推开，敷在脸上凉凉的很舒服。我是敏感肌，用了完全没有刺激感，第二天起来皮肤滑滑的，补水效果真的很持久！',
    toneScore: 4.6,
    imageTip: '手持产品自拍 + 涂抹过程特写 + 使用前后皮肤对比',
    status: 'approved',
  },
  {
    id: 2,
    template: '效果展示型',
    content: '坚持用了两周，额头和脸颊的干燥起皮完全消失了！附上对比图，右边是使用后的皮肤状态，毛孔也细腻了很多。',
    toneScore: 4.3,
    imageTip: '面部特写对比图 + 日历打卡记录 + 产品空瓶展示',
    status: 'pending_review',
  },
  {
    id: 3,
    template: '对比评测型',
    content: '之前用过XX牌和YY牌，这款是我用过最满意的。质地比XX细腻很多，保湿时间也比YY长。关键是不刺激，敏感肌终于找到真爱了！',
    toneScore: 4.1,
    imageTip: '三款产品并排对比 + 质地涂抹对比 + 价格对比表格截图',
    status: 'draft',
  },
]

// --- 短视频 ---
export const videoTypes = [
  { id: 'showcase', label: '产品展示', icon: '🎁' },
  { id: 'tutorial', label: '使用教程', icon: '📖' },
  { id: 'lifestyle', label: '生活场景', icon: '🏡' },
  { id: 'kol', label: 'KOL推荐', icon: '🌟' },
  { id: 'compare', label: '对比评测', icon: '⚖️' },
]

export const videoStoryboard = [
  { id: 1, scene: '开场', description: '产品特写，镜头从模糊到清晰，文字浮现产品名', narration: '你的肌肤，值得更好的呵护', duration: 3 },
  { id: 2, scene: '痛点展示', description: '分屏展示干燥起皮的皮肤问题', narration: '换季干燥、熬夜暗沉，这些肌肤问题困扰着你吗？', duration: 5 },
  { id: 3, scene: '产品介绍', description: '产品旋转展示，质地挤出特写', narration: '全新水润涂抹面膜，72小时持久保湿', duration: 5 },
  { id: 4, scene: '使用演示', description: '模特涂抹面膜过程，展示质地和使用方法', narration: '细腻质地，轻松涂抹，敏感肌也能放心用', duration: 8 },
  { id: 5, scene: '效果展示', description: '使用前后皮肤状态对比', narration: '肉眼可见的水润变化，肌肤重新焕发光彩', duration: 5 },
  { id: 6, scene: '结尾', description: '产品+品牌logo，优惠信息', narration: '现在下单享限时优惠，给肌肤最好的礼物', duration: 4 },
]

export const videoGenerationSteps = [
  { step: '脚本生成', status: 'complete' },
  { step: '分镜渲染', status: 'complete' },
  { step: '视频合成', status: 'in_progress' },
  { step: '配音合成', status: 'pending' },
  { step: '最终输出', status: 'pending' },
]

// --- 社媒营销 ---
export const socialPlatforms = [
  { id: 'xiaohongshu', label: '小红书', icon: '📕' },
  { id: 'douyin', label: '抖音', icon: '🎵' },
  { id: 'wechat', label: '朋友圈', icon: '💬' },
]

export const generatedSocialContent = {
  xiaohongshu: {
    title: '敏感肌姐妹看过来！这款涂抹面膜我真的爱了',
    body: `作为一个资深敏感肌，对面膜真的又爱又怕 😭\n直到遇到这款涂抹面膜，真的打开了新世界的大门！\n\n✨ 质地：超级细腻的奶油质地，上脸冰冰凉凉\n💧 保湿：72小时不是吹的，第二天起来还是水当当\n🌿 温和：完全不刺激，敏感肌放心冲！\n\n已经回购第三瓶了，强烈推荐给和我一样的敏感肌姐妹 💕`,
    tags: ['涂抹面膜', '敏感肌护肤', '补水面膜推荐', '护肤好物分享'],
    imageTip: '产品平铺图 + 质地特写 + 使用过程 + 前后对比',
  },
  douyin: {
    title: '敏感肌也能放心用的涂抹面膜！',
    script: '开场：展示干燥皮肤问题 → 产品介绍 → 涂抹演示 → 效果对比 → 优惠信息',
    tags: ['涂抹面膜', '敏感肌', '护肤', '补水保湿'],
  },
  wechat: {
    copy: '最近入手的涂抹面膜真的绝了！敏感肌用了完全不刺激，保湿效果超持久。每天早上起来皮肤都是水当当的，素颜出门都自信了哈哈～有同样困扰的朋友真的可以试试 👍',
    imageTip: '手持产品自拍 + 使用前后对比',
  },
}

export const calendarEvents = [
  { date: '2026-07-01', platform: 'xiaohongshu', title: '产品种草笔记', status: 'scheduled' },
  { date: '2026-07-02', platform: 'douyin', title: '使用教程短视频', status: 'scheduled' },
  { date: '2026-07-03', platform: 'wechat', title: '朋友圈文案', status: 'scheduled' },
  { date: '2026-07-05', platform: 'xiaohongshu', title: '用户测评合集', status: 'draft' },
  { date: '2026-07-07', platform: 'douyin', title: 'KOL合作视频', status: 'draft' },
  { date: '2026-06-28', platform: 'xiaohongshu', title: '618返场优惠', status: 'published' },
  { date: '2026-06-25', platform: 'douyin', title: '新品首发视频', status: 'published' },
]

// --- 数据监控 ---
export const analyticsKPI = [
  { label: '总曝光量', value: '128,456', change: 12.5, icon: '👁️', color: 'primary' },
  { label: '点击率', value: '5.8%', change: 3.2, icon: '👆', color: 'green' },
  { label: '转化率', value: '3.2%', change: -1.5, icon: '🛒', color: 'orange' },
  { label: '好评率', value: '96.5%', change: 0.8, icon: '⭐', color: 'purple' },
]

export const analyticsTrend = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(2026, 5, i + 1)
  return {
    date: `${d.getMonth() + 1}/${d.getDate()}`,
    impressions: Math.floor(3000 + Math.random() * 2000 + i * 80),
    ctr: +(4 + Math.random() * 3 + i * 0.05).toFixed(1),
    conversionRate: +(2.5 + Math.random() * 1.5 + i * 0.03).toFixed(1),
    positiveRate: +(94 + Math.random() * 4).toFixed(1),
  }
})

export const contentABTest = [
  { id: 1, name: '主图 V1 (蓝色系)', type: '主图', ctr: 4.2, cvr: 2.8, status: '对照组' },
  { id: 2, name: '主图 V2 (渐变蓝白)', type: '主图', ctr: 5.8, cvr: 3.5, status: '实验组 - 胜出' },
  { id: 3, name: '详情页 A (5屏)', type: '详情页', ctr: 0, cvr: 2.9, status: '对照组' },
  { id: 4, name: '详情页 B (7屏+视频)', type: '详情页', ctr: 0, cvr: 3.8, status: '实验组 - 胜出' },
]

export const alerts = [
  { id: 1, type: 'warning', time: '2026-06-28 14:30', title: '好评率下降', desc: '近7天好评率从97.2%降至95.8%，建议关注最新差评内容', action: '查看评价' },
  { id: 2, type: 'danger', time: '2026-06-27 09:15', title: '转化率异常', desc: '今日转化率较7日均值下降32%，可能原因：竞品促销活动影响', action: '分析原因' },
  { id: 3, type: 'info', time: '2026-06-26 16:00', title: '流量高峰', desc: '搜索"涂抹面膜"流量突增45%，建议检查广告出价', action: '查看详情' },
]
