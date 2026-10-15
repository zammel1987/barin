import type { Species } from './types'

export interface BreedGuide {
  id: string
  species: Species
  name: string
  scientificName: string
  aliases: string[]
  tags: string[]
  summary: string
  identification?: string
  origin: string
  habitat: string
  activity: string
  diet: string
  behavior: string
  housing: string
  care: string
  caution: string
  sources: { title: string; url: string }[]
}

// 内置资料随应用缓存，离线也能查看；仅供了解品种，不改写个人的喂食和护理设置。
export const BREED_REVIEWED_AT = '2026-10-16'
export const BREED_GUIDES: BreedGuide[] = [
  {
    id: 'gbb', species: 'spider', name: '红绿橙（GBB）', scientificName: 'Chromatopelma cyaneopubescens',
    aliases: ['GBB', '红绿橙', 'GBB红绿橙', 'Green Bottle Blue', 'Greenbottle Blue'],
    tags: ['地栖', '大量结网', '偏干燥', '反应敏捷'],
    summary: '蓝色步足、蓝绿色背甲与橙色腹部形成鲜明对比；会把躲避和周围支点连成大片丝网。',
    origin: '委内瑞拉北部帕拉瓜纳半岛', habitat: '地面及低矮灌木根部', activity: '常停留在丝网上，受惊可能快速躲避',
    diet: '与体型相配的蟋蟀、蟑螂等饲料昆虫',
    behavior: '捕食反应通常积极，受扰时可能逃窜或踢毛；观赏应以隔盒观察为主。',
    housing: '采用地栖布局，提供低矮软木、枝条等结网支点，限制坠落高度；保留饮水盆。',
    care: '保持通风，亚成和成体底材以偏干为主；幼体需特别留意补水，避免全盒长期湿透。',
    caution: '大量结网不表示它是树栖种；换盒时先准备接应盒，避免直接用手接触。',
    sources: [
      { title: 'Tom’s Big Spiders：GBB 饲养观察', url: 'https://tomsbigspiders.com/2014/07/31/c-cyaneopubescens-husbandry-gbb/' },
      { title: 'Jamie’s Tarantulas：GBB 品种资料', url: 'https://jamiestarantulas.com/wordpress/2021/08/19/chromatopelma-cyaneopubescens-green-bottle-blue-gbb-care-sheet/' },
    ],
  },
  {
    id: 'purple-pinktoe', species: 'spider', name: '厄瓜多尔紫粉趾', scientificName: 'Avicularia purpurea',
    aliases: ['厄紫', '厄瓜多尔紫', '厄瓜多尔紫树蛛', 'Purple Pinktoe', 'Ecuadorian Purple'],
    tags: ['树栖', '纵向空间', '需要对流通风', '可能跳跃'],
    summary: '具有紫蓝色光泽的树栖捕鸟蛛，喜欢依附树皮、叶片等结构建立高处的丝巢。',
    origin: '厄瓜多尔亚马逊地区', habitat: '树洞、树皮和叶片之间', activity: '在高处丝巢附近活动，幼体也可能跳跃',
    diet: '与体型相配的饲料昆虫',
    behavior: '通常以躲避应对干扰，受惊可能快速移动、跳跃或喷射排泄物。',
    housing: '采用树栖纵向布局，放置直立软木和结网支点；顶部与侧面均需有通风孔。',
    care: '兼顾饮水与空气流通，避免把热带栖息地理解为密闭、闷湿的饲养盒；底材不可泡水。',
    caution: '开盒、换盒前检查丝巢位置，避免撕坏巢；喷雾不应替代通风和饮水。',
    sources: [
      { title: 'Fear Not Tarantulas：紫粉趾资料与饲养说明', url: 'https://fearnottarantulas.com/pages/avicularia-purpurea-purple-pinktoe-tarantula' },
      { title: 'Appalachian Tarantulas：紫粉趾通风与布局', url: 'https://www.appalachiantarantulas.com/care-guides/avicularia-purpurea' },
    ],
  },
  {
    id: 'corn-snake', species: 'snake', name: '玉米蛇', scientificName: 'Pantherophis guttatus',
    aliases: ['Corn Snake', '玉米锦蛇'],
    tags: ['地栖兼攀爬', '晨昏活动', '单独饲养', '善于钻缝'],
    summary: '花色变化丰富的无毒游蛇，既会在地面和躲避中活动，也善于利用枝条攀爬。',
    origin: '主要分布于美国东南部', habitat: '林地、田野及有遮蔽物的地面', activity: '主要在清晨和黄昏活动',
    diet: '与个体体型相配的解冻鼠类',
    behavior: '通常较平和，但需要安全躲避；新到家或蜕皮时可能更容易紧张。',
    housing: '单养，使用牢固防逃的箱体；提供冷暖两端、躲避、饮水和稳固攀爬结构，允许身体充分伸展。',
    care: '热源配温控并分别监测冷暖端温度；保持通风，蜕皮时可提供湿躲避。',
    caution: '进食后和蜕皮期间减少打扰；蓝眼与躲藏不能单独作为疾病判断依据。',
    sources: [
      { title: 'RSPCA：玉米蛇饲养与行为', url: 'https://www.rspca.org.uk/adviceandwelfare/pets/other/cornsnake' },
      { title: 'ReptiFiles：玉米蛇资料', url: 'https://reptifiles.com/care-guides/corn-snake' },
    ],
  },
  {
    id: 'california-kingsnake', species: 'snake', name: '加州王蛇', scientificName: 'Lampropeltis californiae',
    aliases: ['California Kingsnake', 'California King Snake', '加州王', 'Lampropeltis getula californiae'],
    tags: ['地栖兼攀爬', '捕食其他蛇', '必须单养', '活动时段可变'],
    summary: '常见深浅相间的环带或条纹；是会捕食其他蛇类的无毒绞杀型蛇。',
    origin: '美国西部及墨西哥北部', habitat: '荒漠、草地、林地等多种环境', activity: '春秋可白天活动，炎热季节更偏夜间',
    diet: '野外食谱广，圈养通常使用适合体型的解冻鼠类',
    behavior: '主要在地面活动，也能攀爬；受惊可能振尾、嘶鸣或释放麝臭。',
    housing: '与其他蛇严格分开饲养；提供安全躲避、防逃结构及可选择的冷暖区域。',
    care: '保持清洁饮水，观察进食、体况和蜕皮；结合个体情况设置护理与喂食间隔。',
    caution: '“王蛇”涵盖多个物种，不能把所有王蛇自动匹配为加州王蛇；请先确认具体种类。',
    sources: [
      { title: '洛杉矶动物园：加州王蛇', url: 'https://lazoo.org/explore-your-zoo/our-animals/reptiles/california-kingsnake/' },
      { title: '圣迭戈动物园：王蛇行为与生态', url: 'https://animals.sandiegozoo.org/animals/kingsnake?qt-animals_page_content_tabs=1' },
    ],
  },
  {
    id: 'ghost-mantis', species: 'mantis', name: '高冠幽灵螳螂', scientificName: 'Phyllocrania paradoxa',
    aliases: ['高冠幽灵螳', '高冠幽灵', '幽灵螳螂', '幽灵螳', 'Ghost Mantis', '高冠幽灵螳螂（Phyllocrania paradoxa）'],
    tags: ['枯叶拟态', '伏击捕食', '偏好飞虫', '倒挂蜕皮'],
    summary: '高耸、扭曲的头冠和叶片状身体像一片干枯树叶；常在枝条上静止伪装，等待猎物进入捕捉范围。',
    origin: '非洲及马达加斯加', habitat: '枝条、灌丛和叶片之间', activity: '常在枝条或盒顶倒挂，较少主动追逐猎物',
    diet: '幼体果蝇，较大个体可用家蝇、丽蝇等适口飞虫',
    behavior: '擅长伪装和伏击，过大的猎物可能使其退缩；即使同类相食风险较低也应优先单养。',
    housing: '提供可抓附的顶部和枝条，盒高至少约体长三倍；悬挂点下留足蜕皮净空。',
    care: '以细雾形成可饮水珠，同时保持通风和干湿变化；根据盒体蒸发情况调整喷雾。',
    caution: '蜕皮前后不要移动饲养盒或留下活饵；不要因不主动追食就连续增加投喂。',
    sources: [
      { title: 'PanTerra Pets：幽灵螳螂饲养观察', url: 'https://www.panterrapets.com/pages/ghost-mantis-caresheet' },
      { title: 'Royal Veterinary Center：幽灵螳螂资料', url: 'https://royalveterinarycenter.com/en/care-sheets/praying-mantis' },
    ],
  },
  {
    id: 'budwing-mantis', species: 'mantis', name: '芽翅螳螂（Budwing）', scientificName: 'Parasphendale sp.',
    aliases: ['芽翅螳螂', '芽翅螳', 'Budwing Mantis', 'Budwing', '芽翅螳螂（Budwing mantis）'],
    tags: ['雌虫短翅', '主动追猎', '单独饲养', '种级待确认'],
    summary: '常见饲养种多呈褐色斑驳外观；成年雌虫体形较壮、翅短，雄虫较纤细且有可飞行的长翅。',
    identification: 'Budwing mantis 是英文俗名，常用于 Parasphendale affinis、P. agrionina 等近似种。当前仅确认到 Parasphendale 属，具体种名需核对卖家的拉丁名标签；这里展示常见饲养种的共通要点。',
    origin: '东非；具体分布依种而异', habitat: '灌丛、枝条及其他植被', activity: '捕食较主动，会接近或追逐移动的猎物',
    diet: '幼体用适口果蝇，较大个体可用苍蝇、小蟋蟀、蟑螂等饲料昆虫',
    behavior: '雌虫常有较强捕食反应，受扰可能展开前足和短翅示威；成年雄虫易受惊飞走。',
    housing: '单独饲养，提供枝条和活动空间；盒高至少约体长三倍、宽至少约两倍，并保留倒挂蜕皮净空。',
    care: '保持温暖、通风，以少量喷雾提供饮水珠；按腹部饱满程度调节投喂，避免因追食积极而持续加餐。',
    caution: '短翅是成年雌虫的常见特征，不等于尚未羽化；避免混养，蜕皮前后及时取出活饵。',
    sources: [
      { title: 'Keeping Insects：芽翅螳螂两种近似种及饲养说明', url: 'https://www.keepinginsects.com/praying-mantis/species/budwing-mantis/' },
      { title: 'Mantid Kingdom：Parasphendale agrionina 饲养观察', url: 'https://mantidkingdom.com/mantid-care/parasphendale-agrionina/' },
    ],
  },
  {
    id: 'african-twig-mantis', species: 'mantis', name: '非洲树枝螳螂', scientificName: 'Popa spurca',
    aliases: ['非洲树枝螳', '非洲枝螳螂', 'African Twig Mantis', 'African Twig Mantid', '非洲树枝螳螂（African twig mantis）'],
    tags: ['树枝拟态', '偏好飞虫', '枝条栖居', '单独饲养'],
    summary: '细长身体、褐色纹理和伸展姿态像枯树枝，停在枝条间时不容易被发现；成年雄虫通常比雌虫更纤细。',
    origin: '非洲', habitat: '灌丛和树枝之间', activity: '常借枝条伪装，在栖木附近捕食',
    diet: '幼体果蝇，随体型增大可改用家蝇、丽蝇等适口飞虫',
    behavior: '雌虫腹部较壮、翅较短，雄虫较细长且翅较长；仍有同类相食风险，应分盒饲养。',
    housing: '提供与身体相衬的细枝、可抓附的顶部及下方净空；盒高至少约体长三倍，宽至少约两倍。',
    care: '保持温暖、通风和干湿变化，少量喷雾形成饮水珠；无需把整个饲养盒长期维持在闷湿状态。',
    caution: '身体细长是拟态特征，不能仅凭“看起来瘦”持续加餐；先观察腹部和实际进食。“非洲巨型树枝螳”等名称可能指其他种，不能混用资料。',
    sources: [
      { title: 'Fatal Mantis：Popa spurca 饲养与行为观察', url: 'https://www.fatalmantis.com/twig-1' },
    ],
  },
  {
    id: 'rhombodera-basalis', species: 'mantis', name: '基菱背螳（马来西亚巨盾螳）', scientificName: 'Rhombodera basalis',
    aliases: ['基菱背螳', '基菱斧螳', '马来西亚巨盾螳', 'Malaysian Shield Mantis', 'Giant Malaysian Shield Mantis'],
    tags: ['宽盾形前胸', '枝叶栖居', '捕食积极', '单独饲养'],
    summary: '体形较大的绿色螳螂，前胸背板向两侧扩展，形成醒目的叶片状盾形轮廓，常在枝叶间攀附和捕食。',
    origin: '东南亚，见于马来西亚等地', habitat: '灌丛、树木和枝叶之间', activity: '会在枝叶间移动，也会主动捕捉经过的昆虫',
    diet: '按体型选择果蝇、苍蝇、小蟋蟀或蟑螂等饲料昆虫',
    behavior: '捕食反应较积极，个体性情有差异；有同类相食风险，应单独饲养。',
    housing: '提供稳固枝条和可抓附的顶部，随体型扩大空间；盒高至少约体长三倍、宽至少约两倍，悬挂点下留出蜕皮净空。',
    care: '保持温暖、适当水分与充分通风，用少量喷雾提供饮水机会；按实际蒸发和腹部饱满程度调整照顾与投喂。',
    caution: '捕食积极不表示需要持续加餐；蜕皮前后减少干扰并及时取出活饵，避免闷湿和底材积水。',
    sources: [
      { title: 'Insectarium：Rhombodera basalis 饲养与繁殖观察', url: 'https://www.insectarium.cz/kudlanky/soubory/rhombodera.htm' },
      { title: 'Appalachian Tarantulas：巨盾螳资料', url: 'https://www.appalachiantarantulas.com/care-guides/rhombodera-basalis' },
      { title: 'Tropicals：基菱斧螳与弑亲菱斧螳名称对照', url: 'https://tropicals.cn/species/compare/rhombodera-basalis/rhombodera-fratricida' },
    ],
  },
  {
    id: 'rhombodera-fratricida', species: 'mantis', name: '弑菱背螳', scientificName: 'Rhombodera fratricida',
    aliases: ['弑亲菱背螳', '弑亲菱斧螳', '夺嫡菱背螳', '弑菱背螳（Rhombodera fratricida）', '弑亲菱背螳（Rhombodera fratricida）'],
    tags: ['大型盾螳', '枝叶栖居', '单独饲养', '注意积热'],
    summary: '体形较大的菱背螳，前胸呈盾状扩展，前足强健；利用枝叶攀附、停留和捕食。',
    origin: '印度—马来区，婆罗洲等地有记录', habitat: '有枝叶和攀附支点的植被环境', activity: '在枝叶间停留、捕食，蜕皮时需要牢固倒挂',
    diet: '幼体从适口果蝇开始，随体型增大选择苍蝇等饲料昆虫',
    behavior: '属于大型菱背螳；应观察个体实际的捕食和腹部状态，分盒饲养，避免同类互相捕食。',
    housing: '随成长及时扩大盒体，设置牢固枝条及粗糙的攀附面；顶部能抓牢，悬挂点下留足伸展和蜕皮净空。',
    care: '本种饲主经验特别强调避免照搬其他大型绿螳的高温养法，留意夏季积热和直晒；测量实际温湿度，兼顾饮水、通风与清洁。',
    caution: '补水后及时检查底部残饵、粪便及受潮枝条；不要向幼体大流量直喷，临近蜕皮或羽化时减少移动和干扰。',
    sources: [
      { title: 'GBIF：Rhombodera fratricida 分类记录', url: 'https://www.gbif.org/taxon/VF8D9' },
      { title: '冰叔会整活：本种饲养经验（环境、攀附与清洁）', url: 'https://www.bilibili.com/opus/1056340085444706307' },
      { title: 'PanTerra Pets：螳螂通用空间与单养要点', url: 'https://www.panterrapets.com/pages/care' },
    ],
  },
  {
    id: 'orchid-mantis', species: 'mantis', name: '兰花螳螂', scientificName: 'Hymenopus coronatus',
    aliases: ['兰花螳', 'Orchid Mantis'],
    tags: ['花朵拟态', '雌雄体型差异大', '偏好飞虫', '重视通风'],
    summary: '白色至粉色的花瓣状外形非常醒目；雌虫与雄虫成体大小差异明显。',
    origin: '东南亚热带地区', habitat: '热带植被、枝叶之间', activity: '借助花状外形等待昆虫靠近',
    diet: '按龄期选果蝇、家蝇、丽蝇等飞虫',
    behavior: '偏好飞行昆虫，雌雄需要分别按实际体型配置空间和猎物；单独饲养便于观察。',
    housing: '提供纵向攀附面、可抓附的顶部及下方蜕皮净空，避免装饰堵住悬挂位置。',
    care: '需要温暖且有适当水分的环境，同时保持空气流动；幼体尤其要兼顾补水和通风。',
    caution: '湿度较高不等于底材持续积水；及时清理残饵，减少霉菌滋生。',
    sources: [
      { title: 'PanTerra Pets：兰花螳螂饲养观察', url: 'https://www.panterrapets.com/pages/orchid-mantis-caresheet' },
    ],
  },
  {
    id: 'chinese-mantis', species: 'mantis', name: '中华大刀螳', scientificName: 'Tenodera sinensis',
    aliases: ['大刀螳', '中华螳螂', 'Chinese Mantis', 'Chinese Praying Mantid'],
    tags: ['大型螳螂', '绿或褐色', '伏击捕食', '有同类相食风险'],
    summary: '体态细长、常呈绿色或褐色，前足有发达的捕捉结构；若虫像缩小的成虫但尚无完整翅。',
    origin: '东亚', habitat: '草丛、灌木及其他植被', activity: '经常静候猎物接近，再用捕捉足出击',
    diet: '与体型相配的苍蝇、蟋蟀、蝗虫、蟑螂等昆虫',
    behavior: '可捕捉多类猎物，也存在同类相食；成体和若虫应按体型选择饵料。',
    housing: '单独饲养，提供枝条、抓附顶部和足够的倒挂蜕皮空间；随成长扩大盒体。',
    care: '提供饮水机会并保持通风，及时清理残饵；喷雾间隔按盒体通风和实际干燥程度调整。',
    caution: '成虫不再蜕皮；不要把成年后的拒食一律当作蜕皮前期。',
    sources: [
      { title: 'NC State Extension：中华螳螂生物学', url: 'https://content.ces.ncsu.edu/chinese-mantid' },
      { title: 'PanTerra Pets：螳螂饲养基础', url: 'https://www.panterrapets.com/pages/care' },
    ],
  },
]

const normalize = (s: string) => s.toLowerCase().replace(/[\s（）()·.\-_]/g, '')
const namesOf = (b: BreedGuide) => [b.name, b.scientificName, ...b.aliases]

// 精确匹配名称/别名，且限制物种；不把含糊的“王蛇”“紫蜘蛛”强行当成某个品种。
export function findBreedGuide(species: Species, breed: string): BreedGuide | undefined {
  const key = normalize(breed)
  return key ? BREED_GUIDES.find(b => b.species === species && namesOf(b).some(n => normalize(n) === key)) : undefined
}

export function searchBreedGuides(species: Species | 'all', query: string) {
  const key = normalize(query)
  return BREED_GUIDES.filter(b => (species === 'all' || b.species === species) &&
    (!key || [...namesOf(b), ...b.tags].some(n => normalize(n).includes(key))))
}
