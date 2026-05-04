import { db } from './db/index.js';
import { styleTemplates, aiModels } from './db/schema.js';
import { eq } from 'drizzle-orm';

const TEMPLATES = [
  {
    name: '都市现代风',
    description: '适用于都市、言情、现代职场题材。画面干净利落，人物比例写实，色彩饱满通透。',
    breakdownPrompt: `你是一位顶级动漫分镜师，擅长都市现代风格的镜头语言。
请根据以下剧本进行专业分镜拆解，每个分镜需包含：
1. 画面构图描述（镜头距离、角度、人物位置关系）
2. 对白（如有）
3. 图片生成提示词（英文，包含风格、光影、情绪关键词）
4. 视频生成提示词（英文，包含运镜方式、动作描述）

风格要求：现代都市感，光线自然柔和，人物表情细腻，场景细节丰富。画面比例16:9。`,
    imagePrompt: 'modern urban anime style, clean linework, natural lighting, detailed facial expressions, vibrant yet natural colors, 16:9 aspect ratio, high quality illustration, professional anime production',
    videoPrompt: 'smooth cinematic camera movement, subtle parallax effect, natural character motion, soft ambient lighting, 24fps animation, anime style, urban setting',
  },
  {
    name: '古装仙侠风',
    description: '适用于古装、修仙、玄幻题材。色彩瑰丽仙气，特效华丽，场景宏大。',
    breakdownPrompt: `你是一位顶级国漫分镜师，擅长古装仙侠风格。
请根据以下剧本进行专业分镜拆解，每个分镜需包含：
1. 画面构图描述（镜头距离、角度、人物姿态）
2. 对白（如有）
3. 图片生成提示词（英文，包含仙侠元素、光影特效关键词）
4. 视频生成提示词（英文，包含法术特效、衣袂飘动等动态描述）

风格要求：国漫仙侠风，色彩瑰丽，法术特效璀璨，服饰华丽飘逸，场景仙气缭绕。`,
    imagePrompt: 'chinese fantasy xianxia anime style, flowing robes, ethereal lighting, magical particle effects, ornate ancient architecture, vibrant jewel tones, 16:9, high quality donghua illustration',
    videoPrompt: 'elegant flowing fabric animation, sparkling magical particle effects, drifting mist and clouds, dynamic camera pans, ancient chinese fantasy atmosphere, cinematic donghua quality',
  },
  {
    name: '日系二次元',
    description: '适用于日系动漫、校园、奇幻冒险题材。线条明快，色彩明亮，角色可爱生动。',
    breakdownPrompt: `你是一位资深日系动漫分镜师。
请根据以下剧本进行专业分镜拆解，每个分镜需包含：
1. 画面构图描述（日式动画常用镜头语言）
2. 对白（如有）
3. 图片生成提示词（英文，日系风格关键词）
4. 视频生成提示词（英文，日式动画运镜特点）

风格要求：日系anime风格，线条清晰明快，色彩明亮饱和，角色表情丰富夸张，背景细节精美。`,
    imagePrompt: 'japanese anime style, vibrant colors, crisp linework, expressive character faces, detailed background art, cel-shaded look, 16:9, high quality anime illustration, studio quality',
    videoPrompt: 'dynamic anime camera angles, expressive character animation, speed lines and impact frames, smooth sakuga-style motion, vibrant color grading, japanese animation quality',
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
  // Templates - only insert if empty
  const existingTemplates = await db.select().from(styleTemplates).all();
  if (existingTemplates.length === 0) {
    for (const t of TEMPLATES) {
      await db.insert(styleTemplates).values(t);
      console.log(`Template: ${t.name}`);
    }
  } else {
    console.log(`${existingTemplates.length} templates exist, skipping`);
  }

  // Models - insert missing ones
  for (const m of MODELS) {
    const found = await db.select().from(aiModels).where(eq(aiModels.provider, m.provider)).all();
    if (found.length === 0) {
      await db.insert(aiModels).values({ ...m, enabled: true });
      console.log(`Model: ${m.name} (${m.provider})`);
    }
  }

  console.log('Seed complete');
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
