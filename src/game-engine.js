// ===== 游戏引擎核心 =====

class GameEngine {
    constructor() {
        this.player = {
            level: 5,  // 初始等级 5
            exp: 0,
            coins: 100,  // 初始金币 100
            pets: [],
            activePetIndex: 0,
            inventory: {
                pokeball: 5,        // 初始5个精灵球
                greatball: 0,
                ultraball: 0,
                potion: 3,          // 初始3个小型回复药（回复20HP）
                superpotion: 0,     // 中型回复药
                hyperpotion: 0      // 超级回复药
            },
            pokedex: new Set(),
            defeatedTrainers: new Set()
        };
        this.settings = {
            sound: true,
            animation: true
        };
        this.currentArea = null;
        this.battleState = null;
    }

    // 初始化游戏
    init() {
        this.loadGame();
        this.initStarterPet();
        return this;
    }

    // 初始化初始宠物
    initStarterPet() {
        if (this.player.pets.length === 0) {
            // 用户要求的初始宠物：Lv.5 草苗龟
            const starter = this.createPet('grassturtle', 5);
            starter.isStarter = true;
            this.addPet(starter);
        }
    }

    // 创建宠物实例
    createPet(petId, level = 1) {
        const data = PETS_DATA[petId];
        if (!data) return null;

        const ivs = {
            hp: Math.floor(Math.random() * 32),
            attack: Math.floor(Math.random() * 32),
            defense: Math.floor(Math.random() * 32),
            speed: Math.floor(Math.random() * 32)
        };

        const stats = this.calculateStats(data.baseStats, level, ivs);
        
        return {
            id: petId,
            instanceId: Date.now() + Math.random().toString(36).substr(2, 9),
            name: data.name,
            emoji: data.emoji,
            type: data.type,
            level: level,
            exp: EXP_TABLE.getExpForLevel(level),
            expToNext: EXP_TABLE.getExpToNextLevel(level),
            totalExp: EXP_TABLE.getExpForLevel(level),
            ivs: ivs,
            stats: stats,
            currentHp: stats.hp,
            skills: this.getSkillsForLevel(data, level),
            data: data
        };
    }

    // 计算宠物属性 - 优化后的成长曲线
    // 公式设计：基础值影响50%，等级成长50%，IV提供随机性(0-31)
    calculateStats(baseStats, level, ivs) {
        // 等级系数：前期成长较快，后期趋于稳定
        // 使用平滑曲线: 等级^0.85 / 10，让高等级仍有明显成长
        const levelFactor = Math.pow(level, 0.85) / 10;
        
        return {
            hp: Math.floor((baseStats.hp + ivs.hp / 2) * levelFactor) + level * 2 + 20,
            attack: Math.floor((baseStats.attack + ivs.attack / 2) * levelFactor) + level + 5,
            defense: Math.floor((baseStats.defense + ivs.defense / 2) * levelFactor) + level + 5,
            speed: Math.floor((baseStats.speed + ivs.speed / 2) * levelFactor) + level + 5
        };
    }

    // 根据等级获取技能
    getSkillsForLevel(petData, level) {
        const skills = [];
        const defaultSkills = petData.skills || [];
        
        // 添加默认技能
        if (defaultSkills.length > 0) {
            skills.push(defaultSkills[0]);
            if (defaultSkills.length > 1 && level >= 5) {
                skills.push(defaultSkills[1]);
            }
        }

        // 根据等级添加习得技能
        if (petData.learnSkills) {
            for (const [lvl, skillId] of Object.entries(petData.learnSkills)) {
                if (level >= parseInt(lvl) && !skills.includes(skillId)) {
                    skills.push(skillId);
                }
            }
        }

        return skills.slice(0, 4);
    }

    // 添加宠物到队伍
    addPet(pet) {
        if (this.player.pets.length < 6) {
            this.player.pets.push(pet);
            this.player.pokedex.add(pet.id);
            this.saveGame();
            return true;
        }
        return false;
    }

    // 切换出战宠物
    switchActivePet(index) {
        if (index >= 0 && index < this.player.pets.length) {
            this.player.activePetIndex = index;
            this.saveGame();
            return true;
        }
        return false;
    }

    // 获得经验值 - 使用新的经验系统
    gainExp(pet, exp) {
        pet.totalExp += exp;
        let leveledUp = false;
        let levelsGained = 0;
        
        // 检查是否可以升级
        while (pet.level < 100) {
            const expForNext = EXP_TABLE.getExpForLevel(pet.level + 1);
            if (pet.totalExp >= expForNext) {
                pet.level++;
                levelsGained++;
                leveledUp = true;
                
                // 更新属性
                pet.stats = this.calculateStats(pet.data.baseStats, pet.level, pet.ivs);
                pet.currentHp = pet.stats.hp;
                
                // 更新技能
                const newSkills = this.getSkillsForLevel(pet.data, pet.level);
                newSkills.forEach(skillId => {
                    if (!pet.skills.includes(skillId)) {
                        pet.skills.push(skillId);
                        if (pet.skills.length > 4) {
                            pet.skills.shift();
                        }
                    }
                });
                
                // 检查进化
                this.checkEvolution(pet);
            } else {
                break;
            }
        }
        
        // 更新经验显示值
        pet.expToNext = EXP_TABLE.getExpToNextLevel(pet.level);
        
        this.saveGame();
        return { leveledUp, levelsGained, newLevel: pet.level };
    }

    // 检查进化
    checkEvolution(pet) {
        if (pet.data.evoLevel && pet.level >= pet.data.evoLevel && pet.data.evoTo) {
            const newData = PETS_DATA[pet.data.evoTo];
            if (newData) {
                pet.id = pet.data.evoTo;
                pet.name = newData.name;
                pet.emoji = newData.emoji;
                pet.data = newData;
                pet.stats = this.calculateStats(newData.baseStats, pet.level, pet.ivs);
                pet.currentHp = pet.stats.hp;
                return true;
            }
        }
        return false;
    }

    // 探索区域
    exploreArea(areaId) {
        const area = AREAS[areaId];
        if (!area) return null;

        this.currentArea = area;
        
        // 根据区域等级范围随机生成野生宠物
        const minLevel = Math.max(area.minLevel, this.player.level - 5);
        const maxLevel = Math.min(area.maxLevel, this.player.level + 5);
        const level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
        
        // 根据概率选择宠物
        const rand = Math.random();
        let cumulativeChance = 0;
        let selectedPet = area.pets[0];
        
        for (const petChance of area.pets) {
            cumulativeChance += petChance.chance;
            if (rand <= cumulativeChance) {
                selectedPet = petChance;
                break;
            }
        }
        
        return {
            pet: this.createPet(selectedPet.id, level),
            area: area
        };
    }

    // 使用道具
    useItem(itemId, target = null) {
        const item = ITEMS[itemId];
        if (!item || this.player.inventory[itemId] <= 0) {
            return { success: false, message: '没有该道具' };
        }

        // 精灵球
        if (item.catchRate) {
            return { success: true, isBall: true, item: item };
        }

        // 回复道具
        if (item.heal && target) {
            const oldHp = target.currentHp;
            target.currentHp = Math.min(target.stats.hp, target.currentHp + item.heal);
            const healed = target.currentHp - oldHp;
            this.player.inventory[itemId]--;
            this.saveGame();
            return { 
                success: true, 
                message: `${target.name} 恢复了 ${healed} 点HP`,
                healed: healed
            };
        }

        return { success: false, message: '无法使用该道具' };
    }

    // 购买道具
    buyItem(itemId, quantity = 1) {
        const item = ITEMS[itemId];
        if (!item) return { success: false, message: '道具不存在' };

        const totalPrice = item.price * quantity;
        if (this.player.coins < totalPrice) {
            return { success: false, message: '金币不足' };
        }

        this.player.coins -= totalPrice;
        this.player.inventory[itemId] = (this.player.inventory[itemId] || 0) + quantity;
        this.saveGame();
        return { success: true, message: `购买了 ${quantity} 个 ${item.name}` };
    }

    // 存档
    saveGame() {
        const saveData = {
            player: {
                ...this.player,
                pokedex: Array.from(this.player.pokedex),
                defeatedTrainers: Array.from(this.player.defeatedTrainers)
            },
            settings: this.settings,
            timestamp: Date.now()
        };
        localStorage.setItem('petCatcherSave', JSON.stringify(saveData));
    }

    // 读档
    loadGame() {
        const saveData = localStorage.getItem('petCatcherSave');
        if (saveData) {
            try {
                const parsed = JSON.parse(saveData);
                if (parsed.player) {
                    this.player = {
                        ...parsed.player,
                        pokedex: new Set(parsed.player.pokedex || []),
                        defeatedTrainers: new Set(parsed.player.defeatedTrainers || [])
                    };
                }
                if (parsed.settings) {
                    this.settings = parsed.settings;
                }
                return true;
            } catch (e) {
                console.error('存档读取失败:', e);
            }
        }
        return false;
    }

    // 重置游戏
    resetGame() {
        localStorage.removeItem('petCatcherSave');
        this.player = {
            level: 5,  // 初始等级 5
            exp: 0,
            coins: 100,  // 初始金币 100
            pets: [],
            activePetIndex: 0,
            inventory: {
                pokeball: 5,
                greatball: 0,
                ultraball: 0,
                potion: 3,
                superpotion: 0,
                hyperpotion: 0
            },
            pokedex: new Set(),
            defeatedTrainers: new Set()
        };
        this.initStarterPet();
        this.saveGame();
    }

    // 获得金币
    addCoins(amount) {
        this.player.coins += amount;
        this.saveGame();
    }

    // 获得图鉴
    addToPokedex(petId) {
        this.player.pokedex.add(petId);
        this.saveGame();
    }

    // 击败训练师
    defeatTrainer(trainerId) {
        this.player.defeatedTrainers.add(trainerId);
        this.saveGame();
    }

    // 获取图鉴完成度
    getPokedexProgress() {
        const total = Object.keys(PETS_DATA).length;
        const caught = this.player.pokedex.size;
        return { total, caught, percentage: Math.floor((caught / total) * 100) };
    }
}
