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
  { id: 1, version: 'V1-A', status: 'approved', score: 4.5, notes: '构图清晰，文案位置合理', image_url: 'https://picsum.photos/seed/img1a/1024/1024', thumbnail_url: 'https://picsum.photos/seed/img1a/300/300', prompt: '电商主图-产品居中-蓝白渐变' },
  { id: 2, version: 'V1-B', status: 'draft', score: 3.8, notes: '', image_url: 'https://picsum.photos/seed/img1b/1024/1024', thumbnail_url: 'https://picsum.photos/seed/img1b/300/300', prompt: '电商主图-左图右文-白色简约' },
  { id: 3, version: 'V1-C', status: 'draft', score: 4.0, notes: '', image_url: 'https://picsum.photos/seed/img1c/1024/1024', thumbnail_url: 'https://picsum.photos/seed/img1c/300/300', prompt: '电商主图-场景图-自然风' },
  { id: 4, version: 'V2-A', status: 'pending_review', score: 4.2, notes: '优化了配色方案', image_url: 'https://picsum.photos/seed/img2a/1024/1024', thumbnail_url: 'https://picsum.photos/seed/img2a/300/300', prompt: '电商主图-产品居中-绿白清新' },
  { id: 5, version: 'V2-B', status: 'draft', score: 3.5, notes: '', image_url: 'https://picsum.photos/seed/img2b/1024/1024', thumbnail_url: 'https://picsum.photos/seed/img2b/300/300', prompt: '电商主图-成分展示-科技感' },
  { id: 6, version: 'V2-C', status: 'published', score: 4.8, notes: '最终选用版本', image_url: 'https://picsum.photos/seed/img2c/1024/1024', thumbnail_url: 'https://picsum.photos/seed/img2c/300/300', prompt: '电商主图-产品居中-粉白温柔' },
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

// --- 真实评价分析数据（家具贴膜店铺100条）---
export const realAnalysisFallback = {
  total_reviews: 100,
  effective_reviews: 52,
  with_images: 30,
  with_followup: 1,
  sentiment: { positive: 62.0, neutral: 25.0, negative: 13.0 },
  sentiment_counts: { positive: 62, neutral: 25, negative: 13 },
  review_trend: [
    { month: '2026/4', count: 43 },
    { month: '2026/5', count: 42 },
    { month: '2026/6', count: 15 },
  ],
  needs_top10: [
    { need: '贴膜效果', percent: 44.23, count: 23, color: '#3b82f6' },
    { need: '操作便捷', percent: 36.54, count: 19, color: '#6366f1' },
    { need: '产品质量', percent: 30.77, count: 16, color: '#8b5cf6' },
    { need: '客服服务', percent: 26.92, count: 14, color: '#a855f7' },
    { need: '气泡问题', percent: 17.31, count: 9, color: '#ec4899' },
    { need: '保护性能', percent: 13.46, count: 7, color: '#f43f5e' },
    { need: '工具配件', percent: 11.54, count: 6, color: '#f97316' },
    { need: '物流包装', percent: 9.62, count: 5, color: '#eab308' },
    { need: '性价比', percent: 7.69, count: 4, color: '#22c55e' },
    { need: '撕除体验', percent: 5.77, count: 3, color: '#14b8a6' },
  ],
  dimensions: [
    { dimension: '贴膜效果', count: 23, percent: '44.23%', interpretation: '用户最关注贴膜后的效果表现，好评典型："贴上去效果真的非常好""完全看不出来贴了膜"，差评典型："全部都是气泡""贴了两个小时全白贴了"' },
    { dimension: '操作便捷', count: 19, percent: '36.54%', interpretation: '操作难度是用户核心关注点，好评提到"操作简单""一贴就上手"，差评提到"教程不清""费劲八力贴了两小时全白贴"，保护膜撕除步骤是主要槽点' },
    { dimension: '产品质量', count: 16, percent: '30.77%', interpretation: '产品质量整体好评，"厚实""牢固""质量好"是高频正面词，个别差评反映"与描述不相符"' },
    { dimension: '客服服务', count: 14, percent: '26.92%', interpretation: '客服服务两极分化严重，好评提到"客服态度好""耐心指导"，差评集中在"晚上没有售后""推卸责任""打发人"' },
    { dimension: '气泡问题', count: 9, percent: '17.31%', interpretation: '气泡是差评的核心痛点，"第2天全是泡""全部都是气泡"，主要与喷水量控制和按压手法有关' },
    { dimension: '保护性能', count: 7, percent: '13.46%', interpretation: '用户关注防刮、隔热、耐高温等保护性能，好评提到"不用担心刮花了""隔热效果好"' },
  ],
  pain_points: [
    { id: 1, text: '气泡/起泡问题', frequency: 5, intensity: 0.92, typical_review: '第2天全是泡，全部都是气泡，别买快跑' },
    { id: 2, text: '客服服务差', frequency: 4, intensity: 0.88, typical_review: '客服说晚上没有售后，问了很多遍就是一句售后不上班打发人' },
    { id: 3, text: '操作困难/教程不清', frequency: 3, intensity: 0.78, typical_review: '全程没有任何一个步骤是说膜的上面有一层保护膜要撕下来的，费劲八力贴了两小时全白贴了' },
    { id: 4, text: '缺少工具配件', frequency: 2, intensity: 0.65, typical_review: '说的送工具，到货就一个膜，根本没工具' },
    { id: 5, text: '实物与描述不符', frequency: 2, intensity: 0.60, typical_review: '差得很，实物与描述不相符，大家不要上当' },
    { id: 6, text: '撕除伤桌面', frequency: 1, intensity: 0.95, typical_review: '揭下来把我的大桌面揭的全是伤痕' },
    { id: 7, text: '包装运输损坏', frequency: 1, intensity: 0.50, typical_review: '物流时外包装损坏，导致薄膜有损，中间部分皱' },
  ],
  positive_points: [
    { id: 1, text: '操作简单方便', frequency: 14 },
    { id: 2, text: '贴膜效果好', frequency: 13 },
    { id: 3, text: '质量厚实', frequency: 10 },
    { id: 4, text: '客服服务好', frequency: 7 },
    { id: 5, text: '工具齐全', frequency: 5 },
    { id: 6, text: '教程清晰', frequency: 5 },
    { id: 7, text: '保护效果好', frequency: 4 },
  ],
  keywords: [
    { word: '效果好', count: 12, sentiment: 'positive' },
    { word: '操作简单', count: 10, sentiment: 'positive' },
    { word: '质量很好', count: 9, sentiment: 'positive' },
    { word: '方便', count: 7, sentiment: 'positive' },
    { word: '牢固', count: 5, sentiment: 'positive' },
    { word: '好看', count: 5, sentiment: 'positive' },
    { word: '工具齐全', count: 4, sentiment: 'positive' },
    { word: '客服态度好', count: 4, sentiment: 'positive' },
    { word: '不起泡', count: 3, sentiment: 'positive' },
    { word: '透明', count: 3, sentiment: 'positive' },
    { word: '气泡', count: 8, sentiment: 'negative' },
    { word: '客服差', count: 5, sentiment: 'negative' },
    { word: '推卸责任', count: 3, sentiment: 'negative' },
    { word: '起泡', count: 3, sentiment: 'negative' },
    { word: '难贴', count: 2, sentiment: 'negative' },
    { word: '描述不符', count: 2, sentiment: 'negative' },
    { word: '没工具', count: 2, sentiment: 'negative' },
    { word: '伤桌面', count: 1, sentiment: 'negative' },
  ],
  needs_summary: [
    { rank: 1, title: '贴膜效果', percent: '44.23%', desc: '用户最关心贴膜后的视觉效果和保护性能。好评提到"完全看不出来贴了膜""特别亮"，差评集中在气泡和褶皱问题。建议在教程中增加"避免气泡"的技巧说明。', quote: '"贴上去效果真的非常好，完全看不出来贴了膜"' },
    { rank: 2, title: '操作便捷性', percent: '36.54%', desc: '操作难度直接影响用户体验。好评用户觉得"一贴就上手"，但差评用户反映教程缺失关键步骤（如保护膜撕除），建议重新制作教程视频并用红色标注关键步骤。', quote: '"操作简单，贴完效果很好。有详细的操作视频"' },
    { rank: 3, title: '产品质量', percent: '30.77%', desc: '整体质量好评率高，"厚实""牢固"是高频正面词。建议在详情页突出厚度参数和耐用性测试数据。', quote: '"质量很好，也很贴合，贴出来的效果很完美"' },
    { rank: 4, title: '客服服务', percent: '26.92%', desc: '客服评价两极分化严重。好评提到"耐心指导""态度好"，差评集中在"晚上无售后""推卸责任"。建议延长客服在线时间，建立标准化售后流程。', quote: '"客服也很棒，耐心的指导我怎么贴"' },
    { rank: 5, title: '气泡问题', percent: '17.31%', desc: '气泡是差评的核心原因，主要与喷水量控制有关。建议在教程中明确喷水量标准，附带喷壶刻度标记，并说明“第二天起泡”的常见原因和补救方法。', quote: '"拍完之后贴的时候没有气泡，非常平整。第2天全是泡"' },
  ],
  optimization_suggestions: [
    '优化贴膜教程，增加"喷水量控制"详细说明，建议附带喷壶刻度标记，降低用户因水量不当导致起泡的概率',
    '延长客服在线服务时间，增加晚间值班人员；建立标准化的售后处理流程，避免推诿现象',
    '重新制作贴膜教程视频，增加"保护膜撕除"步骤的醒目提示，建议用红色箭头标注',
    '加强发货前的工具配件检查流程，建议在包装内增加配件清单卡，确保每单工具齐全',
    '检查并更新商品详情页描述，确保实物效果与宣传图片一致，避免过度美化',
    '在产品页面增加"安全撕除指南"，说明正确的加热撕膜方法，降低损伤桌面风险',
  ],
  sku_analysis: [
    { product: '哑光实木桌专用', total: 28, positive_rate: 60.7, negative_rate: 10.7 },
    { product: '亮光岩板桌专用', total: 26, positive_rate: 65.4, negative_rate: 11.5 },
    { product: '哑光岩板桌专用', total: 16, positive_rate: 62.5, negative_rate: 6.3 },
    { product: '自动修复水凝膜', total: 12, positive_rate: 75.0, negative_rate: 0.0 },
    { product: '亮光实木桌专用', total: 11, positive_rate: 72.7, negative_rate: 0.0 },
    { product: '含一对一指导款', total: 2, positive_rate: 100.0, negative_rate: 0.0 },
  ],
  review_details: [
    { id: 1, content: '收到货发现没给工具，跟店家说后立马给我发过来一套工具，客服态度很好！按着说明膜贴起来也很顺滑。还是没贴平整，有点起泡，不影响使用。', sku: '哑光实木桌专用', product_type: '哑光实木桌专用', needs: '客服服务、操作便捷、气泡问题', date: '2026-06-05', has_image: true, sentiment: '正面' },
    { id: 7, content: '质量可以，桌子比较好打扫。我是贴在出租房里的，如果是高档家具建议买好的。买的时候建议稍微买大一点，可以把边包住。', sku: '哑光实木桌专用', product_type: '哑光实木桌专用', needs: '产品质量', date: '2026-06-01', has_image: false, sentiment: '正面' },
    { id: 10, content: '简单，一贴就上手了。完全看不出来贴了膜', sku: '亮光岩板桌专用', product_type: '亮光岩板桌专用', needs: '操作便捷、贴膜效果', date: '2026-05-25', has_image: true, sentiment: '正面' },
    { id: 25, content: '差差差，非常生气！第2天全是泡。揭下来把我的大桌面揭的全是伤痕。问客服客服说我喷的水喷多了。各种推卸责任。', sku: '哑光实木桌专用', product_type: '哑光实木桌专用', needs: '气泡问题、客服服务、撕除体验', date: '2026-05-29', has_image: true, sentiment: '负面' },
    { id: 26, content: '真是服了，全程没有任何一个步骤是说膜的上面有一层保护膜要撕下来的，费劲八力贴了两个小时，结果全白贴了。客服说晚上没有售后。', sku: '哑光岩板桌专用', product_type: '哑光岩板桌专用', needs: '操作便捷、客服服务', date: '2026-05-25', has_image: false, sentiment: '负面' },
    { id: 30, content: '全部都是气泡，别买，快跑，搞了一早上，浪费时间、体力和金钱，卖家只会让你多放点水，用重物压，一点都不贴不住', sku: '哑光实木桌专用', product_type: '哑光实木桌专用', needs: '气泡问题、操作便捷', date: '2026-05-10', has_image: false, sentiment: '负面' },
    { id: 39, content: '这家的膜非常好，我家所有的膜都是从他家买的，质量没得说，贴上去效果真的非常好。并且送的工具也很齐全，操作非常简单。贴好了一点也没有起泡。', sku: '亮光岩板桌专用', product_type: '亮光岩板桌专用', needs: '贴膜效果、工具齐全、操作便捷', date: '2026-04-06', has_image: true, sentiment: '正面' },
    { id: 40, content: '施工完毕，效果真的牛，按照教程来贴的，看了两遍来贴的，没有任何气泡褶皱，太完美了', sku: '自动修复水凝膜', product_type: '自动修复水凝膜', needs: '贴膜效果、操作便捷', date: '2026-04-06', has_image: true, sentiment: '正面' },
    { id: 44, content: '买的哑光的非常自然就跟没贴是一样的，看着很舒服，而且这个表面不是那种磨砂的，擦起来都很光滑。', sku: '哑光实木桌专用', product_type: '哑光实木桌专用', needs: '贴膜效果、保护性能', date: '2026-04-06', has_image: true, sentiment: '正面' },
    { id: 33, content: '说的送工具，到货就一个膜，根本没工具', sku: '亮光岩板桌专用', product_type: '亮光岩板桌专用', needs: '工具配件', date: '2026-05-29', has_image: false, sentiment: '负面' },
  ],
  word_cloud: [
    { word: '效果好', count: 12 }, { word: '操作简单', count: 10 }, { word: '质量很好', count: 9 },
    { word: '方便', count: 7 }, { word: '牢固', count: 5 }, { word: '好看', count: 5 },
    { word: '工具齐全', count: 4 }, { word: '客服好', count: 4 }, { word: '气泡', count: 8 },
    { word: '不起泡', count: 3 }, { word: '透明', count: 3 }, { word: '贴合', count: 3 },
    { word: '厚实', count: 3 }, { word: '推卸', count: 3 }, { word: '教程', count: 3 },
    { word: '保护', count: 3 }, { word: '包装', count: 2 }, { word: '发货快', count: 2 },
  ],
  data_source: '内置真实评价数据（家具贴膜店铺100条）',
  analysis_date: '2026-06-14T00:00:00',
}
