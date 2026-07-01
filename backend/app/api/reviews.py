"""评价数据分析 API - 支持上传Excel/CSV并进行真实NLP分析"""
import io
import csv
import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, UploadFile, File, HTTPException, Body
from pydantic import BaseModel

from app.services.review_analyzer import review_analyzer

router = APIRouter(prefix="/reviews", tags=["reviews"])

# 存储上传的评价数据集
_datasets: dict[str, dict] = {}


# ============================================================
# 内置真实评价数据（家具贴膜店铺 - 100条评价）
# ============================================================
_BUILTIN_REVIEWS = [
    {"id": 1, "content": "收到货发现没给工具，跟店家说后立马给我发过来一套工具，客服态度很好！按着说明膜贴起来也很顺滑，贴的木头的桌面，摸起来舒服。还是没贴平整，有点起泡，不影响使用。", "sku": "90x150cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-06-05", "images": True, "followup": ""},
    {"id": 2, "content": "效果还可以，就是不知道耐用不耐用", "sku": "60x200cm；自动修复水凝膜（高端家具专用款）", "date": "2026-05-24", "images": True, "followup": ""},
    {"id": 3, "content": "贴上去很牢固，贴出来的效果也很好，膜的质量很好", "sku": "70x200cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-04-04", "images": True, "followup": ""},
    {"id": 4, "content": "客服也很棒，耐心的指导我怎么贴，贴完真的很棒", "sku": "1x0cm；哑光岩板桌专用（耐高温不渗色）", "date": "2026-04-04", "images": True, "followup": ""},
    {"id": 5, "content": "膜的质量很好，贴起来很方便。不错~", "sku": "70x150cm；哑光岩板桌专用（耐高温不渗色）", "date": "2026-04-04", "images": True, "followup": ""},
    {"id": 6, "content": "质量很好，也很贴合，贴出来的效果很完美", "sku": "70x300cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-04-04", "images": True, "followup": ""},
    {"id": 7, "content": "质量可以，桌子比较好打扫。我是贴在出租房里的，如果是高档家具建议买好的。买的时候建议稍微买大一点，可以把边包住。", "sku": "60x200cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-06-01", "images": False, "followup": ""},
    {"id": 8, "content": "商品质量很好，物流时外包装损坏，导致薄膜有损，中间部分皱。凑合用吧。", "sku": "120x100cm；亮光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-19", "images": False, "followup": ""},
    {"id": 9, "content": "货收到了质量不错服务态度好好评", "sku": "60x100cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-05-27", "images": False, "followup": ""},
    {"id": 10, "content": "简单，一贴就上手了。完全看不出来贴了膜", "sku": "100x200cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-05-25", "images": True, "followup": ""},
    {"id": 11, "content": "操作方便，比想象的简单。异型的也贴的挺好，粘得挺牢，没起泡。", "sku": "50x100cm；自动修复水凝膜（高端家具专用款）", "date": "2026-05-14", "images": False, "followup": ""},
    {"id": 12, "content": "有厚度，质量挺好的", "sku": "30x100cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-06-04", "images": False, "followup": ""},
    {"id": 13, "content": "确实很有效，外面看不清里面。", "sku": "90x250cm；亮光实木桌专用（防刮蹭不伤漆）", "date": "2026-06-03", "images": False, "followup": ""},
    {"id": 14, "content": "贴上后很牢固，没掉过。", "sku": "90x300cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-06-03", "images": False, "followup": ""},
    {"id": 15, "content": "超级好，又厚实，粘性又高，必须夸赞", "sku": "30x100cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-06-02", "images": False, "followup": ""},
    {"id": 16, "content": "很好的卖家，还会再来的", "sku": "50x200cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-22", "images": False, "followup": ""},
    {"id": 17, "content": "物品好，商家服务也很好。", "sku": "120x100cm；哑光岩板桌专用（耐高温不渗色）", "date": "2026-05-17", "images": False, "followup": ""},
    {"id": 18, "content": "很方便 效果好", "sku": "100x100cm；亮光实木桌专用（防刮蹭不伤漆）", "date": "2026-06-08", "images": False, "followup": ""},
    {"id": 19, "content": "包装严实，还未贴", "sku": "50x150cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-30", "images": False, "followup": ""},
    {"id": 20, "content": "好，发货快。", "sku": "30x100cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-05-17", "images": False, "followup": ""},
    {"id": 21, "content": "非常好看 下次继续买", "sku": "100x300cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-08", "images": False, "followup": ""},
    {"id": 22, "content": "还不错吧！", "sku": "70x150cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-20", "images": False, "followup": ""},
    {"id": 23, "content": "合作愉快", "sku": "40x150cm；哑光岩板桌专用（耐高温不渗色）", "date": "2026-05-16", "images": False, "followup": ""},
    {"id": 24, "content": "还可以吧", "sku": "152x150cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-10", "images": False, "followup": ""},
    {"id": 25, "content": "差差差，非常生气！几乎不给差评，但是这个自己看去吧。视频里说大量喷肥皂水，本身这个东西就是带胶的，就是得多喷一些。拍完之后贴的时候没有气泡，非常平整。第2天全是泡。那就不贴了呗。也无所谓点事。揭下来。把我的大桌面揭的全是伤痕。问客服客服说我喷的水喷多了。我又没说让你们负责任。只是想问问怎么补救。各种推卸责任。只能上传5张照片。就当吃了哑巴亏，各位长点记性吧。", "sku": "70x300cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-29", "images": True, "followup": "差差差，非常生气！揭下来把桌面全是伤痕。客服各种推卸责任。"},
    {"id": 26, "content": "真是服了 链接里的教程是什么鬼 全程没有任何一个步骤是说膜的上面有一层保护膜要撕下来的 顾客也不一定都是经常贴家具膜的吧 谁能刚开始就会操作呢 费劲八力贴了两个小时 结果全白贴了 问了客服又说晚上没有售后 我又不是退货 要你售后干什么 客服就不能给讲解一下吗？ 问了很多遍 就是一句售后晚上不上班打发人 真是太差劲了 最低是一星 真的一星都不想给", "sku": "80x200cm；哑光岩板桌专用（耐高温不渗色）", "date": "2026-05-25", "images": False, "followup": ""},
    {"id": 27, "content": "产品质量问题严重，很难贴，贴坏了客服推卸责任，不守承诺，坚决不贴。要求再拍，价格变成贵2、3倍，半包虚言也没有，严重差评", "sku": "50x200cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-06-08", "images": False, "followup": ""},
    {"id": 28, "content": "这商家必须给好评，第一次发货包装破了点，把安装工具搞丢了，给商家反馈后，直接重新发了一套", "sku": "80x150cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-06-07", "images": False, "followup": ""},
    {"id": 29, "content": "收货后有些不平整，跟客服沟通后妥善解决。", "sku": "50x150cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-05-25", "images": True, "followup": ""},
    {"id": 30, "content": "全部都是气泡，别买，快跑，搞了一早上，浪费时间、体力和金钱，千万别浪费钱，卖家只会让你多放点水，用重物压，一点都不贴不住，贴到一半不想浪费体力了，揭掉扔了", "sku": "90x200cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-10", "images": False, "followup": ""},
    {"id": 31, "content": "差得很，实物与描述不相符，大家不要上当", "sku": "50x150cm；哑光岩板桌专用（耐高温不渗色）", "date": "2026-06-02", "images": False, "followup": ""},
    {"id": 32, "content": "差行很，与描述不相符，不要上当", "sku": "30x200cm；哑光岩板桌专用（耐高温不渗色）", "date": "2026-06-02", "images": False, "followup": ""},
    {"id": 33, "content": "说的送工具，到货就一个膜，根本没工具", "sku": "100x200cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-05-29", "images": False, "followup": ""},
    {"id": 34, "content": "隔热效果好，整体不错，质量很好，安装简单", "sku": "70x150cm；亮光实木桌专用（防刮蹭不伤漆）", "date": "2026-06-06", "images": True, "followup": ""},
    {"id": 35, "content": "不错，效果挺好的，这样能很好的保护实木的桌面了，桌面比较长，两个人配合就贴的很好", "sku": "80x300cm；自动修复水凝膜（高端家具专用款）", "date": "2026-04-07", "images": True, "followup": ""},
    {"id": 36, "content": "便宜又好用", "sku": "30x100cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-05-20", "images": False, "followup": ""},
    {"id": 37, "content": "第二次购买 很容易操作", "sku": "70x150cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-04-07", "images": True, "followup": ""},
    {"id": 38, "content": "操作简单，贴完效果很好。物流很快，包装的很好，店家服务也挺好的。", "sku": "100x100cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-04-07", "images": True, "followup": ""},
    {"id": 39, "content": "这家的膜非常好，我家所有的膜都是从他家买的，质量没得说，贴上去效果真的非常好。并且送的工具也很齐全，操作非常简单。贴好了一点也没有起泡，翘边", "sku": "1x0cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-04-06", "images": True, "followup": ""},
    {"id": 40, "content": "施工完毕，效果真的牛，按照教程来贴的，看了两遍来贴的，没有任何气泡褶皱，太完美了", "sku": "70x200cm；自动修复水凝膜（高端家具专用款）", "date": "2026-04-06", "images": True, "followup": ""},
    {"id": 41, "content": "这家的膜非常好，我家所有的膜都是从他家买的，质量没得说，贴上去效果真的非常好。并且送的工具也很齐全，操作非常简单。贴好了一点也没有起泡，翘边", "sku": "80x150cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-04-06", "images": True, "followup": ""},
    {"id": 42, "content": "转盘是哑光，桌面选择的亮光，贴好后都是很好看的，在材质和品质上当然没的说，主要是选择哑光和亮光方面应该是各有所爱，做好选择就行了，用了段时间了，都没有什么问题，都是很好看。完全没必要担心不好贴，送的工具够了。", "sku": "80x150cm；哑光岩板桌专用（耐高温不渗色）", "date": "2026-04-06", "images": True, "followup": ""},
    {"id": 43, "content": "质量很好，不透光，遮光效果好，使用体验很好", "sku": "60x150cm；自动修复水凝膜（高端家具专用款）", "date": "2026-06-05", "images": True, "followup": ""},
    {"id": 44, "content": "买的哑光的非常自然就跟没贴是一样的，看着很舒服，而且这个表面不是那种磨砂的，擦起来都很光滑。", "sku": "60x300cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-04-06", "images": True, "followup": ""},
    {"id": 45, "content": "可以，不错，需要细致的去做，有视频讲解，按照步骤做就会好些", "sku": "80x150cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-04-07", "images": True, "followup": ""},
    {"id": 46, "content": "贴上以后很符合，而且给的操作指南讲解的很清楚，自己贴非常容易，高清透明，桌子也非常好看，赞！", "sku": "50x100cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-04-07", "images": True, "followup": ""},
    {"id": 47, "content": "贴上以后很符合，而且给的操作指南讲解的很清楚，自己贴非常容易，高清透明，桌子也非常好看，赞！", "sku": "60x150cm；哑光岩板桌专用（耐高温不渗色）", "date": "2026-04-07", "images": True, "followup": ""},
    {"id": 48, "content": "这个好，以前总担心桌面会刮到，贴膜以后漂亮很多，坏了还可以换。", "sku": "1x0cm；哑光岩板桌专用（耐高温不渗色）", "date": "2026-04-06", "images": True, "followup": ""},
    {"id": 49, "content": "挺好贴的，效果也可以。而且尝试了下不伤桌面，贴上去木桌面都变得更高级了", "sku": "70x300cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-04-06", "images": True, "followup": ""},
    {"id": 50, "content": "很好操作，贴完膜既美观还可以起到保护作用，很赞", "sku": "80x150cm；亮光实木桌专用（防刮蹭不伤漆）", "date": "2026-04-07", "images": True, "followup": ""},
    {"id": 51, "content": "有详细的操作视频，自己还是比较容易贴，贴完后更有光泽，非常不错", "sku": "100x100cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-04-07", "images": True, "followup": ""},
    {"id": 52, "content": "特别亮，质量很好，不仔细看看不出贴了膜。这样不用担心刮花了", "sku": "80x150cm；亮光实木桌专用（防刮蹭不伤漆）", "date": "2026-04-07", "images": True, "followup": ""},
    {"id": 53, "content": "该用户觉得商品非常好，给出5星好评", "sku": "80x100cm；哑光岩板桌专用（耐高温不渗色）", "date": "2026-06-08", "images": False, "followup": ""},
    {"id": 54, "content": "该用户觉得商品非常好，给出5星好评", "sku": "90x250cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-06-03", "images": False, "followup": ""},
    {"id": 55, "content": "该用户觉得商品非常好，给出5星好评", "sku": "80x150cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-05-27", "images": False, "followup": ""},
    {"id": 56, "content": "该用户觉得商品非常好，给出5星好评", "sku": "50x100cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-16", "images": False, "followup": ""},
    {"id": 57, "content": "该用户觉得商品非常好，给出5星好评", "sku": "30x150cm；哑光岩板桌专用（耐高温不渗色）", "date": "2026-05-05", "images": False, "followup": ""},
    {"id": 58, "content": "该用户觉得商品非常好，给出5星好评", "sku": "80x300cm；哑光岩板桌专用（耐高温不渗色）", "date": "2026-05-25", "images": False, "followup": ""},
    {"id": 59, "content": "该用户觉得商品非常好，给出5星好评", "sku": "40x100cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-06-03", "images": False, "followup": ""},
    {"id": 60, "content": "该用户觉得商品非常好，给出5星好评", "sku": "110x200cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-05-11", "images": False, "followup": ""},
    {"id": 61, "content": "该用户觉得商品非常好，给出5星好评", "sku": "90x150cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-13", "images": False, "followup": ""},
    {"id": 62, "content": "该用户觉得商品非常好，给出5星好评", "sku": "30x150cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-05-18", "images": False, "followup": ""},
    {"id": 63, "content": "该用户觉得商品非常好，给出5星好评", "sku": "60x200cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-24", "images": False, "followup": ""},
    {"id": 64, "content": "该用户觉得商品非常好，给出5星好评", "sku": "40x100cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-06-03", "images": False, "followup": ""},
    {"id": 65, "content": "该用户觉得商品非常好，给出5星好评", "sku": "40x200cm；亮光实木桌专用（防刮蹭不伤漆）", "date": "2026-06-04", "images": False, "followup": ""},
    {"id": 66, "content": "该用户觉得商品非常好，给出5星好评", "sku": "60x100cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-12", "images": False, "followup": ""},
    {"id": 67, "content": "该用户觉得商品非常好，给出5星好评", "sku": "30x100cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-05-25", "images": False, "followup": ""},
    {"id": 68, "content": "该用户觉得商品非常好，给出5星好评", "sku": "60x150cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-04-29", "images": False, "followup": ""},
    {"id": 69, "content": "该用户觉得商品非常好，给出5星好评", "sku": "40x150cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-06-01", "images": False, "followup": ""},
    {"id": 70, "content": "该用户觉得商品非常好，给出5星好评", "sku": "40x250cm；自动修复水凝膜（高端家具专用款）", "date": "2026-06-06", "images": False, "followup": ""},
    {"id": 71, "content": "该用户觉得商品非常好，给出5星好评", "sku": "60x200cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-05-06", "images": False, "followup": ""},
    {"id": 72, "content": "该用户觉得商品非常好，给出5星好评", "sku": "120x150cm；哑光岩板桌专用（耐高温不渗色）", "date": "2026-04-28", "images": False, "followup": ""},
    {"id": 73, "content": "该用户觉得商品非常好，给出5星好评", "sku": "90x200cm；哑光岩板桌专用（耐高温不渗色）", "date": "2026-05-10", "images": False, "followup": ""},
    {"id": 74, "content": "该用户觉得商品非常好，给出5星好评", "sku": "40x150cm；亮光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-23", "images": False, "followup": ""},
    {"id": 75, "content": "该用户觉得商品非常好，给出5星好评", "sku": "40x200cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-05-18", "images": False, "followup": ""},
    {"id": 76, "content": "该用户觉得商品非常好，给出5星好评", "sku": "40x300cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-15", "images": False, "followup": ""},
    {"id": 77, "content": "该用户觉得商品非常好，给出5星好评", "sku": "80x300cm；哑光岩板桌专用（耐高温不渗色）", "date": "2026-05-06", "images": False, "followup": ""},
    {"id": 78, "content": "该用户觉得商品非常好，给出5星好评", "sku": "50x200cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-20", "images": False, "followup": ""},
    {"id": 79, "content": "该用户觉得商品非常好，给出5星好评", "sku": "110x200cm；自动修复水凝膜（高端家具专用款）", "date": "2026-06-07", "images": False, "followup": ""},
    {"id": 80, "content": "该用户觉得商品非常好，给出5星好评", "sku": "60x100cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-21", "images": False, "followup": ""},
    {"id": 81, "content": "该用户觉得商品非常好，给出5星好评", "sku": "60x150cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-05-18", "images": False, "followup": ""},
    {"id": 82, "content": "该用户觉得商品非常好，给出5星好评", "sku": "90x200cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-23", "images": False, "followup": ""},
    {"id": 83, "content": "该用户觉得商品非常好，给出5星好评", "sku": "60x150cm；亮光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-20", "images": False, "followup": ""},
    {"id": 84, "content": "该用户觉得商品非常好，给出5星好评", "sku": "90x150cm；哑光岩板桌专用（耐高温不渗色）", "date": "2026-05-24", "images": False, "followup": ""},
    {"id": 85, "content": "该用户觉得商品非常好，给出5星好评", "sku": "70x150cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-05-07", "images": False, "followup": ""},
    {"id": 86, "content": "该用户觉得商品非常好，给出5星好评", "sku": "40x200cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-27", "images": False, "followup": ""},
    {"id": 87, "content": "该用户觉得商品非常好，给出5星好评", "sku": "80x200cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-06-05", "images": False, "followup": ""},
    {"id": 88, "content": "还行吧", "sku": "50x100cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-05-14", "images": False, "followup": ""},
    {"id": 89, "content": "很好用", "sku": "70x250cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-04-29", "images": False, "followup": ""},
    {"id": 90, "content": "便宜又好用", "sku": "30x100cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-05-20", "images": False, "followup": ""},
    {"id": 91, "content": "该用户觉得商品非常好，给出5星好评", "sku": "30x100cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-05-22", "images": False, "followup": ""},
    {"id": 92, "content": "该用户觉得商品非常好，给出5星好评", "sku": "40x150cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-13", "images": False, "followup": ""},
    {"id": 93, "content": "该用户觉得商品非常好，给出5星好评", "sku": "40x200cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-23", "images": False, "followup": ""},
    {"id": 94, "content": "该用户觉得商品非常好，给出5星好评", "sku": "60x150cm；自动修复水凝膜（高端家具专用款）", "date": "2026-06-04", "images": False, "followup": ""},
    {"id": 95, "content": "该用户觉得商品非常好，给出5星好评", "sku": "40x100cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-31", "images": False, "followup": ""},
    {"id": 96, "content": "该用户觉得商品非常好，给出5星好评", "sku": "30x300cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-24", "images": False, "followup": ""},
    {"id": 97, "content": "该用户觉得商品非常好，给出5星好评", "sku": "70x100cm；自动修复水凝膜（高端家具专用款）", "date": "2026-06-04", "images": False, "followup": ""},
    {"id": 98, "content": "该用户觉得商品非常好，给出5星好评", "sku": "80x200cm；哑光岩板桌专用（耐高温不渗色）", "date": "2026-05-23", "images": False, "followup": ""},
    {"id": 99, "content": "该用户觉得商品非常好，给出5星好评", "sku": "60x150cm；哑光实木桌专用（防刮蹭不伤漆）", "date": "2026-05-30", "images": False, "followup": ""},
    {"id": 100, "content": "该用户觉得商品非常好，给出5星好评", "sku": "90x200cm；亮光岩板桌专用（耐高温不渗色）", "date": "2026-05-28", "images": False, "followup": ""},
]

# 预分析内置数据
_builtin_analysis = None


def _get_builtin_analysis() -> dict:
    """获取内置数据的分析结果（懒加载）"""
    global _builtin_analysis
    if _builtin_analysis is None:
        _builtin_analysis = review_analyzer.analyze(_BUILTIN_REVIEWS)
        _builtin_analysis["analysis_date"] = datetime.now().isoformat()
        _builtin_analysis["data_source"] = "内置真实评价数据（家具贴膜店铺100条）"
    return _builtin_analysis


@router.get("/builtin")
async def get_builtin_reviews():
    """获取内置评价数据集"""
    return {
        "status": "success",
        "reviews": _BUILTIN_REVIEWS,
        "count": len(_BUILTIN_REVIEWS),
        "source": "家具贴膜店铺真实评价数据",
    }


@router.get("/builtin/analysis")
async def get_builtin_analysis():
    """获取内置评价数据的分析结果"""
    analysis = _get_builtin_analysis()
    return {"status": "success", "analysis": analysis}


@router.post("/upload")
async def upload_reviews(file: UploadFile = File(...)):
    """上传评价数据文件（支持 CSV/JSON）"""
    content = await file.read()

    if file.filename.endswith(".csv"):
        reviews = _parse_csv(content)
    elif file.filename.endswith(".json"):
        try:
            data = json.loads(content)
            reviews = data if isinstance(data, list) else data.get("reviews", [])
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="JSON 格式错误")
    else:
        raise HTTPException(status_code=400, detail="仅支持 CSV 和 JSON 文件格式")

    if not reviews:
        raise HTTPException(status_code=400, detail="文件中没有找到评价数据")

    # 分析
    analysis = review_analyzer.analyze(reviews)
    analysis["analysis_date"] = datetime.now().isoformat()
    analysis["data_source"] = f"上传文件: {file.filename} ({len(reviews)}条)"

    # 存储
    dataset_id = f"upload_{int(datetime.now().timestamp())}"
    _datasets[dataset_id] = {"reviews": reviews, "analysis": analysis, "filename": file.filename}

    return {
        "status": "success",
        "dataset_id": dataset_id,
        "review_count": len(reviews),
        "analysis": analysis,
    }


@router.post("/analyze")
async def analyze_reviews(reviews: list[dict] = Body(..., embed=True)):
    """直接提交评价数据列表进行分析"""
    if not reviews:
        raise HTTPException(status_code=400, detail="评价数据不能为空")

    analysis = review_analyzer.analyze(reviews)
    analysis["analysis_date"] = datetime.now().isoformat()
    analysis["data_source"] = f"API提交 ({len(reviews)}条)"
    return {"status": "success", "analysis": analysis}


@router.get("/datasets")
async def list_datasets():
    """列出所有已上传的数据集"""
    result = []
    for did, ds in _datasets.items():
        result.append({
            "id": did,
            "filename": ds["filename"],
            "review_count": len(ds["reviews"]),
            "analysis_date": ds["analysis"]["analysis_date"],
        })
    # 加上内置数据集
    builtin = _get_builtin_analysis()
    result.insert(0, {
        "id": "builtin",
        "filename": "内置-家具贴膜店铺评价",
        "review_count": len(_BUILTIN_REVIEWS),
        "analysis_date": builtin["analysis_date"],
    })
    return {"status": "success", "datasets": result}


@router.get("/datasets/{dataset_id}/analysis")
async def get_dataset_analysis(dataset_id: str):
    """获取指定数据集的分析结果"""
    if dataset_id == "builtin":
        return {"status": "success", "analysis": _get_builtin_analysis()}
    if dataset_id not in _datasets:
        raise HTTPException(status_code=404, detail="数据集不存在")
    return {"status": "success", "analysis": _datasets[dataset_id]["analysis"]}


def _parse_csv(content: bytes) -> list[dict]:
    """解析CSV格式的评价数据"""
    text = content.decode("utf-8-sig")
    reader = csv.DictReader(io.StringIO(text))
    reviews = []
    for row in reader:
        review = {
            "content": row.get("初评", "") or row.get("评价内容", "") or row.get("content", "") or row.get("review", ""),
            "sku": row.get("SKU", "") or row.get("sku", ""),
            "date": row.get("初评时间", "") or row.get("时间", "") or row.get("date", ""),
            "images": bool(row.get("晒图", "") or row.get("images", "")),
            "followup": row.get("追评", "") or row.get("followup", ""),
        }
        if review["content"]:
            reviews.append(review)
    return reviews
