// Seed script: 10 popular style templates + 8 AI model configs
// Run: npx tsx server/seed.ts
import { db } from './db/index.js';
import { styleTemplates, aiModels } from './db/schema.js';
import { eq } from 'drizzle-orm';

const TEMPLATES = [
  {
    name: '国风水墨仙侠',
    description: '2026最火的国潮古风赛道。水墨意境+仙侠玄幻，适合修仙、重生、古装言情。参考提示词公式：时代基底→空间载体→人物特征→动态氛围。',
    breakdownPrompt: `你是一位顶级国漫分镜师，专攻国风水墨仙侠风格。
请根据以下剧本进行专业分镜拆解，每个分镜需包含：
1. 画面构图描述（镜头距离、角度、人物姿态与服饰细节）
2. 对白（如有，标注说话人）
3. 图片生成提示词（英文，前置 "Ancient Chinese ink art style" 锚定风格，包含水墨扩散、朝代美学、光影关键词）
4. 视频生成提示词（英文，包含衣袂飘动、法术粒子、云雾流动等动态）

铁律：每句提示词开头必须锚定 "Ancient Chinese ink art" 或 "Tang/Song Dynasty aesthetic"；视频提示词以 slow-motion 为主节奏；负面词：no photorealism, no 3D render。`,
    imagePrompt: 'Ancient Chinese ink art style, Tang Dynasty aesthetic, flowing hanfu robes with wide sleeves, ethereal immortal energy particles, vermilion palace or bamboo forest background, soft ink-wash diffusion, golden hour backlight through lattice windows, mist-shrouded mountains, jade and gold accents, high quality donghua illustration, 16:9',
    videoPrompt: 'slow-motion silk ribbon flutter, ink-wash diffusion animation, drifting mystical clouds, sparkling qi energy particles, elegant fabric flowing in wind, parallax scroll background, cinematic donghua quality, ancient chinese fantasy atmosphere, subtle camera drift',
  },
  {
    name: '吉卜力治愈风',
    description: '2025-2026全球爆款常青树。宫崎骏手绘质感+温暖色调，适合治愈、日常、自然奇幻、少儿题材。核心关键词：Ghibli style, watercolor texture, warm film tone。',
    breakdownPrompt: `你是一位吉卜力工作室风格的动画分镜师。
请根据以下剧本进行专业分镜拆解，每个分镜需包含：
1. 画面构图描述（温暖的镜头语言，注重自然元素和人物情感）
2. 对白（如有）
3. 图片生成提示词（英文，前置 "Studio Ghibli hand-drawn texture" 锚定，包含水彩、柔和光线、怀旧感关键词）
4. 视频生成提示词（英文，微风、飘动、缓慢镜头运动）

风格铁律：必须手绘水彩质感，绝对不能出现3D渲染和写实照片感。色调参考宫崎骏色板。`,
    imagePrompt: 'Studio Ghibli hand-drawn texture, watercolor painting style, Hayao Miyazaki color palette, soft natural lighting, warm film tone with slight grain, whimsical atmosphere, lush nature background with detailed foliage, hand-painted clouds, nostalgic and heartwarming mood, gentle brushstrokes, 16:9 aspect ratio',
    videoPrompt: 'gentle breeze moving grass and leaves, subtle character breathing animation, slow parallax camera movement, hand-painted frame-by-frame feel, warm golden hour light shifting, floating dust particles in sunlight, soft watercolor edge blending, peaceful and dreamy atmosphere, Studio Ghibli film quality',
  },
  {
    name: '赛博朋克科幻',
    description: '2026男频增速冠军。霓虹美学+末世都市，适合科幻、末日、异能、悬疑推理。末日赛博类单剧播放量破2.3亿。公式：霓虹光源+湿润街道+全息投影。',
    breakdownPrompt: `你是一位赛博朋克风格的科幻分镜师。
请根据以下剧本进行专业分镜拆解，每个分镜需包含：
1. 画面构图描述（低角度仰拍为主，强调霓虹光源和城市纵深感）
2. 对白（如有）
3. 图片生成提示词（英文，前置 "Cyberpunk cinematic" 锚定，必须包含 neon-lit, rain-slicked, volumetric lighting）
4. 视频生成提示词（英文，glitch转场、霓虹闪烁、雨滴流动）

铁律：紫色+橙色双色光源为主色调；永远在雨后湿润的街道；全息广告牌必须出现在背景中。`,
    imagePrompt: 'Cyberpunk cinematic, neon-lit dystopian megacity, rain-slicked pavement reflecting purple-blue neon glow, towering holographic advertisements flickering, volumetric fog illuminated by street lights, high contrast lighting with lens flare, chrome and carbon fiber textures, perpetual twilight sky with orange-purple gradient, cinematic composition, 4K, 16:9',
    videoPrompt: 'glitch transition effects, neon signs flickering and buzzing, rain droplets falling on wet surfaces, slow dolly-in through crowded neon street, holographic UI elements shimmering, smoke drifting through colored light beams, electric sparks from overhead cables, futuristic synthwave atmosphere, cinematic cyberpunk quality',
  },
  {
    name: '日系二次元',
    description: '产量最大的AI漫剧类型，占热播榜~40%。Anime风格+网文爽感，适合热血、搞笑、甜宠、异世界穿越。工具推荐即梦AI+可灵AI。',
    breakdownPrompt: `你是一位资深日系动漫分镜师，擅长热血和甜宠两种赛道。
请根据以下剧本进行专业分镜拆解，每个分镜需包含：
1. 画面构图描述（日式动画经典机位：俯瞰、仰角、荷兰角、特写）
2. 对白（如有，标注说话人+情绪）
3. 图片生成提示词（英文，前置 "Japanese anime style" 锚定，cel-shaded + vibrant colors）
4. 视频生成提示词（英文，speed lines、impact frames、sakuga-style motion）

铁律：线条必须清晰锐利（crisp linework）；色彩明亮饱和但不刺眼；角色表情可适度夸张；背景细节与角色保持统一精度。`,
    imagePrompt: 'Japanese anime style, vibrant saturated colors, crisp clean linework, cel-shaded rendering, expressive character face with large eyes, detailed school or fantasy background, studio-quality animation keyframe, dynamic composition, soft rim lighting, bokeh background blur, 16:9, high quality anime illustration',
    videoPrompt: 'dynamic anime camera angles with speed lines, expressive hair and clothing animation, impact frames on action beats, smooth sakuga-style character motion, vibrant color grading, particle effects for magic or emotion, anime background music visual sync, Japanese animation TV quality, 24fps',
  },
  {
    name: 'AI仿真人写实',
    description: '2026最大黑马，占比从7%飙升至38%。接近真人画质+AI成本优势，适合都市言情、豪门甜宠、职场商战。女频付费转化率最高。',
    breakdownPrompt: `你是一位AI仿真人短剧导演，专注超写实风格。
请根据以下剧本进行专业分镜拆解，每个分镜需包含：
1. 画面构图描述（电影级镜头语言，注重人物微表情和自然光线）
2. 对白（如有）
3. 图片生成提示词（英文，前置 "Photorealistic cinematic" 锚定，强调皮肤质感、自然光、电影色彩分级）
4. 视频生成提示词（英文，手持摄影感、自然眨眼、微表情动态）

铁律：绝对不能出现动漫/3D渲染痕迹；皮肤要有真实毛孔质感但不能过度 (--no oversaturated)；光线必须模拟实拍电影三点布光。`,
    imagePrompt: 'Photorealistic cinematic portrait, natural skin texture with subtle pores, soft three-point studio lighting, shallow depth of field with bokeh, film color grading with warm tones, 35mm lens equivalent, modern fashion styling, emotionally expressive eyes, clean background, 16:9, 8K quality, editorial photography',
    videoPrompt: 'handheld camera subtle shake, natural eye blink and micro-expression, soft wind moving hair strands, cinematic 24fps motion, gentle dolly movement, natural light shifting, film grain overlay, emotional subtle acting, realistic human motion, no CGI uncanny valley',
  },
  {
    name: '韩系唯美甜宠',
    description: '女频流量担当。韩剧滤镜+高颜值角色+浪漫场景，适合恋爱甜宠、豪门契约、娱乐圈题材。关键词：K-drama aesthetic, soft glow, pastel tones。',
    breakdownPrompt: `你是一位韩系唯美风格的甜宠剧分镜师。
请根据以下剧本进行专业分镜拆解，每个分镜需包含：
1. 画面构图描述（韩剧经典构图：对称、逆光、浅景深特写）
2. 对白（如有）
3. 图片生成提示词（英文，前置 "K-drama cinematic aesthetic" 锚定，soft glow + pastel + cherry blossom）
4. 视频生成提示词（英文，slow-motion回眸、花瓣飘落、眼神对视）

铁律：滤镜必须是韩剧柔光风格；色调以粉色/奶油色/浅蓝为主；角色颜值必须顶配；场景要有樱花、咖啡厅、初雪等浪漫元素。`,
    imagePrompt: 'K-drama cinematic aesthetic, soft dreamy glow filter, pastel pink and cream color palette, cherry blossom petals falling, handsome male lead in designer coat, beautiful female lead with natural makeup, cozy cafe or rooftop garden setting, golden hour backlight, shallow depth of field, romantic atmosphere, 16:9, 4K',
    videoPrompt: 'slow-motion hair flip with cherry blossom petals, romantic eye contact with soft lens flare, gentle smile and blush animation, steady dolly-in during emotional moment, first snow falling scene, warm bokeh lights twinkling, K-drama OST music video quality, dreamy transition blur',
  },
  {
    name: '暗黑末世废土',
    description: '男频爆款制造机。暗黑动漫+末日生存+硬核战斗，适合末世、丧尸、废土求生、暗黑奇幻。末日寒潮类单剧播放增量2.3亿。',
    breakdownPrompt: `你是一位暗黑末世风格的硬核分镜师。
请根据以下剧本进行专业分镜拆解，每个分镜需包含：
1. 画面构图描述（大远景废墟+特写战斗，低饱和色调，高对比阴影）
2. 对白（如有）
3. 图片生成提示词（英文，前置 "Dark apocalyptic anime" 锚定，desaturated + harsh shadows + dust particles）
4. 视频生成提示词（英文，手持晃动、爆炸粒子、风沙流动）

铁律：色调必须低饱和（desaturated），绝对不能出现明亮色彩；阴影要硬（hard shadows）；永远有灰尘/烟雾/碎片在空中飘浮。`,
    imagePrompt: 'Dark apocalyptic anime style, desaturated color grading with muted earth tones, harsh dramatic shadows, ruined cityscape with crumbling buildings, dust particles floating in air, worn tactical gear on survivor character, overcast sky with smoke columns, gritty textured linework, high contrast chiaroscuro, 16:9, mature seinen anime quality',
    videoPrompt: 'handheld shaky camera for action intensity, dust and debris particles swirling, flickering firelight and smoke, slow tracking shot through ruined environment, impact shake on explosions, dramatic shadow movement, gritty film grain, dark ambient atmosphere, mature anime OVA quality',
  },
  {
    name: '新海诚电影风',
    description: '新海诚美学—每一帧都是壁纸。极致背景+光影渲染+青春情感，适合青春恋爱、奇幻穿越、治愈成长。关键词：Makoto Shinkai, photorealistic background, lens flare。',
    breakdownPrompt: `你是一位新海诚风格的动画电影分镜师。
请根据以下剧本进行专业分镜拆解，每个分镜需包含：
1. 画面构图描述（极致唯美的背景先行，人物融入宏大场景中）
2. 对白（如有）
3. 图片生成提示词（英文，前置 "Makoto Shinkai cinematic" 锚定，photorealistic background + dramatic sky + lens flare + 星芒）
4. 视频生成提示词（英文，云层流动、电车驶过、花瓣/雪花飘落）

铁律：天空必须戏剧化（dramatic sky with crepuscular rays）；必须有镜头炫光（lens flare）；背景精细度必须高于人物；色彩是蓝橙互补色。`,
    imagePrompt: 'Makoto Shinkai cinematic style, photorealistic detailed background with dramatic sky, crepuscular god rays through clouds, lens flare and star filter effects, blue-orange complementary color grading, train tracks or cityscape silhouette, young character silhouetted against vast landscape, emotional lighting, every frame a wallpaper, 16:9, 4K anime film quality',
    videoPrompt: 'dramatic timelapse clouds flowing across sky, train passing with motion blur, cherry blossom or snow petals drifting, sparkling lens flare transitions, subtle camera pan across detailed landscape, reflective water surface rippling, emotional piano BGM atmosphere, Makoto Shinkai film opening sequence quality',
  },
  {
    name: 'Q版萌系可爱',
    description: '萌宠/亲子赛道顶流。Q版角色+明亮糖果色+简单线条，适合宠物拟人、少儿故事、搞笑日常、表情包漫剧。AI宠物动漫化是2026流量密码。',
    breakdownPrompt: `你是一位Q版萌系风格的动画师，专做高流量萌宠/少儿内容。
请根据以下剧本进行专业分镜拆解，每个分镜需包含：
1. 画面构图描述（圆润可爱的造型，夸张的表情，简单的背景）
2. 对白（如有）
3. 图片生成提示词（英文，前置 "Chibi cute kawaii style" 锚定，big eyes + round shapes + candy colors）
4. 视频生成提示词（英文，弹跳动画、眨眼、爱心飘出）

铁律：角色头身比1:1到1:3；眼睛必须大且闪亮；边缘线条要圆润不能有尖角；色彩要糖果色/马卡龙色系；背景简洁不抢眼。`,
    imagePrompt: 'Chibi cute kawaii style, super deformed proportions with big head and small body, enormous sparkling anime eyes, round soft shapes with no sharp edges, candy pastel color palette, simple clean background with minimal details, adorable pet or child character, kirakira sparkle effects, fluffy texture, 16:9, mobile-friendly vertical composition',
    videoPrompt: 'bouncy squash-and-stretch animation, cute blinking with sparkle in eyes, floating heart or star emoji effects, happy wiggle and hop motion, soft bouncy hair movement, pastel background color transition, cartoon sound effect sync, kawaii anime short quality, loop-friendly seamless motion',
  },
  {
    name: '美漫超级英雄',
    description: '出海首选风格。美式漫画+超级英雄+动作大片感，适合北美/东南亚市场。关键词：American comic style, halftone dots, bold inking, dynamic action。',
    breakdownPrompt: `你是一位美漫风格的超级英雄题材分镜师。
请根据以下剧本进行专业分镜拆解，每个分镜需包含：
1. 画面构图描述（美漫经典：大透视、动态姿势、画框打破效果）
2. 对白（如有，美漫画风对白可以对话框形式呈现）
3. 图片生成提示词（英文，前置 "American comic book style" 锚定，halftone dots + bold inking + action pose）
4. 视频生成提示词（英文，comic panel transitions、speed lines、impact bursts）

铁律：必须有网点纸质感（halftone dots）；线条要粗犷有力（bold inking）；角色要有超级英雄的肌肉线条和动态pose；色彩饱和度高，对比强烈。`,
    imagePrompt: 'American comic book style, halftone dot printing texture, bold black inking outlines, dynamic superhero action pose with foreshortening, vibrant saturated primary colors, Ben-Day dots background pattern, dramatic perspective from low angle, muscular anatomy, comic panel border elements, 16:9, Marvel-DC quality illustration, pop art aesthetic',
    videoPrompt: 'comic panel wipe transitions, speed lines zooming past, dramatic impact burst with onomatopoeia text, dynamic camera shake on action beats, ink splatter effects, halftone pattern overlay, bold color pop frame changes, retro comic book feel, high energy superhero cartoon quality',
  },
];

const MODELS = [
  { name: 'Nanobanana Pro', type: 'image', provider: 'nanobanana', apiUrl: 'https://api.nanobanana.com', isDefault: false },
  { name: '即梦 4.0', type: 'image', provider: 'jimeng', apiUrl: 'https://api.jimeng.com', isDefault: false },
  { name: 'Nanobanana2 (Gemini)', type: 'image', provider: 'gemini-image', apiUrl: 'https://aigc.x-see.cn', isDefault: true },
  { name: 'GPT Image 2', type: 'image', provider: 'gpt-image', apiUrl: 'https://aigc.x-see.cn', isDefault: false },
  { name: 'Grok Image', type: 'image', provider: 'grok-image', apiUrl: 'https://aigc.x-see.cn', isDefault: false },
  { name: 'Seedance 2.0', type: 'video', provider: 'seedance', apiUrl: 'https://api.seedance.com', isDefault: false },
  { name: 'Sora 2', type: 'video', provider: 'sora', apiUrl: 'https://aigc.x-see.cn', isDefault: true },
  { name: 'Grok Video', type: 'video', provider: 'grok-video', apiUrl: 'https://aigc.x-see.cn', isDefault: false },
];

async function seed() {
  const existing = await db.select().from(styleTemplates).all();
  const existingNames = new Set(existing.map((t) => t.name));

  let added = 0;
  for (const t of TEMPLATES) {
    if (existingNames.has(t.name)) {
      // Update existing template with optimized prompts
      await db.update(styleTemplates)
        .set({
          description: t.description,
          breakdownPrompt: t.breakdownPrompt,
          imagePrompt: t.imagePrompt,
          videoPrompt: t.videoPrompt,
        })
        .where(eq(styleTemplates.name, t.name));
      console.log(`  ↻ ${t.name} (updated)`);
    } else {
      await db.insert(styleTemplates).values(t);
      console.log(`  ✓ ${t.name} (new)`);
      added++;
    }
  }

  // Models - insert missing
  for (const m of MODELS) {
    const found = await db.select().from(aiModels).where(eq(aiModels.provider, m.provider)).all();
    if (found.length === 0) {
      await db.insert(aiModels).values({ ...m, enabled: true });
      console.log(`  + Model: ${m.name}`);
    }
  }

  const count = await db.select().from(styleTemplates).all();
  console.log(`\nDone: ${count.length} templates total (${added} new), ${MODELS.length} model configs`);
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
