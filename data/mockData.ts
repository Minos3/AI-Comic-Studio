import { Asset } from '../types';

export interface Appearance {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  status: 'pending' | 'generated';
}

export interface Character {
  id: string;
  name: string;
  gender: '男' | '女' | '其他';
  age: string;
  description: string;
  portraitUrl: string;
  shortBio: string;
  appearances: Appearance[];
}

export const MOCK_CHARACTERS: Character[] = [
  {
    id: 'c1',
    name: '赵书禾',
    gender: '女',
    age: '18',
    shortBio: '眉眼凌厉，身姿优雅，自带太后威...',
    description: '眉眼凌厉，身姿优雅，自带太后威仪。肤色白皙但透着冷峻，长发乌黑，眼神深邃且富有穿透力，举手投足间尽显端庄与冷静的气质。',
    portraitUrl: 'https://picsum.photos/seed/zsh_main/400/500',
    appearances: [
      { id: 'a1', name: '太后临终造型', description: '太后妆造，端庄，40岁女性，眼神充满不甘，身着改良汉服或现代装皆有气场...', imageUrl: 'https://picsum.photos/seed/zsh_1/400/400', status: 'generated' },
      { id: 'a2', name: '沈家真千金日常', description: '身着改良汉服或简约现代高定服装，材质多为真丝或精纺羊绒，色调沉稳。手腕处有明显的陈...', imageUrl: 'https://picsum.photos/seed/zsh_2/400/400', status: 'generated' },
      { id: 'a3', name: '医院病号造型', description: '身着蓝白条纹病号服，左腿打着厚厚的白色石膏并被支架吊起，神情悠闲，手中常翻阅时尚杂...', status: 'pending' },
      { id: 'a4', name: '铃芽学院校服', description: '身着英伦风学院制服，深蓝色西装外套搭配百褶裙，领带系得严丝合缝，领口别着微型记录仪...', status: 'pending' },
    ]
  },
  {
    id: 'c2',
    name: '沈慕瑶',
    gender: '女',
    age: '20',
    shortBio: '长相娇俏，肤白貌美，红棕色直发垂肩。...',
    description: '沈家养女，性格活泼好动，内心戏极多. 长相娇俏，肤白貌美，喜欢穿着粉色或浅色系的精致洋装。',
    portraitUrl: 'https://picsum.photos/seed/smy/400/500',
    appearances: []
  },
  {
    id: 'c3',
    name: '沈廷渊',
    gender: '男',
    age: '25',
    shortBio: '沈家大哥，沉稳内敛，商业精英。',
    description: '沈家大哥，沉稳内敛，商业精英。',
    portraitUrl: 'https://picsum.photos/seed/sty/400/500',
    appearances: []
  },
  {
    id: 'c4',
    name: '温舒晚',
    gender: '女',
    age: '22',
    shortBio: '温柔婉约，知书达理。',
    description: '温柔婉约，知书达理。',
    portraitUrl: 'https://picsum.photos/seed/wsw/400/500',
    appearances: []
  },
  {
    id: 'c5',
    name: '李大牛',
    gender: '男',
    age: '30',
    shortBio: '憨厚老实，力大无穷。',
    description: '憨厚老实，力大无穷。',
    portraitUrl: 'https://picsum.photos/seed/ldn/400/500',
    appearances: []
  }
];

export const MOCK_ITEMS: Asset[] = [
  { id: 'i1', name: '古剑', url: 'https://picsum.photos/seed/sword/200/200', type: 'image', category: 'Weapon' },
  { id: 'i2', name: '玉佩', url: 'https://picsum.photos/seed/jade/200/200', type: 'image', category: 'Accessory' },
];

export const MOCK_SCENES: Asset[] = [
  { id: 'sc1', name: '凌绝崖', url: 'https://picsum.photos/seed/cliff/400/300', type: 'image', category: 'Exterior' },
  { id: 'sc2', name: '沈家别墅', url: 'https://picsum.photos/seed/villa/400/300', type: 'image', category: 'Interior' },
];

export const MOCK_CREATURES: Asset[] = [
  { id: 'cr1', name: '九幽魔龙', url: 'https://picsum.photos/seed/dragon/300/300', type: 'image', category: 'Monster' },
];
