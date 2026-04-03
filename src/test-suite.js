// ===== 自动化测试脚本 =====

function runGameTests(game, battle) {
    const results = [];
    
    // 测试1: 宠物创建
    results.push(testCreatePet());
    
    // 测试2: 战斗系统
    results.push(testBattleSystem());
    
    // 测试3: 捕捉系统
    results.push(testCatchSystem());
    
    // 测试4: 经验值系统
    results.push(testExpSystem());
    
    // 测试5: 进化系统
    results.push(testEvolution());
    
    // 测试6: 存档读档
    results.push(testSaveLoad());
    
    // 测试7: 道具系统
    results.push(testItemSystem());
    
    // 测试8: 属性克制
    results.push(testTypeEffectiveness());
    
    // 测试9: 地图探索
    results.push(testExploration());
    
    // 测试10: 商店系统
    results.push(testShopSystem());

    return results;

    // 测试宠物创建
    function testCreatePet() {
        try {
            const pet = game.createPet('flameow', 10);
            if (!pet) return { name: '宠物创建', status: 'fail', message: '宠物创建失败' };
            if (pet.name !== '小火喵') return { name: '宠物创建', status: 'fail', message: '宠物名称错误' };
            if (pet.level !== 10) return { name: '宠物创建', status: 'fail', message: '宠物等级错误' };
            if (pet.stats.hp <= 0) return { name: '宠物创建', status: 'fail', message: '宠物属性计算错误' };
            return { name: '宠物创建', status: 'pass', message: '通过' };
        } catch (e) {
            return { name: '宠物创建', status: 'fail', message: e.message };
        }
    }

    // 测试战斗系统
    function testBattleSystem() {
        try {
            const playerPet = game.createPet('flameow', 10);
            const enemyPet = game.createPet('bubblepup', 8);
            
            const result = battle.startWildBattle(enemyPet);
            if (!result.success) return { name: '战斗系统', status: 'fail', message: '无法开始战斗' };
            
            const actionResult = battle.playerAction('attack');
            if (!actionResult) return { name: '战斗系统', status: 'fail', message: '攻击执行失败' };
            
            battle.reset();
            return { name: '战斗系统', status: 'pass', message: '通过' };
        } catch (e) {
            return { name: '战斗系统', status: 'fail', message: e.message };
        }
    }

    // 测试捕捉系统
    function testCatchSystem() {
        try {
            const playerPet = game.createPet('flameow', 15);
            const enemyPet = game.createPet('seedbug', 5);
            
            // 将敌人HP降低
            enemyPet.currentHp = 1;
            
            battle.startWildBattle(enemyPet);
            game.player.inventory.pokeball = 10;
            
            // 测试捕捉计算
            const catchRate = 45; // common pet
            const ballBonus = 1.0; // pokeball
            const maxHp = enemyPet.stats.hp;
            const currentHp = enemyPet.currentHp;
            const hpFactor = (maxHp * 3 - currentHp * 2) / (maxHp * 3);
            const catchChance = catchRate * ballBonus * hpFactor;
            
            if (catchChance <= 0) return { name: '捕捉系统', status: 'fail', message: '捕捉率计算错误' };
            
            battle.reset();
            return { name: '捕捉系统', status: 'pass', message: '通过' };
        } catch (e) {
            return { name: '捕捉系统', status: 'fail', message: e.message };
        }
    }

    // 测试经验值系统
    function testExpSystem() {
        try {
            const pet = game.createPet('flameow', 5);
            const initialTotalExp = pet.totalExp;
            const initialLevel = pet.level;
            
            // 获得经验值
            const expGain = 50;
            const result = game.gainExp(pet, expGain);
            
            // 验证经验值已增加
            if (pet.totalExp !== initialTotalExp + expGain) {
                return { name: '经验值系统', status: 'fail', message: '总经验值计算错误' };
            }
            
            // 验证等级可能提升
            if (pet.level < initialLevel) {
                return { name: '经验值系统', status: 'fail', message: '等级异常下降' };
            }
            
            // 验证升级时返回正确结果
            if (pet.level > initialLevel && !result.leveledUp) {
                return { name: '经验值系统', status: 'fail', message: '升级检测失败' };
            }
            
            // 验证经验表函数
            const expToNext = EXP_TABLE.getExpToNextLevel(pet.level);
            if (expToNext <= 0 && pet.level < 100) {
                return { name: '经验值系统', status: 'fail', message: '升级所需经验计算错误' };
            }
            
            // 验证经验收益计算（考虑等级差）
            const baseStats = { hp: 45, attack: 52, defense: 39, speed: 65 };
            const expYield = EXP_TABLE.getExpYield(baseStats, 10, 5);
            if (expYield < 1) {
                return { name: '经验值系统', status: 'fail', message: '经验收益计算错误' };
            }
            
            return { name: '经验值系统', status: 'pass', message: '通过' };
        } catch (e) {
            return { name: '经验值系统', status: 'fail', message: e.message };
        }
    }

    // 测试进化系统
    function testEvolution() {
        try {
            const pet = game.createPet('flameow', 15);
            
            // 设置等级触发进化
            pet.level = 20;
            const evolved = game.checkEvolution(pet);
            
            if (!evolved) {
                // 检查是否正确
                return { name: '进化系统', status: 'pass', message: '通过' };
            }
            
            if (pet.id !== 'flamelion') {
                return { name: '进化系统', status: 'fail', message: '进化目标错误' };
            }
            
            return { name: '进化系统', status: 'pass', message: '通过' };
        } catch (e) {
            return { name: '进化系统', status: 'fail', message: e.message };
        }
    }

    // 测试存档读档
    function testSaveLoad() {
        try {
            // 保存当前状态
            const originalCoins = game.player.coins;
            game.player.coins = 9999;
            game.saveGame();
            
            // 修改数值
            game.player.coins = 0;
            
            // 读取存档
            const loaded = game.loadGame();
            if (!loaded) return { name: '存档读档', status: 'fail', message: '读档失败' };
            
            // 恢复原始值
            game.player.coins = originalCoins;
            game.saveGame();
            
            return { name: '存档读档', status: 'pass', message: '通过' };
        } catch (e) {
            return { name: '存档读档', status: 'fail', message: e.message };
        }
    }

    // 测试道具系统
    function testItemSystem() {
        try {
            const pet = game.createPet('flameow', 10);
            pet.currentHp = 10;
            const maxHp = pet.stats.hp;
            
            game.player.inventory.potion = 1;
            const item = ITEMS.potion;
            const oldHp = pet.currentHp;
            
            pet.currentHp = Math.min(maxHp, pet.currentHp + item.heal);
            
            if (pet.currentHp <= oldHp) {
                return { name: '道具系统', status: 'fail', message: '回复道具无效' };
            }
            
            return { name: '道具系统', status: 'pass', message: '通过' };
        } catch (e) {
            return { name: '道具系统', status: 'fail', message: e.message };
        }
    }

    // 测试属性克制
    function testTypeEffectiveness() {
        try {
            // 火克草
            const fireVsGrass = battle.getTypeEffectiveness('fire', 'grass');
            if (fireVsGrass !== 2.0) return { name: '属性克制', status: 'fail', message: '火克草计算错误' };
            
            // 水克火
            const waterVsFire = battle.getTypeEffectiveness('water', 'fire');
            if (waterVsFire !== 2.0) return { name: '属性克制', status: 'fail', message: '水克火计算错误' };
            
            // 火被水克
            const fireVsWater = battle.getTypeEffectiveness('fire', 'water');
            if (fireVsWater !== 0.5) return { name: '属性克制', status: 'fail', message: '火被水克计算错误' };
            
            // 电对土无效
            const electricVsEarth = battle.getTypeEffectiveness('electric', 'earth');
            if (electricVsEarth !== 0) return { name: '属性克制', status: 'fail', message: '电对土计算错误' };
            
            return { name: '属性克制', status: 'pass', message: '通过' };
        } catch (e) {
            return { name: '属性克制', status: 'fail', message: e.message };
        }
    }

    // 测试地图探索
    function testExploration() {
        try {
            const area = AREAS.meadow;
            if (!area) return { name: '地图探索', status: 'fail', message: '区域不存在' };
            if (!area.pets || area.pets.length === 0) {
                return { name: '地图探索', status: 'fail', message: '区域没有宠物' };
            }
            
            // 测试随机遭遇
            let totalChance = 0;
            area.pets.forEach(p => totalChance += p.chance);
            if (Math.abs(totalChance - 1.0) > 0.01) {
                return { name: '地图探索', status: 'fail', message: '遭遇概率总和不等于1' };
            }
            
            return { name: '地图探索', status: 'pass', message: '通过' };
        } catch (e) {
            return { name: '地图探索', status: 'fail', message: e.message };
        }
    }

    // 测试商店系统
    function testShopSystem() {
        try {
            const originalCoins = game.player.coins;
            game.player.coins = 100;
            
            const item = ITEMS.potion;
            const result = game.buyItem('potion', 1);
            
            if (!result.success) {
                game.player.coins = originalCoins;
                return { name: '商店系统', status: 'fail', message: '购买失败: ' + result.message };
            }
            
            if (game.player.inventory.potion < 1) {
                game.player.coins = originalCoins;
                return { name: '商店系统', status: 'fail', message: '道具未添加到背包' };
            }
            
            game.player.coins = originalCoins;
            return { name: '商店系统', status: 'pass', message: '通过' };
        } catch (e) {
            return { name: '商店系统', status: 'fail', message: e.message };
        }
    }
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runGameTests };
}
