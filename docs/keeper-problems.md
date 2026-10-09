# 养虫人/爬宠饲主常见问题清单

2026 年 10 月调研。来源包括英文论坛（Arachnoboards、TarantulaForum、MantidForum、ball-pythons.net、MorphMarket 社区、Reddit）、中文社区（知乎、B 站、百度知道/贴吧）以及同类 App 的商店评价。
调研时把相同的问题合并，按出现频率排序，并评估本应用（本地离线 PWA）能否帮上忙。

状态：✅ 已实现　🟡 部分实现　⬜ 计划中

| # | 问题 | 涉及 | 频率 | 状态 |
|---|---|---|---|---|
| 1 | 宠物拒食时，饲主分不清是蜕皮前期（蛇叫蓝眼期）、吃饱了、应激还是生病 | 蜘蛛、螳螂、蛇 | 非常常见 | ✅ 本次：蜕皮前期/蓝眼期状态，期间不提醒喂食，显示停食天数和上次前期天数；拒食警告可一键标记 |
| 2 | 养到十几只以上后，喂食日要一只只打开、一条条录入，非常繁琐 | 蜘蛛、螳螂、蛇 | 非常常见 | ✅ 本次：批量记录（按到期分组，喂食 / 换水清洁） |
| 3 | 饲主想知道「是不是快蜕皮了」「这次是不是隔太久了」 | 蜘蛛、螳螂、蛇 | 非常常见 | ✅ 本次：蜕皮历史表、平均间隔、下次蜕皮预测窗口、「临近蜕皮」排序 |
| 4 | 蜕皮后，外骨骼和螯牙还没硬化，这时不能喂；喂早了容易被活饵咬伤、断牙或变形 | 蜘蛛、螳螂 | 非常常见 | ✅ 本次：蜕皮后硬化期（按物种和阶段默认，可改），期间不提醒，投喂前确认 |
| 5 | 没吃完的活饵留在缸里忘了取出 | 蜘蛛、螳螂、蛇 | 非常常见 | ✅ 本次：拒食/吃剩时记「剩饵仍在缸内」，按时长分级提醒，一键「已取出」 |
| 6 | 忘了加水或喷雾，宠物就会脱水 | 蜘蛛、螳螂 | 非常常见 | ✅ 加水/换水、喷雾记录与按个体间隔的信息提示（蜘蛛默认不提醒喷雾），一键记录，卡皮时显示前 7 天喷雾次数 |
| 7 | 温湿度和通风不对，是拒食、吐食、卡皮和若蛛猝死的头号原因，论坛上就有人说通风不足杀死的若蛛比什么都多 | 蜘蛛、螳螂、蛇 | 非常常见 | ⬜ 计划中 |
| 8 | 饲主想把记录导出成表格，用 Excel 排序、画图、打印，或者在转让个体时把它的完整记录交给买家；也想把多年的 Excel 历史导进新工具 | 蜘蛛、螳螂、蛇 | 非常常见 | 🟡 导出 Excel（宠物 + 记录两张表）、CSV、单只宠物导出；打印履历和 CSV 导入待做 |
| 9 | 缺少「今天该喂谁」的总览 | 蜘蛛、螳螂、蛇 | 非常常见 | 🟡 部分：卡片显示下次喂食日，首页按待办排序，批量记录按逾期/今天/明天/7 天内分组 |
| 10 | 记录步骤一多，饲主就会懒得记、忘了记，最后弃用 | 蜘蛛、螳螂、蛇 | 非常常见 | ✅ 本次：沿用上次食物、最近食物快捷按钮、撤销、今天/昨天/前天 |
| 11 | 蛇长期拒食时（几周到几个月，球蟒有 9 个月的记录），社区共识是看体重趋势，不看拒食天数：只要不掉秤、没有病症，就不用慌 | 蛇 | 非常常见 | ⬜ 计划中 |
| 12 | 吐食和拒食不是一回事 | 蛇 | 非常常见 | ✅ 本次：「吐食」结果、休整期 14/21 天、消化期 72 小时勿上手、反复吐食提示就医 |
| 13 | 卡蜕或蜕皮失败：腿、前足、触角或翅膀卡在旧皮里，常导致残疾、只能手喂，下次蜕皮也更容易再失败，严重时会死亡 | 蜘蛛、螳螂 | 非常常见 | ⬜ 计划中 |
| 14 | 记录丢失是同类 App 最致命的差评：崩溃、更新或换手机后，几个月甚至几年的数据没了；恢复时丢照片，或者把已有数据覆盖掉 | 蜘蛛、螳螂、蛇 | 常见 | ✅ 本次：申请持久化存储、备份提醒横幅、导入预览、覆盖前自动快照、归档代替删除 |
| 15 | 老玩家普遍看腹部（体况）决定喂不喂，而不是按固定日程 | 蜘蛛、螳螂、蛇 | 常见 | ⬜ 计划中 |
| 16 | 繁殖玩家要记交配日期和对象，每个卵鞘或卵囊的产下日期和编号、冷藏起止日期、预计孵化日和孵化数量 | 螳螂、蜘蛛 | 常见 | ⬜ 计划中 |
| 17 | 性别常常判断不准 | 蜘蛛、螳螂 | 常见 | ⬜ 计划中 |
| 18 | 螳螂的龄期很容易数乱：买来时不知道几龄，蜕皮漏记，偶尔还会跳龄；雌性通常比雄性多蜕 1 到 2 次（例如兰花螳螂雌 9 龄、雄 7 龄成虫） | 螳螂 | 常见 | ⬜ 计划中 |
| 19 | 成熟后的时间很关键 | 蜘蛛、螳螂 | 常见 | ⬜ 计划中 |
| 20 | 很多球蟒和玉米蛇每年秋冬都会固定停食几个月（冬化或季节性停食），体重下降 5% 以内比较常见 | 蛇 | 常见 | ⬜ 计划中 |
| 21 | 环境变化后的应激拒食常被误判 | 蛇、蜘蛛 | 常见 | 🟡 部分：到家适应期（期间不提醒）、蛇 14 天未开食提示、显示开食日；换缸记录待做 |
| 22 | 蛇蜕皮不全很常见：碎成几片、尾尖残留、眼罩残留 | 蛇 | 常见 | ⬜ 计划中 |
| 23 | 蛇该喂多大的猎物，让新手很头疼 | 蛇 | 常见 | ⬜ 计划中 |
| 24 | 饲料会断档 | 螳螂、蜘蛛、蛇 | 常见 | ⬜ 计划中 |
| 25 | 除了喂食和蜕皮，饲主还要清残渣、换垫材、换缸 | 蜘蛛、螳螂、蛇 | 常见 | ⬜ 计划中 |
| 26 | 蛇的排便间隔差别很大，取决于个体、年龄、餐量和温度：幼蛇两餐之间可能排便好几次；成年玉米蛇吃了大餐后两周甚至更久不排便也正常；蜕皮前常常憋着，等蜕完皮一起排 | 蛇 | 常见 | ⬜ 计划中 |
| 27 | 螳螂蜕皮需要倒挂的空间：饲养盒高度至少要有体长的 3 倍，顶部要能抓牢（光滑的塑料顶要贴一块网布） | 螳螂 | 常见 | ⬜ 计划中 |
| 28 | 蜘蛛和螳螂的生长要看体长或对角腿展（DLS），最方便的方法是每次蜕皮后量蜕下的皮 | 蜘蛛、螳螂 | 常见 | ⬜ 计划中 |
| 29 | 螨虫是饲主最怕的问题之一，可能来自新个体、展会、饲料鼠或垫材；谷螨也会从饲料盒扩散到整个饲养间 | 蛇、蜘蛛 | 常见 | ⬜ 计划中 |
| 30 | 养的数量一多，App 里的名字就很难和架子上几十个盒子对上号 | 蜘蛛、螳螂、蛇 | 常见 | ⬜ 计划中 |
| 31 | 档案字段不够用 | 蜘蛛、螳螂、蛇 | 偶见 | ⬜ 计划中 |
| 32 | 挖洞型的捕鸟蛛会封洞几个月不露面，饲主看不到它是死是活、有没有蜕皮 | 蜘蛛 | 偶见 | ⬜ 计划中 |
| 33 | 看爬宠兽医时，兽医需要完整的病史：投喂情况（包括拒食和吐食）、体重趋势、蜕皮日期和质量、饲养环境参数 | 蛇、蜘蛛、螳螂 | 偶见 | ⬜ 计划中 |
| 34 | 一个螳螂卵鞘能孵出几十到几百只若虫 | 螳螂 | 偶见 | ⬜ 计划中 |
| 35 | 出门前，饲主不知道每只宠物能撑多久（L1 到 L2 的螳螂若虫、蜘蛛若体和幼蛇最怕断食），不知道活饵该不该留，托人照看时也不知道要写清哪些信息 | 蜘蛛、螳螂、蛇 | 偶见 | ⬜ 计划中 |
| 36 | 让蛇从活饵改吃冻鼠，或者换一种猎物，往往要试好几周 | 蛇 | 偶见 | ⬜ 计划中 |
| 37 | 补录过去的日期很麻烦，编辑历史记录也容易出错 | 蜘蛛、螳螂、蛇 | 偶见 | 🟡 部分：今天/昨天/前天快捷按钮 |
| 38 | 饲主反感广告和游戏化元素（打卡、连胜、商店推送），也反感按动物数量收费的订阅（免费版常常只能养 1 到 15 只），还不愿把记录存在别人的服务器上 | 蜘蛛、螳螂、蛇 | 偶见 | ✅ 设计约束：无账号、无服务器、不限数量、不做游戏化 |

## 详细说明

### 1. 宠物拒食时，饲主分不清是蜕皮前期（蛇叫蓝眼期）、吃饱了、应激还是生病

- **涉及**：蜘蛛、螳螂、蛇　**频率**：非常常见　**价值/工作量**：high/M
- **问题**：宠物拒食时，饲主分不清是蜕皮前期（蛇叫蓝眼期）、吃饱了、应激还是生病。蜕皮前期长短差别很大：螳螂若虫几天，末龄1到2周；捕鸟蛛幼体2周到1个月，成体可以好几个月（玫瑰红有6个月的记录）；蛇的蓝眼期约1到2周，这期间应暂停投喂和上手。按固定间隔弹出的「该喂了」红色提醒在这段时间一直误报，新手因此焦虑、反复投喂，还有人把翻身蜕皮的蜘蛛当成死了。
- **状态**：✅ 本次：蜕皮前期/蓝眼期状态，期间不提醒喂食，显示停食天数和上次前期天数；拒食警告可一键标记
- **改进思路（待评估）**：给宠物加一个「当前状态」字段：正常 / 蜕皮前期（蛇显示为蓝眼期），以后还可以扩展冬化、封洞、隔离。状态可在宠物页手动开启，连续拒食的警告条上也加一个「标记为蜕皮前期」按钮。状态期间取消「该喂了」高亮，卡片改为显示「蜕皮前期第N天·已停食N天·上次前期持续X天」，后者由这只个体以往「开始拒食到蜕皮」的天数算出。记录蜕皮后状态自动结束。节肢类附一份可勾选的前兆清单（腹部饱满发亮、秃斑变深、吐蜕皮垫或封洞、螳螂翅芽鼓胀），勾选结果随记录保存。蛇的蓝眼期超过 21 天仍未蜕皮时，在页面提示检查湿度。如果离预计蜕皮期还远，却已拒食超过 7 天，提示改为「建议检查温湿度，看腹部是否干瘪」。所有提示只在页面内显示，不推送。
- **来源**：[1](https://arachnoboards.com/threads/brachypelma-premolt-how-long.171383/) [2](https://arachnoboards.com/threads/how-long-does-pre-molt-last.187497/) [3](https://arachnoboards.com/threads/my-tarantula-is-in-premolt-how-long-will-it-take.372027/) [4](https://tomsbigspiders.com/2014/08/11/tarantula-premolt/) [5](https://arachnoboards.com/threads/is-my-sling-in-pre-molt-or-stressed.355892)

### 2. 养到十几只以上后，喂食日要一只只打开、一条条录入，非常繁琐

- **涉及**：蜘蛛、螳螂、蛇　**频率**：非常常见　**价值/工作量**：high/M
- **问题**：养到十几只以上后，喂食日要一只只打开、一条条录入，非常繁琐。很多人记一阵就放弃，退回纸卡、白板或 Excel，有的干脆只记蜕皮、不记喂食；数量一多也容易搞混谁喂过、谁没喂。Monty、Reptile Rocket、MorphMarket Husbandry 等竞品都把批量喂食当作卖点。
- **状态**：✅ 本次：批量记录（按到期分组，喂食 / 换水清洁）
- **改进思路（待评估）**：首页加一个「批量记录」模式：可以多选，也可以按物种全选，或一键全选「今日待喂」。列表每行有 吃了 / 拒食 / 吃剩 / 跳过 几个大按钮，食物和数量默认沿用这只宠物上一次的喂食，单行可以修改。点一次「保存」就写入多条记录（放在同一个 IndexedDB 事务里）。同一入口也支持批量记「加水/喷雾」和「清洁」。处于蜕皮前期、硬化期等暂停状态的宠物排在后面，标出状态，默认不勾选。
- **来源**：[1](https://www.tarantulaforum.com/threads/t-logs.19257/) [2](https://www.tarantulaforum.com/threads/when-does-record-keeping-become-obsessive.27514) [3](https://arachnoboards.com/threads/record-keeping.299010/) [4](https://arachnoboards.com/threads/best-way-to-keep-up-with-molt-cycles.285548/post-2504870) [5](https://tarantulaforum.com/threads/record-cards.36057/)

### 3. 饲主想知道「是不是快蜕皮了」「这次是不是隔太久了」

- **涉及**：蜘蛛、螳螂、蛇　**频率**：非常常见　**价值/工作量**：high/M
- **问题**：饲主想知道「是不是快蜕皮了」「这次是不是隔太久了」。但蜕皮间隔会随龄期变长，还受温度和喂食影响，没有固定周期，只能根据这只个体的历史来推算。目前大多是手算，或者依赖以此为卖点的竞品 App（Tarantula Tracker、InvertMate 等）。蛇也一样：幼体约 3 到 6 周蜕一次，成体 6 到 8 周甚至更久。
- **状态**：✅ 本次：蜕皮历史表、平均间隔、下次蜕皮预测窗口、「临近蜕皮」排序
- **改进思路（待评估）**：详情页加一个「蜕皮历史」表，列出每次蜕皮的日期、进入的龄期、距上次天数和完整度，底部显示平均间隔。卡片显示「本龄第N天 / 上一龄用了M天」。用最近 1 到 3 次间隔估算下次蜕皮窗口，给一个区间而不是单个日期：节肢类考虑间隔递增，乘约 1.2 到 1.5 的系数；蛇取最近 3 次的平均。没有历史时用 SPECIES.moltDays 的默认值，并标注「参考」。进入窗口后，卡片显示小标记「可能临近蜕皮」；超过窗口上限的 1.5 倍时，提示「检查温度与喂食量」。成虫和成熟个体不显示预测。首页排序增加「临近蜕皮」选项。
- **来源**：[1](https://arachnoboards.com/goto/post?id=2856585) [2](https://www.tarantulaforum.com/threads/frequency-of-juve-sling-moulting.29281) [3](https://arachnoboards.com/threads/slings-and-molts.361123) [4](https://apps.apple.com/us/app/tarantula-tracker/id6754264263) [5](https://apps.apple.com/app/id6754847996)

### 4. 蜕皮后，外骨骼和螯牙还没硬化，这时不能喂；喂早了容易被活饵咬伤、断牙或变形

- **涉及**：蜘蛛、螳螂　**频率**：非常常见　**价值/工作量**：high/S
- **问题**：蜕皮后，外骨骼和螯牙还没硬化，这时不能喂；喂早了容易被活饵咬伤、断牙或变形。要等多久因物种和体型而异：螳螂若虫约 24 小时，成虫羽化后约 48 小时；捕鸟蛛幼体 3 到 5 天，成体 10 到 14 天甚至更久，以螯牙变黑为准。饲主常常记不清谁刚蜕过皮、要等到哪天；蜕皮后几周不吃也很常见，却常被当成异常。
- **状态**：✅ 本次：蜕皮后硬化期（按物种和阶段默认，可改），期间不提醒，投喂前确认
- **改进思路（待评估）**：保存一条完整的蜕皮记录后，自动进入「硬化期」。默认天数按物种和阶段设定：螳螂若虫 1 天、成虫 2 天；蜘蛛幼体 5 天、亚成 7 天、成体 12 天，可在宠物表单里按个体修改。卡片显示「硬化期第N天·约X天后可喂」，期间不计喂食逾期，下次喂食日从硬化期结束开始算。硬化期内新建喂食记录时弹出确认（蜘蛛为「螯牙已经变黑了吗？」）。硬化期结束后的拒食单独标为「蜕皮后休整」，不触发「可能进入蜕皮前期」的提示。
- **来源**：[1](https://arachnoboards.com/threads/feeding-after-molt.288609/post-2722511) [2](https://arachnoboards.com/threads/molts-and-fangs-hardening.291410/post-2589038) [3](https://tarantulaheaven.com/how-long-should-you-wait-to-feed-your-tarantula-after-a-molt) [4](https://arachnoboards.com/threads/when-should-i-feed-my-freshly-molted-tarantula.297946/) [5](https://arachnoboards.com/threads/t-vagans-sealed-himself-off-again-not-eating-over-a-month-after-molting.372872)

### 5. 没吃完的活饵留在缸里忘了取出

- **涉及**：蜘蛛、螳螂、蛇　**频率**：非常常见　**价值/工作量**：high/S
- **问题**：没吃完的活饵留在缸里忘了取出。蟋蟀等活饵会咬伤甚至咬死正在蜕皮或刚蜕完的蜘蛛和螳螂，蛇在蜕皮期喂活鼠也一样。剩饵和食团还会招来谷螨、蚤蝇，引起发霉。普遍的建议是 24 小时内取出没吃的猎物。
- **状态**：✅ 本次：拒食/吃剩时记「剩饵仍在缸内」，按时长分级提醒，一键「已取出」
- **改进思路（待评估）**：喂食结果选「拒食」或「吃剩」时，表单出现一个默认勾选的选项「活饵/残渣仍在缸内」。保存后，卡片挂上「待取出剩饵（已N小时）」标签；点「已取出」后标签消失，并自动生成一条「清残渣」记录。宠物处于蜕皮前期、正在蜕皮或硬化期时，这个标签变成红色。批量记录里拒食的行同样适用。
- **来源**：[1](https://tarantulaforum.com/threads/molting-and-feeders.30625) [2](https://arachnoboards.com/threads/leave-crickets-in-with-your-t.166314/) [3](https://arachnoboards.com/threads/grain-mite-explosion-in-tarantula-enclosures.363621) [4](https://arachnoboards.com/threads/all-you-need-to-know-about-mites.309211/) [5](https://www.thebts.co.uk/?p=339)

### 6. 忘了加水或喷雾，宠物就会脱水

- **涉及**：蜘蛛、螳螂　**频率**：非常常见　**价值/工作量**：high/S
- **问题**：忘了加水或喷雾，宠物就会脱水。捕鸟蛛脱水时腹部干瘪、腿往身下收（死亡蜷缩）；水盆会被蒸发，或被蛛丝、垫材悄悄吸干，不容易发现。螳螂湿度不足是卡皮最常见的原因，冬天开暖气更干，但喷多了又会发霉。不同品种、不同缸的干燥速度不一样，喷雾间隔从每天一次到每周一次都有，饲主很难记清上次是哪天喷的。
- **状态**：✅ 已实现（按审阅意见：蜘蛛默认只提醒水盆、不提醒喷雾，提醒只用信息级别）
- **改进思路（待评估）**：把「换水/清洁」拆成「加水/喷雾」和「清洁」两个记录类型（旧记录归入清洁）。宠物表单增加加水/喷雾间隔，按物种和阶段给默认值：螳螂 1 天，蜘蛛若体 3 天、成体 7 天，蛇 7 天换水。卡片像喂食一样显示「💧N天前」，超期就高亮。记录卡皮或卡蜕时，记录旁自动列出前 7 天的喷雾次数。如果最近的体况标为「腹部干瘪」，且近期没有加水记录，卡片提示「脱水风险，优先提供浅水盘饮水」。
- **注意：蜘蛛默认只做「水盆检查」，不默认喷雾；过度喷雾加通风差可能导致树栖蛛猝死。**
- **来源**：[1](https://arachnoboards.com/threads/what-are-the-signs-of-dehydration.163974/) [2](https://arachnoboards.com/threads/meaning-of-a-death-curl.48671) [3](https://arachnoboards.com/threads/death-curl-dehydration-and-recommendations.309344/page-2) [4](https://arachnoboards.com/threads/sling-is-walking-in-death-curl.339416/) [5](https://arachnoboards.com/threads/my-tarantulas-water-dishes-keep-drying-out.339555)

### 7. 温湿度和通风不对，是拒食、吐食、卡皮和若蛛猝死的头号原因，论坛上就有人说通风不足杀死的若蛛比什么都多

- **涉及**：蜘蛛、螳螂、蛇　**频率**：非常常见　**价值/工作量**：high/M
- **问题**：温湿度和通风不对，是拒食、吐食、卡皮和若蛛猝死的头号原因，论坛上就有人说通风不足杀死的若蛛比什么都多。但很少有人系统地记录：便宜的湿度计和指针式温度计常常不准；加热垫或温控器失灵会过热，甚至熔化饲养箱，往往等出了问题才发现，事后也查不到是哪段时间出的错。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：新增一个可选的「环境」记录类型，可填热区温度、冷区温度、湿度和备注（例如「已用第二个湿度计校准」），并提供一键「今日测温」。宠物档案增加可选的「饲养环境」：容器尺寸、侧面通风有无、垫材干湿（全干 / 一角湿 / 全湿）、有无水盆。每只宠物可设参考温湿度区间（按物种给默认值），录入时超出范围就标红。详情页画温湿度折线。查看拒食、吐食、卡皮、蜕皮不全的记录时，自动并排显示前 7 天的环境读数和平均湿度。卡片上可以选择显示「上次测温N天前」，超过设定天数时淡色提示。
- **来源**：[1](https://arachnoboards.com/threads/sling-mortality-long-post.278604) [2](https://www.tarantulaforum.com/threads/caribena-versicolor-died-again.40653) [3](https://arachnoboards.com/threads/sudden-death-of-c-versicolor-sling-did-i-do-something-wrong.314303/post-2871809) [4](https://arachnoboards.com/threads/versicolor-sling-dying.364237/page-3) [5](https://www.thetarantulacollective.com/tarantulainfo/mistakes)

### 8. 饲主想把记录导出成表格，用 Excel 排序、画图、打印，或者在转让个体时把它的完整记录交给买家；也想把多年的 Excel 历史导进新工具

- **涉及**：蜘蛛、螳螂、蛇　**频率**：非常常见　**价值/工作量**：high/M
- **问题**：饲主想把记录导出成表格，用 Excel 排序、画图、打印，或者在转让个体时把它的完整记录交给买家；也想把多年的 Excel 历史导进新工具。很多 App 只能导出 JSON，甚至根本不能导出，一旦停更，数据就困在里面了。
- **状态**：🟡 部分实现：Excel / CSV / 单只宠物导出；打印履历、CSV 导入待做
- **改进思路（待评估）**：设置页加「导出 CSV」：每条记录一行，包含编号、名字、物种、品种、日期时间、类型、食物、数量、结果、龄期、完整度、体重、备注；表头用中文并加 UTF-8 BOM，Excel 可以直接打开。宠物详情页加「导出此宠物」（JSON，含照片，对方导入后按 id 合并）和「打印履历」（打印友好的页面，包括基本信息、蜕皮表、喂食统计、体重/尺寸曲线，用 window.print 打印）。可选：提供 CSV 导入模板，用来批量建档、补录历史喂食和蜕皮日期，导入前先预览条数。
- **来源**：[1](https://arachnoboards.com/threads/so-i-made-an-application.256549/page-15) [2](https://arachnoboards.com/threads/so-i-made-an-application.256549/page-21) [3](https://arachnoboards.com/threads/data-recording-software.201380/post-1818388) [4](https://www.tarantulaforum.com/threads/t-logs.19257/) [5](https://arachnoboards.com/threads/record-keeping.299010/)

### 9. 缺少「今天该喂谁」的总览

- **涉及**：蜘蛛、螳螂、蛇　**频率**：非常常见　**价值/工作量**：high/M
- **问题**：缺少「今天该喂谁」的总览。饲主想一眼看到哪些已经逾期、今天到期、明天或本周到期、哪些处于暂停状态，以及每只下次该哪天喂，而不是自己逐张卡片去算。很多人为此用白板或便签，还希望能按「该喂了 / 预蜕皮 / 刚蜕皮 / 可交配 / 龄期 / 性别」排序和筛选。
- **状态**：🟡 部分：卡片显示下次喂食日，首页按待办排序，批量记录按逾期/今天/明天/7 天内分组
- **改进思路（待评估）**：卡片显示「下次喂食：周六（还有2天）」。首页加一个「喂食日」分组视图：已逾期 / 今天 / 明天 / 本周 / 暂停中（蜕皮前期、硬化期、冬化等），每组都可以一键全选，进入批量记录。首页增加排序（最该处理、下次喂食日、临近蜕皮、龄期、名字/编号）和筛选（物种、性别、阶段、自定义标签）。可以设一个「固定称重日」（例如每月第一个周一），当天首页显示「今日称重」清单。
- **来源**：[1](https://community.morphmarket.com/t/what-s-coming-and-morphmarket-nfs/25555?page=2) [2](https://apps.apple.com/app/id6759521717) [3](https://arachnoboards.com/threads/tarantula-tracking-spreadsheet.258941/) [4](https://arachnoboards.com/threads/how-does-everyone-else-track-their-data-molt-dates-feed-dates-random-notes-rehouse-dates-etc.374529/) [5](https://arachnoboards.com/threads/feeding-frequency.320444/)

### 10. 记录步骤一多，饲主就会懒得记、忘了记，最后弃用

- **涉及**：蜘蛛、螳螂、蛇　**频率**：非常常见　**价值/工作量**：high/S
- **问题**：记录步骤一多，饲主就会懒得记、忘了记，最后弃用。有人抱怨 iHerp「加一条要点太多下」，也有人说 ExotiKeeper「录详情录烦了」。每次手打食物名称和规格也很烦，饲主希望常用饵料点一下就能填好。论坛上的经验是：坚持多年的简单记录，比三个月后就弃用的完美表格更有价值。
- **状态**：✅ 本次：沿用上次食物、最近食物快捷按钮、撤销、今天/昨天/前天
- **改进思路（待评估）**：新建喂食记录时，食物和数量默认沿用这只宠物上一次的喂食。食物输入框上方显示它最近用过的 3 种食物（如「杜比亚 L×1」），点一下就填好；一键喂食也用上次的食物。保存后底部出现一个 5 秒的「已记录·撤销」提示。完整表单里把照片、备注等次要字段收进「更多」。
- **来源**：[1](https://community.morphmarket.com/t/what-does-everybody-use-for-record-keeping/8836) [2](https://www.tarantulaforum.com/threads/anyone-else-using-this-exotikeeper-app.26905/) [3](https://ball-pythons.net/forums/showthread.php?p=1994042) [4](https://ball-pythons.net/forums/showthread.php?p=2744182) [5](https://www.furrycritter.com/pages/articles/snakes/feeding_journal.htm)

### 11. 蛇长期拒食时（几周到几个月，球蟒有 9 个月的记录），社区共识是看体重趋势，不看拒食天数：只要不掉秤、没有病症，就不用慌

- **涉及**：蛇　**频率**：非常常见　**价值/工作量**：high/M
- **问题**：蛇长期拒食时（几周到几个月，球蟒有 9 个月的记录），社区共识是看体重趋势，不看拒食天数：只要不掉秤、没有病症，就不用慌。但多数人看不到「上次成功进食以来掉了多少克、百分之几」，也很难看出拒食、蜕皮和体重变化之间的对应关系；频繁试喂反而会加重应激。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：蛇的卡片和详情页显示「距上次成功进食N天·期间拒食N次·体重较上次进食时 −Xg（−Y%）」，降幅达到 5% 显示黄色，达到 10% 显示红色（只在页面内）。拒食期间超过 7 天没有体重记录时，详情页提示「建议称重」；连续拒食时，提示「可以拉长试喂间隔」。体重图上叠加标记：喂食●、拒食×、吐食▲、蜕皮用竖线。详情页加一张统计卡：近 90 天进食率、平均喂食间隔、体重变化速率（g/月）、平均蜕皮间隔。
- **来源**：[1](https://community.morphmarket.com/t/corn-snake-lost-100g-in-a-month-advice-needed/62859) [2](https://community.morphmarket.com/t/corn-not-eating/23828) [3](https://ball-pythons.net/forums/showthread.php?p=2788419) [4](https://ball-pythons.net/forums/showthread.php?p=2212189) [5](https://ball-pythons.net/forums/showthread.php?p=2741329)

### 12. 吐食和拒食不是一回事

- **涉及**：蛇　**频率**：非常常见　**价值/工作量**：high/S
- **问题**：吐食和拒食不是一回事。常见原因有喂后太早上手、猎物太大、喂得太勤、温度不对。吐食后要等 10 到 14 天再喂（再次吐食要等约 3 周），并换小一号的猎物；反复吐食就要看兽医。普遍建议喂后 48 到 72 小时内不要上手。现在的喂食结果里没有「吐食」，既记不下来，也没法据此调整后续喂食。
- **状态**：✅ 本次：「吐食」结果、休整期 14/21 天、消化期 72 小时勿上手、反复吐食提示就医
- **改进思路（待评估）**：喂食结果增加「吐食」，也可以在已吃的记录上补标吐食；可填进食后几小时吐的、当时温度、有没有上手或受到打扰。蛇进食后 72 小时内，卡片显示「消化中，勿上手（至X日X时）」。记录吐食后，下次建议喂食日自动推迟 14 天（30 天内第二次吐食推迟 21 天），这期间不计逾期，并提示「下次换小一号的猎物」。60 天内吐食 2 次及以上时，页面提示「反复吐食，建议就医」。可选新增「上手」记录类型，方便回头查吐食原因。
- **来源**：[1](https://forums.kingsnake.com/new-forums/view.php?id=1972431) [2](https://forums.kingsnake.com/view.php?id=2009267) [3](https://arachnoboards.com/threads/whats-wrong-with-my-corn.47505) [4](https://ball-pythons.net/forums/showthread.php?p=1775873) [5](https://community.morphmarket.com/t/possible-regurgitation-assistance/36662)

### 13. 卡蜕或蜕皮失败：腿、前足、触角或翅膀卡在旧皮里，常导致残疾、只能手喂，下次蜕皮也更容易再失败，严重时会死亡

- **涉及**：蜘蛛、螳螂　**频率**：非常常见　**价值/工作量**：high/M
- **问题**：卡蜕或蜕皮失败：腿、前足、触角或翅膀卡在旧皮里，常导致残疾、只能手喂，下次蜕皮也更容易再失败，严重时会死亡。饲主需要知道已经蜕了多久，才能判断要不要动手：干预太早会加重应激，等外壳硬化了又来不及。他们也想跟踪断肢在之后几次蜕皮中的再生情况。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：蜕皮记录增加「开始蜕皮」状态，记下翻身或倒挂的时间。卡片和详情页显示「正在蜕皮N小时」，超过参考时长（若虫约 6 小时，成体 12 到 24 小时，可修改）时标黄，并附一段简短的「何时该干预 / 不要干预」说明。蜕皮结束时选择结果：顺利 / 卡皮已处理 / 致残 / 死亡；卡住部位可以多选（前足、第几对步足、触角、翅、腹部）。致残的宠物可以加「残疾·需手喂」标签，卡片显示角标，喂食提示改为「手喂」。断肢在后续的蜕皮记录上显示「断肢后第N次蜕皮·再生中」。下次进入蜕皮前期时，提示「上次卡皮，注意湿度与悬挂空间」。详情页显示这只个体的蜕皮成功率。
- **注意：只记录蜕皮过程和结果，不给「何时干预」的阈值和指南。**
- **来源**：[1](https://arachnoboards.com/threads/tarantula-stuck-in-its-molt-look-here-for-advice.306038/) [2](https://arachnoboards.com/threads/post-molt-complications-and-why-you-should-intervene-asap-stuck-tarantula.314670/) [3](https://arachnoboards.com/threads/tarantula-stuck-in-molting-process-even-after-10-hours-need-urgent-help.367938/) [4](https://tarantulaforum.com/threads/help-my-tarantula-is-stuck-in-molt.40384) [5](https://arachnoboards.com/threads/how-long-before-helping-a-t-out-of-its-molt.293771/post-2622100)

### 14. 记录丢失是同类 App 最致命的差评：崩溃、更新或换手机后，几个月甚至几年的数据没了；恢复时丢照片，或者把已有数据覆盖掉

- **涉及**：蜘蛛、螳螂、蛇　**频率**：常见　**价值/工作量**：high/S
- **问题**：记录丢失是同类 App 最致命的差评：崩溃、更新或换手机后，几个月甚至几年的数据没了；恢复时丢照片，或者把已有数据覆盖掉。本项目的数据只存在浏览器的 IndexedDB 里，风险更大：清理浏览器数据就会丢失；iOS Safari 会清除 7 天没访问过的网站的脚本存储（添加到主屏的 Web App 单独计天数）。
- **状态**：✅ 本次：申请持久化存储、备份提醒横幅、导入预览、覆盖前自动快照、归档代替删除
- **改进思路（待评估）**：启动时调用 navigator.storage.persist()，在设置页显示「持久化存储：已授予 / 未授予」。每次导出时在 localStorage 记下 lastBackupAt；超过 14 天没备份且有新记录时，首页显示横幅「已N天未备份，点此导出」（只在页面内，不推送）。导入前先预览「宠物N只、记录N条、照片N张」；选「覆盖」时，先自动下载一份当前数据的快照。导入完成后显示各类记录的条数，方便核对。在 iOS 上，设置页引导用户「添加到主屏幕」使用。
- **来源**：[1](https://play.google.com/store/apps/details?id=com.reptilebuddy.app&hl=en_NZ) [2](https://www.facebook.com/TheReptileBuddy/) [3](https://play.google.com/store/apps/details?id=com.soloapplab.Arachnifiles) [4](https://apps.apple.com/us/app/arachnifiles-pet-tracker/id1617877723) [5](https://roshanranabhat.medium.com/why-im-building-a-reptile-tracking-app-even-though-i-don-t-own-reptiles-e8493efa9636)

### 15. 老玩家普遍看腹部（体况）决定喂不喂，而不是按固定日程

- **涉及**：蜘蛛、螳螂、蛇　**频率**：常见　**价值/工作量**：high/M
- **问题**：老玩家普遍看腹部（体况）决定喂不喂，而不是按固定日程。蜘蛛腹部过大时从高处摔下容易破裂，腹部干瘪则说明缺水或缺食；螳螂喂多了会加快蜕皮、缩短寿命，而抱卵的雌虫又需要吃很多；成年玉米蛇常因为喂得太勤、猎物太大而肥胖。固定的喂食间隔对这几种情况都不合适。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：喂食记录（也可以是任意记录）加一个「体况」快选：节肢类为腹部 干瘪 / 正常 / 饱满 / 过胖，蛇为 偏瘦 / 正常 / 偏胖。最近体况是饱满或过胖时，逾期计时顺延一个间隔，卡片显示「腹部饱满，可暂缓喂食」，不再标红。拒食但腹部饱满时，提示「可能只是吃饱了」；腹部干瘪时，提前提示喂食和加水。详情页显示体况随时间变化的色带，以及近 30 天的喂食次数。成年螳螂雌虫可以打开「抱卵/已交配」开关，改用更短的喂食间隔。成年蛇 90 天内体重持续上升超过约 5% 时，提示「可考虑延长投喂间隔」。
- **注意：不做「成年蛇体重上升就延长喂食间隔」，玉米蛇 2 岁后仍在生长，会误报。**
- **来源**：[1](https://arachnoboards.com/threads/can-you-over-feed-a-tarantula.105506/page-3) [2](https://arachnoboards.com/threads/what-happens-if-you-overfeed-tarantulas.354377) [3](https://arachnoboards.com/threads/huge-abdomens-can%E2%80%99t-feed-them-for-months-on-end.373506) [4](https://arachnoboards.com/threads/a-geniculata-abdomen-rupture.217705) [5](https://www.tarantulaforum.com/threads/how-often-is-too-often-to-feed.7697)

### 16. 繁殖玩家要记交配日期和对象，每个卵鞘或卵囊的产下日期和编号、冷藏起止日期、预计孵化日和孵化数量

- **涉及**：螳螂、蜘蛛　**频率**：常见　**价值/工作量**：medium/L
- **问题**：繁殖玩家要记交配日期和对象，每个卵鞘或卵囊的产下日期和编号、冷藏起止日期、预计孵化日和孵化数量。这些现在都记在日历、便签或另一张表上，和个体档案对不上。没交配过的雌虫产的卵鞘不育；只交配一次的话，后面卵鞘的受精率会一个比一个低。孵化时间随品种和温度差别很大：25℃ 以上约 1 个月，20℃ 左右要 1.5 到 2.5 个月；孵化过程可能持续一周，若虫还会从缝隙逃走。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：新增两种记录类型。「交配」：配偶可以从已有宠物里选，也可以手填外来个体；结果为成功 / 未成功 / 雄性被吃。「产卵鞘/卵囊」：自动编号；之前没有交配记录的标为「可能不育」；显示「交配后第N个卵鞘」，到第 3、4 个时提示「考虑再次交配」。卵鞘作为母体下的子条目，记录产下日期、冷藏起止日期和温度档，按品种的默认孵化天数推算「预计孵化窗口」，在详情页和日历上显示倒计时。快到时提示「检查防逃网，准备果蝇」；超过窗口很久仍未孵化，标为「可能不育，检查是否霉变」。孵化时记下若虫数量。雌性详情页显示繁殖小结：交配次数、卵鞘数量、上一个卵鞘距今多少天。
- **来源**：[1](https://mantidforum.net/threads/keeping-records.6834) [2](https://mantidforum.net/threads/taking-notes.7710) [3](https://mantidforum.net/threads/whats-the-most-oothecas-youve-had-hatch-with-only-1-mating.16091) [4](https://mantidforum.net/threads/once-bred-how-long-before-ooth.22408/post-167763) [5](https://mantidforum.net/threads/2nd-ootheca-from-my-mantis.34194)

### 17. 性别常常判断不准

- **涉及**：蜘蛛、螳螂　**频率**：常见　**价值/工作量**：medium/M
- **问题**：性别常常判断不准。捕鸟蛛要靠蜕皮上的受精囊来鉴定，蜕皮得在被咬坏之前取出、泡软、拍照，一般要 6、7 龄以后才可靠。螳螂靠数腹节：多数品种雌 6 节、雄 8 节，兰花螳螂雌 5 节、雄 6 节；低龄时节数还会变，要到 L4 到 L5 才能确认。饲主需要保存鉴定照片，区分「疑似」和「确认」，并在之后几龄复核。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：性别扩展为「未知 / 疑似♀ / 疑似♂ / 确认♀ / 确认♂」，并记下判定依据（蜕皮受精囊 / 腹节数 / 成熟特征 / 卖家标注）、判定日期和当时的龄期。任意记录的照片都可以「设为性别鉴定照」，在详情页集中查看。可选加一个「腹部照片对比」，把各龄带照片的记录并排显示。「疑似」的个体在下一次蜕皮后提示「可再确认性别」。蜘蛛龄期达到 5 以上时，记蜕皮会提示「可尝试用蜕皮鉴定性别（尽快取出蜕皮）」。
- **来源**：[1](https://tomsbigspiders.com/category/sexing) [2](https://johnbokma.com/articles/arachnids/sexing-tarantulas-using-molts.html) [3](https://arachnoboards.com/threads/how-to-request-species-or-sex-identification.372347) [4](https://arachnoboards.com/threads/can-you-determine-a-tarantulas-gender-even-when-its-still-a-sling.297719/) [5](https://tarantulas.su/en/sexing)

### 18. 螳螂的龄期很容易数乱：买来时不知道几龄，蜕皮漏记，偶尔还会跳龄；雌性通常比雄性多蜕 1 到 2 次（例如兰花螳螂雌 9 龄、雄 7 龄成虫）

- **涉及**：螳螂　**频率**：常见　**价值/工作量**：medium/S
- **问题**：螳螂的龄期很容易数乱：买来时不知道几龄，蜕皮漏记，偶尔还会跳龄；雌性通常比雄性多蜕 1 到 2 次（例如兰花螳螂雌 9 龄、雄 7 龄成虫）。饲主只能看翅芽来判断离成虫还差几次。末龄大约持续 3 周，要提前准备好羽化的空间。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：成虫龄期按性别分别设置，雌、雄各有默认值；性别未知时按较小的值提示「可能已接近成虫」。蜕皮记录加一个「形态标记」：出现翅芽 / 翅芽变大（亚成）/ 有完整翅（成虫）。选「有完整翅」就直接设为成虫，并开始显示「成虫第N天」。新增「龄期校正」操作：只改当前龄期，不新增蜕皮记录，在时间线上标出来。当前龄期等于成虫龄期减 1 时，标为「末龄（约3周），准备羽化攀爬空间」。卡片显示「还差N次蜕皮成虫」，推算出来的数字标「估计」。
- **来源**：[1](https://mantidforum.net/threads/how-many-molts-till-adult.9185) [2](https://mantidforum.net/threads/l1-l2-sub-adult-adult-huh.13329) [3](https://mantidforum.net/threads/what-to-expect-with-each-instar.19902) [4](https://mantidforum.net/threads/simple-question.22596) [5](https://mantidforum.net/goto/post?id=157581)

### 19. 成熟后的时间很关键

- **涉及**：蜘蛛、螳螂　**频率**：常见　**价值/工作量**：medium/M
- **问题**：成熟后的时间很关键。捕鸟蛛公蛛终蜕成熟后通常只能再活 1 年左右（母蛛能活 20 年以上），繁殖窗口很短。螳螂雄性比雌性早成熟，成虫后约 6 到 8 周就会老死；雌性却要在成虫后 1 到 3 周才适合交配，所以要提前靠控温、控食让雌雄同步成熟。饲主需要记下成熟日期，随时知道还剩多少时间。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：蜕皮记录可以勾选「终蜕/羽化（已成熟）」，这一天就记为成熟日，卡片显示「成虫/成熟第N天」。螳螂雄性满 14 天标「可交配」，满 42 天标「高龄，尽快配对」；雌性 14 到 21 天后标「可交配」（天数可按品种修改）。公蛛成熟满 9 个月标「繁殖窗口将尽」，并停止蜕皮预测。新增「配对规划」视图：选一雌一雄，并排显示两只的当前龄期、成熟日（已成熟的用实际日期，未成熟的按蜕皮间隔估算）和可交配窗口重叠的天数。重叠为零时提示「雄性会过早成熟，可以降温少喂，或者换一只更小龄的雄性」。
- **来源**：[1](https://arachnoboards.com/goto/post?id=2843182) [2](https://arachnoboards.com/threads/so-i-made-an-application.256549/page-15) [3](https://arachnoboards.com/threads/do-adults-molt.359221/) [4](https://www.scientificamerican.com/article/eaten-crushed-or-starved-male-tarantulas-trade-their-life-to-impregnate-a-mate/) [5](https://mantidforum.net/threads/can-mantids-breed-before-2-weeks.41215)

### 20. 很多球蟒和玉米蛇每年秋冬都会固定停食几个月（冬化或季节性停食），体重下降 5% 以内比较常见

- **涉及**：蛇　**频率**：常见　**价值/工作量**：medium/M
- **问题**：很多球蟒和玉米蛇每年秋冬都会固定停食几个月（冬化或季节性停食），体重下降 5% 以内比较常见。这段时间里，现有的逾期高亮、连续拒食警告和 14 天未排便警告会一直误报。冬眠前还要在降温前 2 到 3 周停喂（猎物越大，空腹时间越长）；冬眠期间要每周称重，看有没有脱水或消瘦。饲主也想把今年的停食期和往年对比。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：宠物状态增加「冬化/季节性停食」。开启后暂停喂食逾期、连续拒食和排便警告，卡片改为显示「冬化第N天·较开始时体重 −Y%」；超过 2 周没称重时提示称重，体重降幅达到 10% 时红色提示。另加一个「冬化计划」：输入计划的降温日期，按最后一餐的猎物大小倒推，显示「最后投喂日不晚于X月X日」（默认提前 14 到 21 天）。详情页按年份列出历次停食区间（起止日期、天数、体重变化百分比），方便和往年对比。
- **注意：只做冬化状态（暂停提醒、记录体重），不做冬化计划器。**
- **来源**：[1](https://ball-pythons.net/forums/showthread.php?p=2199881) [2](https://ball-pythons.net/forums/showthread.php?p=1838790) [3](https://ball-pythons.net/forums/showthread.php?p=1621327) [4](https://ball-pythons.net/forums/showthread.php?p=1621338) [5](https://www.furrycritter.com/pages/articles/snakes/feeding_during_cooling.htm)

### 21. 环境变化后的应激拒食常被误判

- **涉及**：蛇、蜘蛛　**频率**：常见　**价值/工作量**：high/S
- **问题**：环境变化后的应激拒食常被误判。新蛇到家后应该先静养 5 到 7 天，甚至两周，期间不上手，之后再尝试第一次投喂；有些蛇苗一直不开食，最后夭折。蜘蛛换缸后也可能几周不吃。现在入手当天首页就提示「还没有喂食记录」，也没有换缸的记录类型，无法用它来解释拒食。
- **状态**：🟡 部分：到家适应期（期间不提醒）、蛇 14 天未开食提示、显示开食日；换缸记录待做
- **改进思路（待评估）**：入手日期之后的 N 天为「适应期」（默认蛇 7 天、节肢类 3 天，可修改）。卡片显示「适应期第N天：勿上手，第X天可尝试首次投喂」，期间不计逾期，拒食也不计入连续拒食警告。到家后的第一条「已吃」记录自动标为「开食」，详情页显示「开食于X日（到家第N天）」；到家超过 14 天还没开食，才给出提示。新增「换缸/换盒」记录，可填新容器尺寸、附照片；之后 7 天显示「换缸适应期第N天」，拒食提示改为「可能是换缸应激」。
- **来源**：[1](https://community.morphmarket.com/t/new-corn-snake-feeding/44928) [2](https://community.morphmarket.com/t/suggestions-to-help-baby-corn-snake-eat-and-adjust-better/10463) [3](https://community.morphmarket.com/t/1mo-corn-snake-wont-eat/54724) [4](https://www.furrycritter.com/pages/articles/snakes/hatchling_feeding_schedule.htm) [5](https://forums.kingsnake.com/view.php?id=1989036)

### 22. 蛇蜕皮不全很常见：碎成几片、尾尖残留、眼罩残留

- **涉及**：蛇　**频率**：常见　**价值/工作量**：medium/S
- **问题**：蛇蜕皮不全很常见：碎成几片、尾尖残留、眼罩残留。处理方法是泡温水、放进湿枕套、提高湿度，不能硬撕，也不要用胶带粘。残留的眼罩常常要到下一次蜕皮才掉；连续几次蜕不干净，说明湿度长期偏低。现在只能记「完整/不完整」，记不下残留在哪里，也没有后续跟进。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：蛇的蜕皮记录改为「一整张/碎片」两档，残留部位可多选（左眼罩、右眼罩、尾尖、身体），处理方式可选（泡温水、湿枕套、就医），还可以填当时的湿度。有眼罩残留时，卡片上保留「待复查：左眼罩」标签，直到下一次蜕皮记录确认已脱落，或手动清除。连续 2 次蜕皮不全时，页面提示「检查湿度，并校准湿度计」。另外统计从蓝眼期开始到蜕皮用了多少天。
- **来源**：[1](https://ball-pythons.net/forums/showthread.php?p=2781741) [2](https://ball-pythons.net/forums/showthread.php?p=1343237) [3](https://ball-pythons.net/forums/showthread.php?p=1342744) [4](https://ball-pythons.net/forums/showthread.php?p=1175712) [5](https://ball-pythons.net/forums/showthread.php?p=1423353)

### 23. 蛇该喂多大的猎物，让新手很头疼

- **涉及**：蛇　**频率**：常见　**价值/工作量**：medium/S
- **问题**：蛇该喂多大的猎物，让新手很头疼。常用经验是猎物重量约为蛇体重的 10% 到 15%（幼蛇可以到 20%），并按蛇的体重从乳鼠升级到毛鼠、跳鼠。猎物太大容易吐食，而不同商家同一规格的鼠，重量可能差一倍。饲主手里没有「这一顿占体重百分之几」的数字。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：蛇的喂食记录加一个可选的「猎物重量（g）」，常用规格可以记住默认重量。保存时，用最近一次体重算出「猎物占体重X%」，显示在时间线上；低于 8% 或高于 20% 时着色提示。表单里根据当前体重显示参考区间「建议猎物 X 到 Y g（体重的10%到15%）」；如果常喂的规格已经接近区间下限，提示「可考虑升级到毛鼠或跳鼠」。
- **来源**：[1](https://ball-pythons.net/forums/showthread.php?p=1877781) [2](https://ball-pythons.net/forums/showthread.php?p=1584524) [3](https://ball-pythons.net/forums/showthread.php?p=1643856) [4](https://forums.kingsnake.com/new-forums/view.php?id=2021186) [5](https://community.morphmarket.com/t/when-i-should-up-to-fuzzies-for-my-2-month-old-kingsnake/55349)

### 24. 饲料会断档

- **涉及**：螳螂、蜘蛛、蛇　**频率**：常见　**价值/工作量**：medium/M
- **问题**：饲料会断档。果蝇培养瓶大约一个月后就会衰退或长螨，新开一瓶要一周左右才出虫，忘了续瓶，低龄螳螂若虫就没东西吃；蟋蟀死得快，蟑螂种群要一两个月才能稳定。冰箱里囤着几十只不同规格的冻鼠，也不清楚还剩多少、什么时候该补货。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：新增一个「饲料」页，按条目记录果蝇瓶、蟋蟀盒、杜比亚盒和各规格的冻鼠，包括开瓶或购入日期、数量、状态（正常 / 长螨 / 已弃）。果蝇瓶显示「开瓶第N天」；最新一瓶超过设定天数（默认 21 天）时，首页提示「该起新瓶了」。冻鼠按规格计数，喂食时选了这种饲料就自动扣减，低于阈值时首页提示补货。喂食表单的食物可以直接从饲料列表里选；「今日待喂」视图底部汇总今天需要准备的饵料数量。
- **来源**：[1](https://mantidforum.net/threads/my-culture-died-looking-for-feedback.38367) [2](https://mantidforum.net/threads/help-flightless-fruit-fly-culture-stopped-producing.42313) [3](https://mantidforum.net/threads/rotten-fruit-fly-culture.39901) [4](https://mantidforum.net/threads/emergency-problem-with-fruit-flies.38655) [5](https://mantidforum.net/threads/think-my-culture-is-culprit-behind-dying-nymphs.17726)

### 25. 除了喂食和蜕皮，饲主还要清残渣、换垫材、换缸

- **涉及**：蜘蛛、螳螂、蛇　**频率**：常见　**价值/工作量**：medium/S
- **问题**：除了喂食和蜕皮，饲主还要清残渣、换垫材、换缸。食团几天不清就会发霉、长螨、招蚤蝇；全面换垫材和换缸又不宜太频繁，否则会让宠物应激。「清洁/加水」混在一个类型里，就分不清每一项上次是什么时候做的。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：清洁记录分成几个子类型：清残渣/食团、换垫材、换缸/换盒（可填新容器的内尺寸），以及发现霉菌 / 螨虫 / 蚤蝇的标签。详情页显示「上次换垫材X个月前·上次换缸X天前」，时间线可以按子类型筛选。喂食后第二天如果还没有「清残渣」记录，给一个轻提示（只在页面内）。
- **来源**：[1](https://www.tarantulaforum.com/threads/how-often-should-i-change-my-ts-substrate.3812) [2](https://tarantulaforum.com/threads/when-to-replace-substrate.35356) [3](https://arachnoboards.com/threads/frequency-of-substrate-replacement.294353/) [4](https://arachnoboards.com/threads/juvenile-waste.292008/post-2597322) [5](https://arachnoboards.com/threads/how-often-should-i-clean-enclosure.193436/)

### 26. 蛇的排便间隔差别很大，取决于个体、年龄、餐量和温度：幼蛇两餐之间可能排便好几次；成年玉米蛇吃了大餐后两周甚至更久不排便也正常；蜕皮前常常憋着，等蜕完皮一起排

- **涉及**：蛇　**频率**：常见　**价值/工作量**：medium/S
- **问题**：蛇的排便间隔差别很大，取决于个体、年龄、餐量和温度：幼蛇两餐之间可能排便好几次；成年玉米蛇吃了大餐后两周甚至更久不排便也正常；蜕皮前常常憋着，等蜕完皮一起排。固定的「进食后 14 天未排便」警告，对成年蛇大餐后、蜕皮前和冬季容易误报，对幼蛇又反应太慢。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：警告阈值按个体计算：取这条蛇历史上「进食到排便」间隔的中位数，乘 1.5 到 2 作为警告线；没有历史时按阶段用默认值（幼体 7 天，成体 14 到 21 天）。处于蓝眼期或蜕皮后 3 天内时自动顺延，并注明「蜕皮前常憋便」；冬化状态下不警告。卡片显示「本餐后已排便N次」。到了喂食日、上一餐却还没排便时，提示「可以等排便后再喂」。警告里附上需要排查的项：有没有腹胀、嗜睡，温度是否合适。
- **来源**：[1](https://enviroliteracy.org/animals/why-hasn-t-my-corn-snake-pooped-in-2-weeks/) [2](https://community.morphmarket.com/t/baby-corn-snake-poop/10590) [3](https://community.morphmarket.com/t/snake-constipation/17952) [4](https://ball-pythons.net/forums/showthread.php?p=1181948) [5](https://ball-pythons.net/forums/showthread.php?p=1100230)

### 27. 螳螂蜕皮需要倒挂的空间：饲养盒高度至少要有体长的 3 倍，顶部要能抓牢（光滑的塑料顶要贴一块网布）

- **涉及**：螳螂　**频率**：常见　**价值/工作量**：medium/S
- **问题**：螳螂蜕皮需要倒挂的空间：饲养盒高度至少要有体长的 3 倍，顶部要能抓牢（光滑的塑料顶要贴一块网布）。否则蜕皮时会掉下来或触底，导致畸形甚至死亡。若虫长大后，饲主常常忘了换大盒子。新手也不清楚蜕皮前要清空活饵、适当加湿、不要打扰。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：螳螂的档案或换盒记录可以填「饲养盒内高（cm）」，蜕皮或测量记录可以填体长。盒高不到体长的 3 倍时，卡片提示「空间可能不足以倒挂蜕皮，考虑换盒」。进入蜕皮前期时，显示一份可勾选的「蜕皮准备清单」：取出活饵、检查顶网能否抓牢、确认倒挂高度、适度喷雾、不要打扰；勾选结果随记录保存。
- **来源**：[1](https://www.furrycritter.com/pages/articles/invertebrates/mantis_height_needs.htm) [2](https://www.furrycritter.com/pages/products_gear/invertebrates/praying_mantis_chinese_housing.htm) [3](https://www.furrycritter.com/pages/products_gear/invertebrates/praying_mantis_ghost_housing.htm) [4](https://arachnoboards.com/threads/praying-mantis-dead.314575/) [5](https://arachnoboards.com/threads/my-mantis-nymph-died-molting-why.318856/)

### 28. 蜘蛛和螳螂的生长要看体长或对角腿展（DLS），最方便的方法是每次蜕皮后量蜕下的皮

- **涉及**：蜘蛛、螳螂　**频率**：常见　**价值/工作量**：medium/S
- **问题**：蜘蛛和螳螂的生长要看体长或对角腿展（DLS），最方便的方法是每次蜕皮后量蜕下的皮。但饲主缺少一个地方来记录这些数据、查看生长曲线，不像蛇可以直接称体重。同一窝的个体，在不同的温度和喂食条件下，生长差距可以很大。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：蜕皮记录和新增的「测量」记录加上「体长/腿展（cm）」，并注明是量蜕皮还是量活体。蜘蛛和螳螂的详情页复用现有的 WeightChart 组件画尺寸曲线，标出蜕皮点，横轴可以选日期或龄期。卡片显示最近一次的尺寸。螳螂的体长同时用于盒高检查。
- **来源**：[1](https://arachnoboards.com/threads/how-do-you-measure-a-tarantula.214193) [2](https://tarantulaforum.com/threads/could-we-put-together-a-size-guide.24334/page-2) [3](https://www.furrycritter.com/pages/articles/invertebrates/size_tracking.htm) [4](https://tarantulaforum.com/media/l-klugi-measured-after-latest-molt.4961) [5](https://arachnoboards.com/threads/adult-tarantula-max-size-question.370288/)

### 29. 螨虫是饲主最怕的问题之一，可能来自新个体、展会、饲料鼠或垫材；谷螨也会从饲料盒扩散到整个饲养间

- **涉及**：蛇、蜘蛛　**频率**：常见　**价值/工作量**：medium/M
- **问题**：螨虫是饲主最怕的问题之一，可能来自新个体、展会、饲料鼠或垫材；谷螨也会从饲料盒扩散到整个饲养间。主流做法是新个体隔离 90 天，中途出问题就重新计时，结束前做粪检或看兽医；除螨要连续处理好几轮，还要消毒饲养箱。这种跨好几周的流程很难靠记忆跟踪。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：宠物状态增加「隔离中」，卡片显示「隔离第N/90天」，并提供「重置计时」按钮。新增「健康/治疗」记录类型：问题（螨虫、呼吸道感染、口腔炎、外伤、其他）、处理方式或用药、下次复查日。带复查日的记录汇总到首页的「待办」区（例如「第2轮除螨：还有3天」），完成后勾掉。
- **注意：处理方式和用药只做自由文本，应用不给药名、剂量或疗程。**
- **来源**：[1](https://ball-pythons.net/forums/showthread.php?p=2114741) [2](https://ball-pythons.net/forums/showthread.php?p=1655421) [3](https://ball-pythons.net/forums/showthread.php?p=1976017) [4](https://thamnophis.com/forum/showthread.php?p=245049) [5](https://ball-pythons.net/forums/showthread.php?p=2029031)

### 30. 养的数量一多，App 里的名字就很难和架子上几十个盒子对上号

- **涉及**：蜘蛛、螳螂、蛇　**频率**：常见　**价值/工作量**：medium/S
- **问题**：养的数量一多，App 里的名字就很难和架子上几十个盒子对上号。不少人在盒子上贴便签或索引卡（有人甚至画上花纹以免搞混），或者用字母代码配合 Excel，但纸上和电子记录还是对不上。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：宠物加一个「编号/盒号」字段（如 S01、A-03），在卡片上醒目显示，可以按编号搜索和排序。设置页加「打印标签」，生成可打印的页面，内容包括编号、名字、品种、性别、孵化或入手日期、上次蜕皮日期；用浏览器打印后贴到盒子上。
- **来源**：[1](https://mantidforum.net/threads/mantis-record-keeping.43062/post-328675) [2](https://mantidforum.net/threads/keeping-records.6834) [3](https://mantidforum.net/threads/taking-notes.7710) [4](https://arachnoboards.com/threads/how-does-everyone-else-track-their-data-molt-dates-feed-dates-random-notes-rehouse-dates-etc.374529/) [5](https://arachnoboards.com/threads/how-does-everyone-else-track-their-data-molt-dates-feed-dates-random-notes-rehouse-dates-etc.374529/page-2)

### 31. 档案字段不够用

- **涉及**：蜘蛛、螳螂、蛇　**频率**：偶见　**价值/工作量**：low/S
- **问题**：档案字段不够用。饲主想记来源（卖家、展会）、价格、性格（温顺、易惊、防御性强）、亲本，以及购入前已知的最近一次蜕皮日期。卖家很少提供蜕皮记录，这也是新买的个体拒食时很难判断原因的一个原因。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：档案增加以下字段：来源/卖家；购入价格（可选）；性格标签（多选，可自定义）；自定义标签（如「A架」「待售」，首页可按标签筛选）；父母个体（从已有宠物中选）；「入手前已知的最近一次蜕皮日期」，这个日期参与计算距上次蜕皮天数和蜕皮预测。
- **来源**：[1](https://arachnoboards.com/threads/so-i-made-an-application.256549/page-19) [2](https://arachnoboards.com/threads/so-i-created-a-web-app-to-manage-my-small-collection.358769/) [3](https://arachnoboards.com/threads/how-does-everyone-else-track-their-data-molt-dates-feed-dates-random-notes-rehouse-dates-etc.374529/) [4](https://www.tarantulaforum.com/threads/anyone-else-using-this-exotikeeper-app.26905/) [5](https://arachnoboards.com/threads/record-keeping.299010/)

### 32. 挖洞型的捕鸟蛛会封洞几个月不露面，饲主看不到它是死是活、有没有蜕皮

- **涉及**：蜘蛛　**频率**：偶见　**价值/工作量**：medium/S
- **问题**：挖洞型的捕鸟蛛会封洞几个月不露面，饲主看不到它是死是活、有没有蜕皮。蜕下的皮常常埋在洞底，换缸时才发现，导致蜕皮日期和龄期记录不准。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：新增「观察到」快捷记录和「封洞」状态。封洞期间，卡片显示「已封洞N天」，不再显示喂食逾期；也可以选择显示「N天未见」。蜕皮记录支持「事后发现·日期不确定」，可以填一个大致的日期区间；这类蜕皮在间隔表里标「约」，不参与蜕皮预测。
- **来源**：[1](https://arachnoboards.com/threads/how-to-know-my-tarantula-isnt-dead.374535/) [2](https://www.tarantulaforum.com/threads/tarantula-buried-for-more-than-7-months.41036) [3](https://arachnoboards.com/threads/grammastola-pulchra-buried.370148/page-2) [4](https://arachnoboards.com/threads/how-long-will-she-be-in-her-hole-for-i-havent-seen-her-in-over-a-week-should-i-be-worried.339183) [5](https://arachnoboards.com/threads/best-way-to-keep-up-with-molt-cycles.285548/post-2504924)

### 33. 看爬宠兽医时，兽医需要完整的病史：投喂情况（包括拒食和吐食）、体重趋势、蜕皮日期和质量、饲养环境参数

- **涉及**：蛇、蜘蛛、螳螂　**频率**：偶见　**价值/工作量**：medium/M
- **问题**：看爬宠兽医时，兽医需要完整的病史：投喂情况（包括拒食和吐食）、体重趋势、蜕皮日期和质量、饲养环境参数。爬宠兽医少，第一次就诊尤其依赖这些记录，饲主临时翻手机很难整理出来。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：详情页加一个「就诊摘要」按钮，在本地生成一页可以打印或截图的摘要，内容包括：基本信息；近 6 个月的喂食、拒食、吐食统计和明细；体重曲线；蜕皮历史和不全情况；最近的环境读数；异常排便和健康记录。这一页可以和「打印履历」共用模板。另外新增「就诊」记录类型，记下诊断、医嘱和复诊日期。
- **来源**：[1](https://en.wikivet.net/Lizard_History_Taking) [2](https://www.furrycritter.com/pages/articles/snakes/feeding_records.htm) [3](https://www.furrycritter.com/pages/articles/snakes/annual_health_checkups.htm) [4](https://creatures.com/learn/care/how-to-find-a-reptile-vet)

### 34. 一个螳螂卵鞘能孵出几十到几百只若虫

- **涉及**：螳螂　**频率**：偶见　**价值/工作量**：low/L
- **问题**：一个螳螂卵鞘能孵出几十到几百只若虫。群养会互相残食，正在蜕皮的最危险，所以通常群养到 L3 到 L4 再分开，死亡率很高。不可能给每一只都建档，可分开之后又要给几十个杯子分别记录。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：宠物增加「批次」类型：一张卡片代表一窝或一杯，带「当前数量」字段，可以快速记录「死亡/被残食/送出 −N」，并显示存活率。批次的龄期以多数个体为准，到 L3 时提示「考虑分开饲养」。可以「拆分」出单只个体，拆出的个体自动继承品种、孵化日期、龄期和来源卵鞘。
- **来源**：[1](https://mantidforum.net/threads/when-to-separate-mantis-nymphs.41546) [2](https://mantidforum.net/threads/how-soon-do-you-seperate-nymps.1320) [3](https://mantidforum.net/threads/egg-hatching-newbie-when-to-separate-mantids.24908) [4](https://mantidforum.net/threads/questions-about-newborn-mantids.25316) [5](https://mantidforum.net/threads/chinese-mantis-ooth-hatched-and-i-cannot-handle-all-of-them-so-who-wants-nymphs.23260)

### 35. 出门前，饲主不知道每只宠物能撑多久（L1 到 L2 的螳螂若虫、蜘蛛若体和幼蛇最怕断食），不知道活饵该不该留，托人照看时也不知道要写清哪些信息

- **涉及**：蜘蛛、螳螂、蛇　**频率**：偶见　**价值/工作量**：low/M
- **问题**：出门前，饲主不知道每只宠物能撑多久（L1 到 L2 的螳螂若虫、蜘蛛若体和幼蛇最怕断食），不知道活饵该不该留，托人照看时也不知道要写清哪些信息。回来以后，也不清楚这期间各只宠物错过了哪些照料。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：新增「外出计划」：输入出发和返回日期，列出期间会到期的宠物，并标出高风险个体（低龄若虫、蜘蛛若体、幼蛇、正处于蜕皮前期的）。附一份出发前清单：取出所有活饵、加满水、蛇出发前几天不喂。还可以生成一张可打印的「照看说明」，写明每只的编号、位置、食物、喂食频率和注意事项。
- **来源**：[1](https://arachnoboards.com/threads/caring-for-spiders-when-on-vacation.364995) [2](https://tarantulaheaven.com/how-to-go-on-vacation-with-your-pet-tarantula) [3](https://mantidforum.net/threads/feeding-whilst-on-holiday.2262) [4](https://mantidforum.net/threads/what-do-you-when-youre-leaving-for-a-week.36776) [5](https://mantidforum.net/threads/how-long-can-nymphs-go-without-food.37445)

### 36. 让蛇从活饵改吃冻鼠，或者换一种猎物，往往要试好几周

- **涉及**：蛇　**频率**：偶见　**价值/工作量**：low/S
- **问题**：让蛇从活饵改吃冻鼠，或者换一种猎物，往往要试好几周。常用技巧有先喂现杀的、把冻鼠加热到 30℃ 左右、用吹风机吹热、蘸鸡汤、放进躲避屋过夜。饲主需要知道哪种猎物状态和投喂方式成功过，但现在只能记食物名称。
- **状态**：⬜ 计划中
- **改进思路（待评估）**：蛇的喂食记录加两个可选标签：猎物状态（活饵 / 现杀 / 冻品解冻）和投喂方式（镊子晃动 / 放置过夜 / 加热 / 蘸汤 / 箱内或箱外）。详情页按「状态加方式」的组合统计成功率（例如「冻鼠+放置过夜 3/4」），帮助找到这条蛇肯吃的方式。
- **来源**：[1](https://ball-pythons.net/forums/showthread.php?p=1154329) [2](https://ball-pythons.net/forums/showthread.php?p=2714995) [3](https://ball-pythons.net/forums/showthread.php?p=1367450) [4](https://community.morphmarket.com/t/help-with-switching-to-f-t-food/4266) [5](https://lr.us.psf.lt/r/ballpython/comments/1dcrszo/how_do_i_switch_to_ft)

### 37. 补录过去的日期很麻烦，编辑历史记录也容易出错

- **涉及**：蜘蛛、螳螂、蛇　**频率**：偶见　**价值/工作量**：low/S
- **问题**：补录过去的日期很麻烦，编辑历史记录也容易出错。有的 App 把最后录入的那条当成最新体重，而不是按记录日期判断；有的改了旧记录，原记录却没了；日期选择器也很繁琐。
- **状态**：🟡 部分：今天/昨天/前天快捷按钮
- **改进思路（待评估）**：在记录表单的时间旁加「今天 / 昨天 / 前天」快捷按钮。记录保存修改时间（updatedAt），编辑过的记录在时间线上用小字标注。
- **来源**：[1](https://www.appbrain.com/app/reptile-buddy/com.reptilebuddy.app) [2](https://play.google.com/store/apps/details?id=com.reptilebuddy.app&hl=en_NZ) [3](https://roshanranabhat.medium.com/why-im-building-a-reptile-tracking-app-even-though-i-don-t-own-reptiles-e8493efa9636)

### 38. 饲主反感广告和游戏化元素（打卡、连胜、商店推送），也反感按动物数量收费的订阅（免费版常常只能养 1 到 15 只），还不愿把记录存在别人的服务器上

- **涉及**：蜘蛛、螳螂、蛇　**频率**：偶见　**价值/工作量**：low/S
- **问题**：饲主反感广告和游戏化元素（打卡、连胜、商店推送），也反感按动物数量收费的订阅（免费版常常只能养 1 到 15 只），还不愿把记录存在别人的服务器上。
- **状态**：✅ 设计约束：无账号、无服务器、不限数量、不做游戏化
- **改进思路（待评估）**：保持现状，并把它当作设计约束：不加打卡、连胜、等级之类的游戏化元素。可以在设置页「数据备份」的说明里补一句「无账号、无服务器、不限数量」。
- **来源**：[1](https://play.google.com/store/apps/details?id=com.soloapplab.Arachnifiles) [2](https://appshunter.io/ios/app/tarantuverse/id6756224640) [3](https://apps.apple.com/us/app/id1558082005) [4](https://www.reptileforums.co.uk/threads/great-app-to-keep-track-of-feeding-and-more.1013257/) [5](https://roshanranabhat.medium.com/why-im-building-a-reptile-tracking-app-even-though-i-don-t-own-reptiles-e8493efa9636)

## 实现时的安全原则

- 不做诊断、不给用药建议；涉及健康的提示只建议「咨询有经验的饲主或兽医」。
- 卡蜕只记录过程和结果，不提示何时人工干预（论坛内争议大，处理不当会致死）。
- 不鼓励给蜘蛛过度喷雾（与通风不良一起可能导致猝死）。
- 所有提醒只显示在网页内，不推送。
