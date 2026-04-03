// ===== 捕捉系统 =====

class CatchSystem {
    constructor(gameEngine) {
        this.game = gameEngine;
    }

    // 尝试捕捉宠物
    tryCatch(wildPet, ballType) {
        const item = ITEMS[ballType];
        if (!item || !item.catchRate) {
            return { success: false, message: '无效的精灵球' };
        }

        // 检查是否有足够的精灵球
        if (this.game.player.inventory[ballType] <= 0) {
            return { success: false, message: '没有精灵球了！' };
        }

        // 消耗精灵球
        this.game.player.inventory[ballType]--;

        // 计算捕捉概率
        const maxHp = wildPet.stats.hp;
        const currentHp = wildPet.currentHp;
        const catchRate = this.getCatchRate(wildPet.data.rarity);
        const ballBonus = item.catchRate;

        // 捕捉公式: 基础捕捉率 * 球加成 * HP因子
        // HP越低，捕捉率越高
        const hpFactor = (maxHp * 3 - currentHp * 2) / (maxHp * 3);
        const catchChance = catchRate * ballBonus * hpFactor;

        // 生成捕捉结果
        const roll = Math.random() * 100;
        const caught = roll < catchChance;

        // 生成摇晃次数（增加悬念）
        let shakes = 0;
        if (caught) {
            // 捕捉成功：3次摇晃
            shakes = 3;
        } else {
            // 捕捉失败：根据概率决定在第几次挣脱
            // 失败时给玩家一些希望
            const escapeRoll = Math.random();
            if (escapeRoll < 0.3) shakes = 0;      // 立即挣脱
            else if (escapeRoll < 0.6) shakes = 1; // 摇晃1次
            else if (escapeRoll < 0.85) shakes = 2; // 摇晃2次
            else shakes = 3; // 摇晃3次后挣脱（最接近成功的情况）
        }

        this.game.saveGame();

        return {
            success: true,
            caught: caught,
            shakes: shakes,
            catchChance: catchChance,
            message: caught ? `成功捕捉 ${wildPet.name}！` : `${wildPet.name} 挣脱了！`
        };
    }

    // 获取基础捕捉率
    getCatchRate(rarity) {
        const rates = {
            'common': 45,      // 普通: 45%
            'uncommon': 30,    // 稀有: 30%
            'rare': 20,        // 珍贵: 20%
            'epic': 10,        // 史诗: 10%
            'legendary': 5     // 传说: 5%
        };
        return rates[rarity] || 30;
    }

    // 获取捕捉难度文本
    getDifficultyText(rarity) {
        const texts = {
            'common': '容易',
            'uncommon': '普通',
            'rare': '困难',
            'epic': '极难',
            'legendary': '传说'
        };
        return texts[rarity] || '普通';
    }

    // 获取推荐精灵球
    getRecommendedBall(rarity) {
        switch (rarity) {
            case 'legendary':
            case 'epic':
                return 'ultraball';
            case 'rare':
                return 'greatball';
            default:
                return 'pokeball';
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CatchSystem };
}
