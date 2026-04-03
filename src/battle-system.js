// ===== 战斗系统 =====

class BattleSystem {
    constructor(gameEngine) {
        this.game = gameEngine;
        this.catchSystem = new CatchSystem(gameEngine);
        this.state = null;
    }

    // 开始野生宠物战斗
    startWildBattle(wildPet) {
        const playerPet = this.game.player.pets[this.game.player.activePetIndex];
        if (!playerPet || playerPet.currentHp <= 0) {
            return { success: false, message: '没有可战斗的宠物' };
        }

        this.state = {
            type: 'wild',
            playerPet: playerPet,
            enemyPet: wildPet,
            turn: 1,
            escaped: false,
            caught: false,
            ended: false,
            log: ['野生 ' + wildPet.name + ' 出现了！']
        };

        return { success: true, state: this.state };
    }

    // 开始NPC对战
    startNPCBattle(trainer) {
        const playerPet = this.game.player.pets[this.game.player.activePetIndex];
        if (!playerPet || playerPet.currentHp <= 0) {
            return { success: false, message: '没有可战斗的宠物' };
        }

        const enemyPet = this.game.createPet(trainer.pets[0].id, trainer.pets[0].level);
        
        this.state = {
            type: 'npc',
            trainer: trainer,
            trainerPetIndex: 0,
            playerPet: playerPet,
            enemyPet: enemyPet,
            turn: 1,
            escaped: false,
            caught: false,
            ended: false,
            log: [trainer.name + ' 派出了 ' + enemyPet.name + '！']
        };

        return { success: true, state: this.state };
    }

    // 执行玩家回合
    playerAction(action, data = null) {
        if (!this.state || this.state.ended) return null;

        let result = { log: [] };

        switch (action) {
            case 'attack':
                result = this.executeAttack(this.state.playerPet, this.state.enemyPet);
                break;
            case 'skill':
                if (data) {
                    result = this.executeSkill(this.state.playerPet, this.state.enemyPet, data);
                }
                break;
            case 'item':
                if (data) {
                    result = this.useItem(data);
                    if (result.skipEnemyTurn) {
                        this.updateBattleLog(result.log);
                        this.game.saveGame();
                        return { state: this.state, result: result };
                    }
                }
                break;
            case 'catch':
                if (data) {
                    return this.executeCatch(data);
                }
                break;
            case 'switch':
                if (data !== null) {
                    result = this.switchPet(data);
                }
                break;
            case 'run':
                return this.tryEscape();
        }

        // 更新日志
        if (result.log) {
            this.state.log.push(...result.log);
        }

        // 检查战斗结束
        if (this.checkBattleEnd()) {
            return this.endBattle();
        }

        // 如果逃跑成功或被捕捉，结束战斗
        if (this.state.escaped || this.state.caught) {
            return this.endBattle();
        }

        // 敌方回合
        if (!result.skipEnemyTurn) {
            const enemyResult = this.enemyTurn();
            this.state.log.push(...enemyResult.log);
            
            if (this.checkBattleEnd()) {
                return this.endBattle();
            }
        }

        this.state.turn++;
        this.game.saveGame();
        return { state: this.state, result: result };
    }

    // 执行普通攻击
    executeAttack(attacker, defender) {
        const damage = this.calculateDamage(attacker, defender, 40, 'normal', 'physical');
        defender.currentHp = Math.max(0, defender.currentHp - damage);

        return {
            log: [`${attacker.name} 使用普通攻击，对 ${defender.name} 造成 ${damage} 点伤害！`],
            damage: damage,
            skipEnemyTurn: false
        };
    }

    // 执行技能
    executeSkill(attacker, defender, skillId) {
        const skill = SKILLS[skillId];
        if (!skill) return { log: ['技能不存在！'], skipEnemyTurn: false };

        // 检查命中率
        if (Math.random() * 100 > skill.accuracy) {
            return { log: [`${attacker.name} 使用 ${skill.name}，但是没命中！`], skipEnemyTurn: false };
        }

        let logs = [`${attacker.name} 使用 ${skill.name}！`];
        let result = { damage: 0, skipEnemyTurn: false };

        if (skill.power > 0) {
            const effectiveness = this.getTypeEffectiveness(skill.type, defender.type);
            const damage = this.calculateDamage(attacker, defender, skill.power, skill.type, skill.category);
            defender.currentHp = Math.max(0, defender.currentHp - damage);
            result.damage = damage;

            if (effectiveness > 1) {
                logs.push('效果拔群！');
            } else if (effectiveness < 1 && effectiveness > 0) {
                logs.push('效果不太好...');
            } else if (effectiveness === 0) {
                logs.push('没有造成伤害...');
            }
        }

        // 处理特殊效果
        if (skill.effect) {
            switch (skill.effect) {
                case 'heal':
                    const healAmount = Math.floor(result.damage * 0.5);
                    attacker.currentHp = Math.min(attacker.stats.hp, attacker.currentHp + healAmount);
                    logs.push(`${attacker.name} 吸收了 ${healAmount} 点HP！`);
                    break;
                case 'lower_attack':
                    logs.push(`${defender.name} 的攻击力下降了！`);
                    break;
                case 'lower_accuracy':
                    logs.push(`${defender.name} 的命中率下降了！`);
                    break;
            }
        }

        return { log: logs, ...result };
    }

    // 计算伤害 - 简化版：伤害 = 攻击方攻击力 - 防御方防御力，随机波动 0.8~1.2 倍，不低于 1
    calculateDamage(attacker, defender, power, type, category) {
        // 基础伤害 = 攻击方攻击力 - 防御方防御力 (简化计算)
        let baseDamage = attacker.stats.attack - defender.stats.defense;
        if (baseDamage < 1) baseDamage = 1;
        
        // 技能威力加成
        let damage = Math.floor(baseDamage * (power / 50));
        
        // 属性克制
        const effectiveness = this.getTypeEffectiveness(type, defender.type);
        damage = Math.floor(damage * effectiveness);
        
        // 随机波动 0.8~1.2 倍
        const randomFactor = 0.8 + Math.random() * 0.4;
        damage = Math.floor(damage * randomFactor);
        
        // 确保最低1点伤害
        return Math.max(1, damage);
    }

    // 获取属性克制倍率
    getTypeEffectiveness(attackType, defendType) {
        if (attackType === 'normal') return 1.0;
        if (TYPE_EFFECTIVENESS[attackType] && TYPE_EFFECTIVENESS[attackType][defendType]) {
            return TYPE_EFFECTIVENESS[attackType][defendType];
        }
        return 1.0;
    }

    // 使用道具
    useItem(itemId) {
        const item = ITEMS[itemId];
        if (!item) return { log: ['道具不存在！'], skipEnemyTurn: false };

        if (this.game.player.inventory[itemId] <= 0) {
            return { log: ['没有该道具！'], skipEnemyTurn: false };
        }

        // 精灵球只能在野生战斗中使用
        if (item.catchRate) {
            if (this.state.type !== 'wild') {
                return { log: ['不能在对战中捕捉训练师的宠物！'], skipEnemyTurn: false };
            }
            return { log: [], isBall: true, item: item, skipEnemyTurn: false };
        }

        // 回复道具
        if (item.heal) {
            this.game.player.inventory[itemId]--;
            const oldHp = this.state.playerPet.currentHp;
            this.state.playerPet.currentHp = Math.min(
                this.state.playerPet.stats.hp,
                this.state.playerPet.currentHp + item.heal
            );
            const healed = this.state.playerPet.currentHp - oldHp;
            this.game.saveGame();
            return { 
                log: [`使用了 ${item.name}，${this.state.playerPet.name} 恢复了 ${healed} 点HP！`],
                healed: healed,
                skipEnemyTurn: false
            };
        }

        return { log: ['无法使用该道具！'], skipEnemyTurn: false };
    }

    // 执行捕捉
    executeCatch(ballType) {
        if (this.state.type !== 'wild') {
            return { 
                state: this.state, 
                result: { log: ['不能捕捉训练师的宠物！'] },
                end: false 
            };
        }

        const catchResult = this.catchSystem.tryCatch(this.state.enemyPet, ballType);
        
        this.state.log.push(`使用了 ${ITEMS[ballType].name}！`);
        
        if (catchResult.caught) {
            this.state.log.push(catchResult.message);
            this.state.caught = true;
            this.state.ended = true;
            
            // 添加到队伍
            this.game.addPet(this.state.enemyPet);
            this.game.addToPokedex(this.state.enemyPet.id);
            
            return { state: this.state, result: { caught: true, log: this.state.log }, end: true };
        } else {
            this.state.log.push(catchResult.message);
            
            // 敌方回合
            const enemyResult = this.enemyTurn();
            this.state.log.push(...enemyResult.log);
            
            if (this.checkBattleEnd()) {
                return this.endBattle();
            }
            
            this.state.turn++;
            return { state: this.state, result: { caught: false, log: this.state.log }, end: false };
        }
    }

    // 切换宠物
    switchPet(index) {
        if (index < 0 || index >= this.game.player.pets.length) {
            return { log: ['无效的宠物索引'], skipEnemyTurn: false };
        }

        const newPet = this.game.player.pets[index];
        if (newPet.currentHp <= 0) {
            return { log: [`${newPet.name} 已经失去战斗能力，无法出战！`], skipEnemyTurn: false };
        }

        this.state.playerPet = newPet;
        this.game.player.activePetIndex = index;
        this.game.saveGame();

        return {
            log: [`去吧，${newPet.name}！`],
            skipEnemyTurn: false
        };
    }

    // 尝试逃跑
    tryEscape() {
        if (this.state.type === 'npc') {
            this.state.log.push('不能从训练师对战中逃跑！');
            return { state: this.state, result: { escaped: false }, end: false };
        }

        // 逃跑成功率与速度差有关
        const speedDiff = this.state.playerPet.stats.speed - this.state.enemyPet.stats.speed;
        let escapeChance = 50 + speedDiff;
        // 限制在 20% - 90% 之间
        escapeChance = Math.max(20, Math.min(90, escapeChance));
        
        if (Math.random() * 100 < escapeChance) {
            this.state.escaped = true;
            this.state.ended = true;
            this.state.log.push('成功逃跑了！');
            return { state: this.state, result: { escaped: true, log: this.state.log }, end: true };
        } else {
            this.state.log.push('逃跑失败！');
            
            // 敌方回合
            const enemyResult = this.enemyTurn();
            this.state.log.push(...enemyResult.log);
            
            if (this.checkBattleEnd()) {
                return this.endBattle();
            }
            
            this.state.turn++;
            return { state: this.state, result: { escaped: false, log: this.state.log }, end: false };
        }
    }

    // 敌方回合
    enemyTurn() {
        const enemy = this.state.enemyPet;
        const player = this.state.playerPet;
        
        // 随机选择行动
        const actions = ['attack'];
        if (enemy.skills.length > 0) {
            actions.push('skill');
            if (Math.random() < 0.7) actions.push('skill'); // 70%概率优先使用技能
        }
        
        const action = actions[Math.floor(Math.random() * actions.length)];
        
        if (action === 'skill' && enemy.skills.length > 0) {
            const skillId = enemy.skills[Math.floor(Math.random() * enemy.skills.length)];
            return this.executeSkill(enemy, player, skillId);
        } else {
            return this.executeAttack(enemy, player);
        }
    }

    // 检查战斗是否结束
    checkBattleEnd() {
        if (this.state.playerPet.currentHp <= 0) {
            this.state.ended = true;
            return true;
        }
        if (this.state.enemyPet.currentHp <= 0) {
            this.state.ended = true;
            return true;
        }
        return false;
    }

    // 结束战斗
    endBattle() {
        let result = {
            victory: false,
            exp: 0,
            coins: 0,
            caught: this.state.caught,
            escaped: this.state.escaped,
            log: []
        };

        if (this.state.caught) {
            result.victory = true;
            result.log.push(`成功捕捉了 ${this.state.enemyPet.name}！`);
            
            // 捕捉获得少量经验
            const expGain = Math.floor(this.state.enemyPet.level * 5);
            const levelResult = this.game.gainExp(this.state.playerPet, expGain);
            if (levelResult.leveledUp) {
                result.log.push(`${this.state.playerPet.name} 升到了 ${levelResult.newLevel} 级！`);
            }
        } else if (this.state.escaped) {
            result.log.push('成功逃离战斗。');
        } else if (this.state.playerPet.currentHp <= 0) {
            result.log.push(`${this.state.playerPet.name} 失去战斗能力...`);
            result.log.push('战斗失败！');
            // 失败惩罚：HP减半（不低于1）
            this.state.playerPet.currentHp = Math.max(1, Math.floor(this.state.playerPet.stats.hp / 2));
        } else if (this.state.enemyPet.currentHp <= 0) {
            result.victory = true;
            result.log.push(`${this.state.enemyPet.name} 失去战斗能力！`);
            result.log.push('战斗胜利！');

            // 获得经验
            const expGain = this.state.enemyPet.level * 10;
            result.exp = expGain;
            const levelResult = this.game.gainExp(this.state.playerPet, expGain);
            if (levelResult.leveledUp) {
                result.log.push(`${this.state.playerPet.name} 升到了 ${levelResult.newLevel} 级！`);
            }

            // 获得金币 5~20
            const coinGain = Math.floor(5 + Math.random() * 16);
            result.coins = coinGain;
            this.game.addCoins(coinGain);
            result.log.push(`获得了 ${expGain} 经验值和 ${coinGain} 金币！`);

            // 30%概率获得宠物
            if (this.state.type === 'wild' && Math.random() < 0.3) {
                if (this.game.player.pets.length < 6) {
                    this.game.addPet(this.state.enemyPet);
                    this.game.addToPokedex(this.state.enemyPet.id);
                    result.log.push(`收服了 ${this.state.enemyPet.name}！`);
                } else {
                    result.log.push('队伍已满，无法收服更多宠物。');
                }
            }

            // NPC对战奖励
            if (this.state.type === 'npc') {
                this.game.defeatTrainer(this.state.trainer.id);
                this.game.addCoins(this.state.trainer.reward);
                result.coins += this.state.trainer.reward;
                result.log.push(`击败了训练师 ${this.state.trainer.name}！`);
                result.log.push(`额外获得 ${this.state.trainer.reward} 金币奖励！`);

                // 检查是否还有下一只宠物
                const nextIndex = this.state.trainerPetIndex + 1;
                if (nextIndex < this.state.trainer.pets.length) {
                    this.state.trainerPetIndex = nextIndex;
                    this.state.enemyPet = this.game.createPet(
                        this.state.trainer.pets[nextIndex].id,
                        this.state.trainer.pets[nextIndex].level
                    );
                    this.state.ended = false;
                    this.state.log.push(`${this.state.trainer.name} 派出了 ${this.state.enemyPet.name}！`);
                    return { state: this.state, continue: true };
                }
            }
        }

        this.game.saveGame();
        return { state: this.state, result: result, end: true };
    }

    // 更新战斗日志
    updateBattleLog(logs) {
        if (logs) {
            this.state.log = this.state.log.concat(logs);
        }
    }

    // 获取当前状态
    getState() {
        return this.state;
    }

    // 重置战斗
    reset() {
        this.state = null;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BattleSystem };
}
