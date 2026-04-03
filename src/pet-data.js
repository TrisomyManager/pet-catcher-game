// ===== 宠物数据配置 =====

// 属性类型定义
const PET_TYPES = {
    FIRE: { name: 'fire', display: '火', emoji: '🔥', color: '#ff6b6b' },
    WATER: { name: 'water', display: '水', emoji: '💧', color: '#4a90e2' },
    GRASS: { name: 'grass', display: '草', emoji: '🌿', color: '#7ed321' },
    ELECTRIC: { name: 'electric', display: '电', emoji: '⚡', color: '#f5a623' },
    EARTH: { name: 'earth', display: '土', emoji: '🪨', color: '#8b572a' },
    DARK: { name: 'dark', display: '暗', emoji: '🌑', color: '#6c5ce7' }
};

// 属性相克关系 (攻击方 -> 防御方: 伤害倍率)
const TYPE_EFFECTIVENESS = {
    fire: { grass: 2.0, water: 0.5, fire: 0.5, earth: 1.0, electric: 1.0, dark: 1.0 },
    water: { fire: 2.0, grass: 0.5, water: 0.5, electric: 1.0, earth: 2.0, dark: 1.0 },
    grass: { water: 2.0, fire: 0.5, grass: 0.5, earth: 2.0, electric: 1.0, dark: 1.0 },
    electric: { water: 2.0, grass: 0.5, earth: 0.0, electric: 0.5, fire: 1.0, dark: 1.0 },
    earth: { fire: 2.0, electric: 2.0, water: 0.5, grass: 0.5, earth: 0.5, dark: 1.0 },
    dark: { dark: 1.5, fire: 1.0, water: 1.0, grass: 1.0, electric: 1.0, earth: 1.0 }
};

// 技能数据
const SKILLS = {
    // 普通技能
    scratch: { id: 'scratch', name: '抓击', power: 40, type: 'normal', pp: 35, accuracy: 100, category: 'physical' },
    tackle: { id: 'tackle', name: '撞击', power: 40, type: 'normal', pp: 35, accuracy: 100, category: 'physical' },
    growl: { id: 'growl', name: '叫声', power: 0, type: 'normal', pp: 40, accuracy: 100, category: 'status', effect: 'lower_attack' },
    
    // 火系技能
    ember: { id: 'ember', name: '火花', power: 40, type: 'fire', pp: 25, accuracy: 100, category: 'special' },
    flamethrower: { id: 'flamethrower', name: '喷射火焰', power: 90, type: 'fire', pp: 15, accuracy: 100, category: 'special' },
    fire_fang: { id: 'fire_fang', name: '火焰牙', power: 65, type: 'fire', pp: 15, accuracy: 95, category: 'physical' },
    fire_blast: { id: 'fire_blast', name: '大字爆炎', power: 110, type: 'fire', pp: 5, accuracy: 85, category: 'special' },
    
    // 水系技能
    bubble: { id: 'bubble', name: '泡沫', power: 40, type: 'water', pp: 30, accuracy: 100, category: 'special' },
    water_gun: { id: 'water_gun', name: '水枪', power: 40, type: 'water', pp: 25, accuracy: 100, category: 'special' },
    surf: { id: 'surf', name: '冲浪', power: 90, type: 'water', pp: 15, accuracy: 100, category: 'special' },
    hydro_pump: { id: 'hydro_pump', name: '水炮', power: 110, type: 'water', pp: 5, accuracy: 80, category: 'special' },
    
    // 草系技能
    vine_whip: { id: 'vine_whip', name: '藤鞭', power: 45, type: 'grass', pp: 25, accuracy: 100, category: 'physical' },
    razor_leaf: { id: 'razor_leaf', name: '飞叶快刀', power: 55, type: 'grass', pp: 25, accuracy: 95, category: 'physical' },
    mega_drain: { id: 'mega_drain', name: '超级吸取', power: 75, type: 'grass', pp: 10, accuracy: 100, category: 'special', effect: 'heal' },
    solar_beam: { id: 'solar_beam', name: '日光束', power: 120, type: 'grass', pp: 10, accuracy: 100, category: 'special' },
    
    // 电系技能
    thunder_shock: { id: 'thunder_shock', name: '电击', power: 40, type: 'electric', pp: 30, accuracy: 100, category: 'special' },
    spark: { id: 'spark', name: '电火花', power: 65, type: 'electric', pp: 20, accuracy: 100, category: 'physical' },
    thunderbolt: { id: 'thunderbolt', name: '十万伏特', power: 90, type: 'electric', pp: 15, accuracy: 100, category: 'special' },
    thunder: { id: 'thunder', name: '打雷', power: 110, type: 'electric', pp: 10, accuracy: 70, category: 'special' },
    
    // 土系技能
    rock_throw: { id: 'rock_throw', name: '落石', power: 50, type: 'earth', pp: 15, accuracy: 90, category: 'physical' },
    mud_slap: { id: 'mud_slap', name: '掷泥', power: 20, type: 'earth', pp: 10, accuracy: 100, category: 'special', effect: 'lower_accuracy' },
    rock_slide: { id: 'rock_slide', name: '岩崩', power: 75, type: 'earth', pp: 10, accuracy: 90, category: 'physical' },
    earthquake: { id: 'earthquake', name: '地震', power: 100, type: 'earth', pp: 10, accuracy: 100, category: 'physical' },
    
    // 暗系技能
    bite: { id: 'bite', name: '咬住', power: 60, type: 'dark', pp: 25, accuracy: 100, category: 'physical' },
    pursuit: { id: 'pursuit', name: '追打', power: 40, type: 'dark', pp: 20, accuracy: 100, category: 'physical' },
    crunch: { id: 'crunch', name: '咬碎', power: 80, type: 'dark', pp: 15, accuracy: 100, category: 'physical' },
    dark_pulse: { id: 'dark_pulse', name: '恶之波动', power: 80, type: 'dark', pp: 15, accuracy: 100, category: 'special' },
    shadow_ball: { id: 'shadow_ball', name: '暗影球', power: 80, type: 'dark', pp: 15, accuracy: 100, category: 'special' },
    night_slash: { id: 'night_slash', name: '试刀', power: 70, type: 'dark', pp: 15, accuracy: 100, category: 'physical' }
};

// 宠物基础数据 (25种宠物)
const PETS_DATA = {
    // 初始宠物 - 草苗龟 (用户要求的初始宠物)
    grassturtle: {
        id: 'grassturtle',
        name: '草苗龟',
        emoji: '🐢',
        type: 'grass',
        rarity: 'common',
        baseStats: { hp: 55, attack: 45, defense: 50, speed: 40 },
        evoLevel: 16,
        evoTo: 'forestturtle',
        skills: ['tackle', 'vine_whip'],
        learnSkills: { 7: 'vine_whip', 14: 'razor_leaf', 25: 'mega_drain', 36: 'solar_beam' }
    },
    forestturtle: {
        id: 'forestturtle',
        name: '森林龟',
        emoji: '🐢',
        type: 'grass',
        rarity: 'uncommon',
        baseStats: { hp: 75, attack: 65, defense: 70, speed: 55 },
        evoLevel: 32,
        evoTo: 'earthturtle',
        skills: ['tackle', 'vine_whip', 'razor_leaf'],
        learnSkills: { 28: 'mega_drain', 40: 'solar_beam' }
    },
    earthturtle: {
        id: 'earthturtle',
        name: '大地龟',
        emoji: '🐢',
        type: 'grass',
        rarity: 'rare',
        baseStats: { hp: 95, attack: 85, defense: 90, speed: 70 },
        evoTo: null,
        skills: ['tackle', 'vine_whip', 'razor_leaf', 'mega_drain', 'solar_beam'],
        learnSkills: {}
    },
    
    // 其他初始宠物
    flameow: {
        id: 'flameow',
        name: '小火喵',
        emoji: '🐱',
        type: 'fire',
        rarity: 'common',
        baseStats: { hp: 45, attack: 52, defense: 39, speed: 65 },
        evoLevel: 16,
        evoTo: 'flamelion',
        skills: ['scratch', 'ember', 'fire_fang', 'flamethrower'],
        learnSkills: { 7: 'ember', 14: 'fire_fang', 25: 'flamethrower', 36: 'fire_blast' }
    },
    flamelion: {
        id: 'flamelion',
        name: '烈焰狮',
        emoji: '🦁',
        type: 'fire',
        rarity: 'uncommon',
        baseStats: { hp: 65, attack: 72, defense: 59, speed: 85 },
        evoLevel: 36,
        evoTo: 'infernoble',
        skills: ['scratch', 'ember', 'fire_fang', 'flamethrower'],
        learnSkills: { 40: 'fire_blast' }
    },
    infernoble: {
        id: 'infernoble',
        name: '炼狱王',
        emoji: '👑',
        type: 'fire',
        rarity: 'rare',
        baseStats: { hp: 85, attack: 92, defense: 79, speed: 105 },
        evoTo: null,
        skills: ['scratch', 'ember', 'fire_fang', 'flamethrower', 'fire_blast'],
        learnSkills: {}
    },
    
    bubblepup: {
        id: 'bubblepup',
        name: '泡泡狗',
        emoji: '🐶',
        type: 'water',
        rarity: 'common',
        baseStats: { hp: 44, attack: 48, defense: 65, speed: 43 },
        evoLevel: 16,
        evoTo: 'splashound',
        skills: ['tackle', 'bubble', 'water_gun', 'surf'],
        learnSkills: { 7: 'bubble', 14: 'water_gun', 25: 'surf', 36: 'hydro_pump' }
    },
    splashound: {
        id: 'splashound',
        name: '激流犬',
        emoji: '🐕',
        type: 'water',
        rarity: 'uncommon',
        baseStats: { hp: 64, attack: 68, defense: 85, speed: 63 },
        evoLevel: 36,
        evoTo: 'tsunamigo',
        skills: ['tackle', 'bubble', 'water_gun', 'surf'],
        learnSkills: { 40: 'hydro_pump' }
    },
    tsunamigo: {
        id: 'tsunamigo',
        name: '海啸兽',
        emoji: '🌊',
        type: 'water',
        rarity: 'rare',
        baseStats: { hp: 84, attack: 88, defense: 105, speed: 83 },
        evoTo: null,
        skills: ['tackle', 'bubble', 'water_gun', 'surf', 'hydro_pump'],
        learnSkills: {}
    },
    
    leafkit: {
        id: 'leafkit',
        name: '叶叶兔',
        emoji: '🐰',
        type: 'grass',
        rarity: 'common',
        baseStats: { hp: 45, attack: 49, defense: 49, speed: 45 },
        evoLevel: 16,
        evoTo: 'vinehare',
        skills: ['tackle', 'vine_whip', 'razor_leaf', 'mega_drain'],
        learnSkills: { 7: 'vine_whip', 14: 'razor_leaf', 25: 'mega_drain', 36: 'solar_beam' }
    },
    vinehare: {
        id: 'vinehare',
        name: '藤鞭兔',
        emoji: '🐇',
        type: 'grass',
        rarity: 'uncommon',
        baseStats: { hp: 60, attack: 62, defense: 63, speed: 60 },
        evoLevel: 32,
        evoTo: 'florabound',
        skills: ['tackle', 'vine_whip', 'razor_leaf', 'mega_drain'],
        learnSkills: { 28: 'solar_beam' }
    },
    florabound: {
        id: 'florabound',
        name: '花冠灵',
        emoji: '🌸',
        type: 'grass',
        rarity: 'rare',
        baseStats: { hp: 80, attack: 82, defense: 83, speed: 80 },
        evoTo: null,
        skills: ['tackle', 'vine_whip', 'razor_leaf', 'mega_drain', 'solar_beam'],
        learnSkills: {}
    },
    
    sparkrat: {
        id: 'sparkrat',
        name: '电电鼠',
        emoji: '🐭',
        type: 'electric',
        rarity: 'common',
        baseStats: { hp: 35, attack: 55, defense: 40, speed: 90 },
        evoLevel: 20,
        evoTo: 'voltrat',
        skills: ['scratch', 'thunder_shock', 'spark', 'thunderbolt'],
        learnSkills: { 10: 'thunder_shock', 18: 'spark', 28: 'thunderbolt', 38: 'thunder' }
    },
    voltrat: {
        id: 'voltrat',
        name: '闪电鼠',
        emoji: '🐁',
        type: 'electric',
        rarity: 'rare',
        baseStats: { hp: 60, attack: 90, defense: 55, speed: 110 },
        evoTo: null,
        skills: ['scratch', 'thunder_shock', 'spark', 'thunderbolt', 'thunder'],
        learnSkills: {}
    },
    
    // 野外宠物
    rockling: {
        id: 'rockling',
        name: '小岩怪',
        emoji: '🗿',
        type: 'earth',
        rarity: 'common',
        baseStats: { hp: 40, attack: 80, defense: 100, speed: 20 },
        evoLevel: 25,
        evoTo: 'boulderbeast',
        skills: ['tackle', 'rock_throw', 'rock_slide', 'earthquake'],
        learnSkills: { 12: 'rock_throw', 22: 'rock_slide', 32: 'earthquake' }
    },
    boulderbeast: {
        id: 'boulderbeast',
        name: '巨岩兽',
        emoji: '🏔️',
        type: 'earth',
        rarity: 'uncommon',
        baseStats: { hp: 55, attack: 95, defense: 115, speed: 35 },
        evoTo: null,
        skills: ['tackle', 'rock_throw', 'rock_slide', 'earthquake'],
        learnSkills: {}
    },
    
    shadowimp: {
        id: 'shadowimp',
        name: '暗影精',
        emoji: '👿',
        type: 'dark',
        rarity: 'uncommon',
        baseStats: { hp: 50, attack: 75, defense: 50, speed: 70 },
        evoLevel: 28,
        evoTo: 'nightmare',
        skills: ['scratch', 'bite', 'pursuit', 'crunch'],
        learnSkills: { 15: 'bite', 25: 'crunch', 35: 'dark_pulse' }
    },
    nightmare: {
        id: 'nightmare',
        name: '梦魇魔',
        emoji: '👹',
        type: 'dark',
        rarity: 'rare',
        baseStats: { hp: 70, attack: 95, defense: 70, speed: 95 },
        evoTo: null,
        skills: ['scratch', 'bite', 'pursuit', 'crunch', 'dark_pulse'],
        learnSkills: {}
    },
    
    flamepup: {
        id: 'flamepup',
        name: '火花狐',
        emoji: '🦊',
        type: 'fire',
        rarity: 'common',
        baseStats: { hp: 38, attack: 41, defense: 40, speed: 65 },
        evoLevel: 14,
        evoTo: 'infernofang',
        skills: ['scratch', 'ember', 'fire_fang'],
        learnSkills: { 10: 'ember', 18: 'fire_fang', 28: 'flamethrower' }
    },
    infernofang: {
        id: 'infernofang',
        name: '炼狱狐',
        emoji: '🔥',
        type: 'fire',
        rarity: 'uncommon',
        baseStats: { hp: 58, attack: 64, defense: 58, speed: 95 },
        evoTo: null,
        skills: ['scratch', 'ember', 'fire_fang', 'flamethrower'],
        learnSkills: {}
    },
    
    bubbletad: {
        id: 'bubbletad',
        name: '泡泡蝌蚪',
        emoji: '🐸',
        type: 'water',
        rarity: 'common',
        baseStats: { hp: 40, attack: 50, defense: 40, speed: 70 },
        evoLevel: 16,
        evoTo: 'splashfrog',
        skills: ['tackle', 'bubble', 'water_gun'],
        learnSkills: { 10: 'water_gun', 22: 'surf' }
    },
    splashfrog: {
        id: 'splashfrog',
        name: '激流蛙',
        emoji: '🐸',
        type: 'water',
        rarity: 'uncommon',
        baseStats: { hp: 65, attack: 65, defense: 65, speed: 90 },
        evoTo: null,
        skills: ['tackle', 'bubble', 'water_gun', 'surf'],
        learnSkills: {}
    },
    
    seedbug: {
        id: 'seedbug',
        name: '种子虫',
        emoji: '🐛',
        type: 'grass',
        rarity: 'common',
        baseStats: { hp: 45, attack: 30, defense: 35, speed: 45 },
        evoLevel: 7,
        evoTo: 'leafcoon',
        skills: ['tackle', 'vine_whip'],
        learnSkills: { 5: 'vine_whip', 15: 'razor_leaf' }
    },
    leafcoon: {
        id: 'leafcoon',
        name: '叶蛹',
        emoji: '🐛',
        type: 'grass',
        rarity: 'common',
        baseStats: { hp: 50, attack: 20, defense: 55, speed: 30 },
        evoLevel: 10,
        evoTo: 'flutterleaf',
        skills: ['tackle', 'vine_whip'],
        learnSkills: {}
    },
    flutterleaf: {
        id: 'flutterleaf',
        name: '叶舞蝶',
        emoji: '🦋',
        type: 'grass',
        rarity: 'uncommon',
        baseStats: { hp: 60, attack: 45, defense: 50, speed: 70 },
        evoTo: null,
        skills: ['tackle', 'vine_whip', 'razor_leaf', 'mega_drain'],
        learnSkills: {}
    },
    
    sparkbug: {
        id: 'sparkbug',
        name: '电光虫',
        emoji: '🪲',
        type: 'electric',
        rarity: 'common',
        baseStats: { hp: 30, attack: 45, defense: 40, speed: 75 },
        evoLevel: 15,
        evoTo: 'thunderbeetle',
        skills: ['tackle', 'thunder_shock'],
        learnSkills: { 10: 'spark', 22: 'thunderbolt' }
    },
    thunderbeetle: {
        id: 'thunderbeetle',
        name: '雷霆甲虫',
        emoji: '🐞',
        type: 'electric',
        rarity: 'uncommon',
        baseStats: { hp: 55, attack: 75, defense: 60, speed: 100 },
        evoTo: null,
        skills: ['tackle', 'thunder_shock', 'spark', 'thunderbolt'],
        learnSkills: {}
    },
    
    shadowbat: {
        id: 'shadowbat',
        name: '暗影蝠',
        emoji: '🦇',
        type: 'dark',
        rarity: 'uncommon',
        baseStats: { hp: 40, attack: 45, defense: 35, speed: 55 },
        evoLevel: 22,
        evoTo: 'nightwing',
        skills: ['scratch', 'bite'],
        learnSkills: { 15: 'pursuit', 25: 'crunch' }
    },
    nightwing: {
        id: 'nightwing',
        name: '夜翼蝠',
        emoji: '🦇',
        type: 'dark',
        rarity: 'rare',
        baseStats: { hp: 75, attack: 80, defense: 70, speed: 90 },
        evoTo: null,
        skills: ['scratch', 'bite', 'pursuit', 'crunch', 'shadow_ball'],
        learnSkills: {}
    }
};

// 地图区域配置
const AREAS = {
    meadow: {
        id: 'meadow',
        name: '青青草原',
        emoji: '🌿',
        minLevel: 1,
        maxLevel: 10,
        pets: [
            { id: 'seedbug', chance: 0.25 },
            { id: 'sparkbug', chance: 0.20 },
            { id: 'leafkit', chance: 0.15 },
            { id: 'sparkrat', chance: 0.12 },
            { id: 'bubbletad', chance: 0.10 },
            { id: 'flamepup', chance: 0.10 },
            { id: 'rockling', chance: 0.08 }
        ],
        encountersPerSearch: { min: 1, max: 3 }
    },
    forest: {
        id: 'forest',
        name: '神秘森林',
        emoji: '🌲',
        minLevel: 5,
        maxLevel: 20,
        pets: [
            { id: 'leafkit', chance: 0.20 },
            { id: 'vinehare', chance: 0.15 },
            { id: 'florabound', chance: 0.05 },
            { id: 'flutterleaf', chance: 0.12 },
            { id: 'shadowbat', chance: 0.15 },
            { id: 'boulderbeast', chance: 0.08 },
            { id: 'sparkrat', chance: 0.10 },
            { id: 'voltrat', chance: 0.05 },
            { id: 'infernofang', chance: 0.10 }
        ],
        encountersPerSearch: { min: 1, max: 4 }
    },
    cave: {
        id: 'cave',
        name: '幽暗山洞',
        emoji: '⛰️',
        minLevel: 10,
        maxLevel: 30,
        pets: [
            { id: 'rockling', chance: 0.25 },
            { id: 'boulderbeast', chance: 0.15 },
            { id: 'shadowimp', chance: 0.20 },
            { id: 'nightmare', chance: 0.08 },
            { id: 'shadowbat', chance: 0.18 },
            { id: 'nightwing', chance: 0.05 },
            { id: 'thunderbeetle', chance: 0.09 }
        ],
        encountersPerSearch: { min: 2, max: 4 }
    },
    lake: {
        id: 'lake',
        name: '宁静湖泊',
        emoji: '💧',
        minLevel: 15,
        maxLevel: 35,
        pets: [
            { id: 'bubbletad', chance: 0.20 },
            { id: 'splashfrog', chance: 0.15 },
            { id: 'tsunamigo', chance: 0.08 },
            { id: 'bubblepup', chance: 0.15 },
            { id: 'splashound', chance: 0.12 },
            { id: 'flamepup', chance: 0.10 },
            { id: 'infernofang', chance: 0.08 },
            { id: 'rockling', chance: 0.12 }
        ],
        encountersPerSearch: { min: 2, max: 5 }
    },
    volcano: {
        id: 'volcano',
        name: '烈焰火山',
        emoji: '🌋',
        minLevel: 20,
        maxLevel: 50,
        pets: [
            { id: 'flamepup', chance: 0.20 },
            { id: 'infernofang', chance: 0.15 },
            { id: 'flameow', chance: 0.15 },
            { id: 'flamelion', chance: 0.12 },
            { id: 'infernoble', chance: 0.05 },
            { id: 'boulderbeast', chance: 0.13 },
            { id: 'nightmare', chance: 0.10 },
            { id: 'nightwing', chance: 0.05 },
            { id: 'thunderbeetle', chance: 0.05 }
        ],
        encountersPerSearch: { min: 3, max: 6 }
    }
};

// NPC训练师
const TRAINERS = [
    {
        id: 'trainer1',
        name: '新手训练师小明',
        emoji: '👦',
        desc: '刚开始冒险的新手，带着他的初始宠物',
        level: 5,
        pets: [
            { id: 'seedbug', level: 3 },
            { id: 'sparkbug', level: 4 }
        ],
        reward: 50
    },
    {
        id: 'trainer2',
        name: '森林守护者',
        emoji: '👨‍🌾',
        desc: '热爱自然的守护者，擅长草系宠物',
        level: 15,
        pets: [
            { id: 'leafkit', level: 12 },
            { id: 'flutterleaf', level: 14 },
            { id: 'vinehare', level: 13 }
        ],
        reward: 100
    },
    {
        id: 'trainer3',
        name: '洞穴探险家',
        emoji: '⛑️',
        desc: '深入洞穴寻找宝藏的勇敢探险家',
        level: 25,
        pets: [
            { id: 'rockling', level: 20 },
            { id: 'shadowimp', level: 22 },
            { id: 'boulderbeast', level: 23 }
        ],
        reward: 200
    },
    {
        id: 'trainer4',
        name: '水系大师',
        emoji: '🧜‍♀️',
        desc: '湖泊的守护者，精通水系宠物',
        level: 35,
        pets: [
            { id: 'splashfrog', level: 30 },
            { id: 'splashound', level: 32 },
            { id: 'tsunamigo', level: 33 },
            { id: 'bubblepup', level: 31 }
        ],
        reward: 350
    },
    {
        id: 'trainer5',
        name: '烈焰之王',
        emoji: '👑',
        desc: '火山之巅的最强者，传说中的训练师',
        level: 50,
        pets: [
            { id: 'infernoble', level: 45 },
            { id: 'nightmare', level: 43 },
            { id: 'infernofang', level: 44 },
            { id: 'voltrat', level: 42 },
            { id: 'florabound', level: 41 }
        ],
        reward: 500
    }
];

// 道具数据
const ITEMS = {
    pokeball: {
        id: 'pokeball',
        name: '普通精灵球',
        emoji: '🔴',
        desc: '用来捕捉宠物的基础球',
        price: 50,
        catchRate: 1.0
    },
    greatball: {
        id: 'greatball',
        name: '高级球',
        emoji: '🔵',
        desc: '比普通球更容易捕捉',
        price: 150,
        catchRate: 1.5
    },
    ultraball: {
        id: 'ultraball',
        name: '超级球',
        emoji: '🟡',
        desc: '捕捉率最高的精灵球',
        price: 400,
        catchRate: 2.0
    },
    potion: {
        id: 'potion',
        name: '小型回复药',
        emoji: '🧪',
        desc: '恢复宠物30点HP',
        price: 30,
        heal: 30
    },
    superpotion: {
        id: 'superpotion',
        name: '中型回复药',
        emoji: '🧴',
        desc: '恢复宠物60点HP',
        price: 80,
        heal: 60
    },
    hyperpotion: {
        id: 'hyperpotion',
        name: '超级回复药',
        emoji: '🏥',
        desc: '恢复宠物全部HP',
        price: 200,
        heal: 999
    }
};

// 经验值表 - 优化后的成长曲线
// 设计理念：前期快速成长(1-20)，中期稳定发展(21-50)，后期挑战养成(51-100)
const EXP_TABLE = {
    // 累计经验值表（从0级升到目标级需要的总经验）
    cumulativeExp: [
        0,      // Lv0
        0,      // Lv1 (起点)
        10,     // Lv2  新手期 - 极快
        25,     // Lv3
        45,     // Lv4
        70,     // Lv5
        100,    // Lv6
        135,    // Lv7
        175,    // Lv8
        220,    // Lv9
        270,    // Lv10 第一个小节点
        330,    // Lv11
        400,    // Lv12
        480,    // Lv13
        570,    // Lv14
        670,    // Lv15 进化节点
        780,    // Lv16
        900,    // Lv17
        1030,   // Lv18
        1170,   // Lv19
        1320,   // Lv20 成长期结束
        1500,   // Lv21
        1700,   // Lv22
        1920,   // Lv23
        2160,   // Lv24
        2420,   // Lv25 中期稳定
        2700,   // Lv26
        3000,   // Lv27
        3320,   // Lv28
        3660,   // Lv29
        4020,   // Lv30 第二个进化节点
        4400,   // Lv31
        4820,   // Lv32
        5280,   // Lv33
        5780,   // Lv34
        6320,   // Lv35
        6900,   // Lv36 最终进化
        7520,   // Lv37
        8180,   // Lv38
        8880,   // Lv39
        9620,   // Lv40 中期巅峰
        10400,  // Lv41
        11220,  // Lv42
        12080,  // Lv43
        12980,  // Lv44
        13920,  // Lv45 后期开始
        14900,  // Lv46
        15920,  // Lv47
        16980,  // Lv48
        18080,  // Lv49
        19220,  // Lv50 里程碑
        20400,  // Lv51
        21620,  // Lv52
        22880,  // Lv53
        24180,  // Lv54
        25520,  // Lv55
        26900,  // Lv56
        28320,  // Lv57
        29780,  // Lv58
        31280,  // Lv59
        32820,  // Lv60
        34400,  // Lv61
        36020,  // Lv62
        37680,  // Lv63
        39380,  // Lv64
        41120,  // Lv65
        42900,  // Lv66
        44720,  // Lv67
        46580,  // Lv68
        48480,  // Lv69
        50420,  // Lv70
        52400,  // Lv71
        54420,  // Lv72
        56480,  // Lv73
        58580,  // Lv74
        60720,  // Lv75
        62900,  // Lv76
        65120,  // Lv77
        67380,  // Lv78
        69680,  // Lv79
        72020,  // Lv80
        74400,  // Lv81
        76820,  // Lv82
        79280,  // Lv83
        81780,  // Lv84
        84320,  // Lv85
        86900,  // Lv86
        89520,  // Lv87
        92180,  // Lv88
        94880,  // Lv89
        97620,  // Lv90
        100400, // Lv91
        103220, // Lv92
        106080, // Lv93
        108980, // Lv94
        111920, // Lv95
        114900, // Lv96
        117920, // Lv97
        120980, // Lv98
        124080, // Lv99
        127220  // Lv100 满级
    ],

    // 获取升到某级需要的累计经验
    getExpForLevel: function(level) {
        if (level < 1 || level > 100) return 0;
        return this.cumulativeExp[level] || 0;
    },

    // 获取从当前级升到下一级需要的经验
    getExpToNextLevel: function(currentLevel) {
        if (currentLevel >= 100) return 0;
        return this.getExpForLevel(currentLevel + 1) - this.getExpForLevel(currentLevel);
    },

    // 根据等级差计算经验收益（击败高等级获得更多，低等级获得减少）
    getExpYield: function(baseStats, enemyLevel, playerLevel) {
        // 基础经验 = (种族值总和 / 4) + (等级 / 2)
        const baseExp = Math.floor((baseStats.hp + baseStats.attack + baseStats.defense + baseStats.speed) / 4) + Math.floor(enemyLevel / 2);

        // 等级差修正
        let levelModifier = 1.0;
        const levelDiff = enemyLevel - playerLevel;

        if (levelDiff >= 10) {
            levelModifier = 2.0;      // 越10级：双倍经验
        } else if (levelDiff >= 5) {
            levelModifier = 1.5;      // 越5级：1.5倍
        } else if (levelDiff >= 0) {
            levelModifier = 1.2;      // 同级或略高：1.2倍
        } else if (levelDiff >= -5) {
            levelModifier = 1.0;      // 低5级内：正常
        } else if (levelDiff >= -10) {
            levelModifier = 0.7;      // 低5-10级：减少30%
        } else if (levelDiff >= -15) {
            levelModifier = 0.4;      // 低10-15级：减少60%
        } else {
            levelModifier = 0.1;      // 低15级以上：几乎无经验
        }

        return Math.max(1, Math.floor(baseExp * levelModifier));
    },

    // 获取当前等级的进度百分比
    getLevelProgress: function(currentExp, currentLevel) {
        if (currentLevel >= 100) return 100;
        const expForCurrent = this.getExpForLevel(currentLevel);
        const expForNext = this.getExpForLevel(currentLevel + 1);
        const expInLevel = currentExp - expForCurrent;
        const expNeeded = expForNext - expForCurrent;
        return Math.min(100, Math.floor((expInLevel / expNeeded) * 100));
    }
};

// 导出数据
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PETS_DATA, AREAS, TRAINERS, ITEMS, SKILLS, PET_TYPES, TYPE_EFFECTIVENESS, EXP_TABLE };
}
