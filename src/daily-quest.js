// ===== 每日任务系统 =====

class DailyQuestSystem {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.quests = [];
        this.lastRefreshDate = null;
        
        // 任务类型定义
        this.QUEST_TYPES = {
            CATCH_FIRE: { id: 'catch_fire', name: '捕捉火系宠物', target: 3, reward: { coins: 100, exp: 50 } },
            CATCH_WATER: { id: 'catch_water', name: '捕捉水系宠物', target: 3, reward: { coins: 100, exp: 50 } },
            CATCH_GRASS: { id: 'catch_grass', name: '捕捉草系宠物', target: 3, reward: { coins: 100, exp: 50 } },
            CATCH_ELECTRIC: { id: 'catch_electric', name: '捕捉电系宠物', target: 2, reward: { coins: 120, exp: 60 } },
            CATCH_EARTH: { id: 'catch_earth', name: '捕捉土系宠物', target: 2, reward: { coins: 120, exp: 60 } },
            CATCH_DARK: { id: 'catch_dark', name: '捕捉暗系宠物', target: 2, reward: { coins: 150, exp: 80 } },
            WIN_BATTLE: { id: 'win_battle', name: '赢得战斗', target: 5, reward: { coins: 150, exp: 100 } },
            USE_BALL: { id: 'use_ball', name: '使用精灵球', target: 10, reward: { coins: 80, exp: 40 } },
            CATCH_RARE: { id: 'catch_rare', name: '捕捉稀有宠物', target: 1, reward: { coins: 200, exp: 150 } },
            LEVEL_UP: { id: 'level_up', name: '宠物升级', target: 3, reward: { coins: 100, exp: 80 } },
            HEAL_PET: { id: 'heal_pet', name: '回复宠物HP', target: 5, reward: { coins: 60, exp: 30 } },
            VISIT_SHOP: { id: 'visit_shop', name: '访问商店', target: 1, reward: { coins: 50, exp: 20 } }
        };
    }

    // 初始化 - 检查是否需要刷新任务
    init() {
        const today = this.getTodayString();
        const savedData = this.loadQuests();
        
        if (savedData && savedData.lastRefreshDate === today) {
            // 今天已经生成过任务了，恢复进度
            this.quests = savedData.quests || [];
            this.lastRefreshDate = savedData.lastRefreshDate;
        } else {
            // 新的一天，生成新任务
            this.generateDailyQuests();
        }
    }

    // 获取今天日期字符串 YYYY-MM-DD
    getTodayString() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    }

    // 生成每日任务
    generateDailyQuests() {
        const questPool = Object.values(this.QUEST_TYPES);
        this.quests = [];
        
        // 随机选择3个不同类型的任务
        const shuffled = [...questPool].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, 3);
        
        for (const questType of selected) {
            this.quests.push({
                id: questType.id,
                name: questType.name,
                target: questType.target,
                progress: 0,
                completed: false,
                claimed: false,
                reward: questType.reward
            });
        }
        
        this.lastRefreshDate = this.getTodayString();
        this.saveQuests();
    }

    // 获取当前任务列表
    getQuests() {
        // 检查是否需要刷新
        const today = this.getTodayString();
        if (this.lastRefreshDate !== today) {
            this.generateDailyQuests();
        }
        return this.quests;
    }

    // 更新任务进度
    updateProgress(questId, amount = 1) {
        const quest = this.quests.find(q => q.id === questId);
        if (quest && !quest.completed) {
            quest.progress = Math.min(quest.progress + amount, quest.target);
            if (quest.progress >= quest.target) {
                quest.completed = true;
                return { completed: true, quest: quest };
            }
            this.saveQuests();
            return { completed: false, quest: quest };
        }
        return null;
    }

    // 领取奖励
    claimReward(questId) {
        const quest = this.quests.find(q => q.id === questId);
        if (quest && quest.completed && !quest.claimed) {
            quest.claimed = true;
            
            // 发放奖励
            this.game.player.coins += quest.reward.coins;
            
            // 经验奖励给所有出战宠物
            this.game.player.pets.forEach(pet => {
                this.game.gainExp(pet, quest.reward.exp);
            });
            
            this.saveQuests();
            this.game.saveGame();
            
            return {
                success: true,
                reward: quest.reward,
                message: `获得 ${quest.reward.coins} 金币和 ${quest.reward.exp} 经验！`
            };
        }
        return { success: false, message: '无法领取奖励' };
    }

    // 获取任务完成状态统计
    getStats() {
        const total = this.quests.length;
        const completed = this.quests.filter(q => q.completed).length;
        const claimed = this.quests.filter(q => q.claimed).length;
        return { total, completed, claimed };
    }

    // 保存任务数据
    saveQuests() {
        const data = {
            quests: this.quests,
            lastRefreshDate: this.lastRefreshDate
        };
        localStorage.setItem('petCatcherQuests', JSON.stringify(data));
    }

    // 加载任务数据
    loadQuests() {
        const data = localStorage.getItem('petCatcherQuests');
        if (data) {
            try {
                return JSON.parse(data);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    // ========== 快捷更新方法 ==========

    // 捕捉宠物时调用
    onCatchPet(pet) {
        // 根据属性更新进度
        const typeMap = {
            'fire': 'CATCH_FIRE',
            'water': 'CATCH_WATER',
            'grass': 'CATCH_GRASS',
            'electric': 'CATCH_ELECTRIC',
            'earth': 'CATCH_EARTH',
            'dark': 'CATCH_DARK'
        };
        
        if (typeMap[pet.type]) {
            this.updateProgress(typeMap[pet.type].toLowerCase(), 1);
        }
        
        // 稀有宠物
        if (pet.data.rarity === 'rare' || pet.data.rarity === 'epic') {
            this.updateProgress('catch_rare', 1);
        }
        
        // 使用精灵球也算进度
        this.updateProgress('use_ball', 1);
    }

    // 战斗胜利时调用
    onWinBattle() {
        this.updateProgress('win_battle', 1);
    }

    // 使用道具时调用
    onUseItem(itemId) {
        if (itemId.includes('ball')) {
            this.updateProgress('use_ball', 1);
        }
        if (itemId.includes('potion')) {
            this.updateProgress('heal_pet', 1);
        }
    }

    // 宠物升级时调用
    onLevelUp() {
        this.updateProgress('level_up', 1);
    }

    // 访问商店时调用
    onVisitShop() {
        this.updateProgress('visit_shop', 1);
    }
}
