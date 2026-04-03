// ===== UI控制器 =====

class UIController {
    constructor(game, battle) {
        this.game = game;
        this.battle = battle;
        this.currentScreen = 'main-menu';
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateHeader();
    }

    // 绑定事件
    bindEvents() {
        // 菜单按钮
        document.querySelectorAll('.menu-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const screen = btn.dataset.screen;
                if (screen) this.showScreen(screen);
            });
        });

        // 返回按钮
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', () => this.showScreen('main-menu'));
        });

        // 地图区域选择
        document.querySelectorAll('.map-area').forEach(area => {
            area.addEventListener('click', () => {
                const areaId = area.dataset.area;
                const minLevel = parseInt(area.dataset.minLevel);
                if (this.game.player.pets[this.game.player.activePetIndex].level >= minLevel) {
                    this.startExploration(areaId);
                } else {
                    this.showToast(`需要达到 ${minLevel} 级才能进入此区域`);
                }
            });
        });

        // 搜索按钮
        document.getElementById('search-btn')?.addEventListener('click', () => {
            this.searchWildPet();
        });

        // 战斗按钮
        document.querySelectorAll('.battle-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                this.handleBattleAction(action);
            });
        });

        // 图鉴筛选
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderPokedex(btn.dataset.filter);
            });
        });

        // 设置按钮
        document.getElementById('save-btn')?.addEventListener('click', () => {
            this.game.saveGame();
            this.showToast('游戏已存档');
        });

        document.getElementById('load-btn')?.addEventListener('click', () => {
            this.game.loadGame();
            this.showToast('存档已读取');
        });

        document.getElementById('reset-btn')?.addEventListener('click', () => {
            this.showConfirm('确定要重置游戏吗？所有进度将丢失！', () => {
                this.game.resetGame();
                location.reload();
            });
        });

        document.getElementById('test-btn')?.addEventListener('click', () => {
            this.runTests();
        });

        // 设置开关
        document.getElementById('sound-toggle')?.addEventListener('change', (e) => {
            this.game.settings.sound = e.target.checked;
            this.game.saveGame();
        });

        document.getElementById('anim-toggle')?.addEventListener('change', (e) => {
            this.game.settings.animation = e.target.checked;
            this.game.saveGame();
        });

        // 确认对话框
        document.getElementById('confirm-yes')?.addEventListener('click', () => {
            if (this.confirmCallback) {
                this.confirmCallback();
                this.confirmCallback = null;
            }
            this.hideConfirm();
        });

        document.getElementById('confirm-no')?.addEventListener('click', () => {
            this.confirmCallback = null;
            this.hideConfirm();
        });
    }

    // 切换屏幕
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        
        const screen = document.getElementById(screenId + '-screen') || document.getElementById(screenId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
            
            // 刷新特定屏幕内容
            if (screenId === 'pets') this.renderPetsList();
            if (screenId === 'pokedex') this.renderPokedex('all');
            if (screenId === 'battle-npc') this.renderNPClist();
            if (screenId === 'shop') this.renderShop();
            if (screenId === 'explore') this.renderMap();
        }
    }

    // 更新头部信息
    updateHeader() {
        // 显示玩家等级（基于出战宠物等级或玩家等级）
        const activePet = this.game.player.pets[this.game.player.activePetIndex];
        if (activePet) {
            document.getElementById('player-level').textContent = `Lv.${activePet.level}`;
        } else {
            document.getElementById('player-level').textContent = `Lv.${this.game.player.level}`;
        }
        document.getElementById('player-coins').textContent = `💰 ${this.game.player.coins}`;
    }

    // 渲染地图
    renderMap() {
        const activePet = this.game.player.pets[this.game.player.activePetIndex];
        const playerLevel = activePet ? activePet.level : 1;
        
        document.querySelectorAll('.map-area').forEach(area => {
            const minLevel = parseInt(area.dataset.minLevel);
            if (playerLevel < minLevel) {
                area.classList.add('locked');
                area.style.opacity = '0.5';
                area.style.cursor = 'not-allowed';
            } else {
                area.classList.remove('locked');
                area.style.opacity = '1';
                area.style.cursor = 'pointer';
            }
        });
    }

    // 开始探索
    startExploration(areaId) {
        const area = AREAS[areaId];
        if (!area) return;

        document.getElementById('current-area-name').textContent = `正在探索 ${area.name}`;
        document.querySelector('.area-visual').style.background = this.getAreaBackground(areaId);
        
        this.showScreen('exploring');
        this.currentAreaId = areaId;
        
        document.getElementById('explore-status').textContent = '草丛中似乎有什么动静...';
        document.getElementById('encounter-spot').innerHTML = '<span class="grass-rustle">🌿</span>';
    }

    // 搜索野生宠物
    searchWildPet() {
        const encounter = this.game.exploreArea(this.currentAreaId);
        if (encounter && encounter.pet) {
            document.getElementById('encounter-spot').innerHTML = `
                <span class="pet-emoji" style="font-size: 4rem;">${encounter.pet.emoji}</span>
            `;
            document.getElementById('explore-status').textContent = 
                `发现了 Lv.${encounter.pet.level} 的 ${encounter.pet.name}！`;
            
            // 延迟进入战斗
            setTimeout(() => {
                this.startBattle(encounter.pet);
            }, 1500);
        }
    }

    // 获取区域背景色
    getAreaBackground(areaId) {
        const backgrounds = {
            meadow: 'radial-gradient(ellipse at center, rgba(126,211,33,0.2) 0%, transparent 70%)',
            forest: 'radial-gradient(ellipse at center, rgba(30,100,30,0.2) 0%, transparent 70%)',
            cave: 'radial-gradient(ellipse at center, rgba(100,100,100,0.2) 0%, transparent 70%)',
            lake: 'radial-gradient(ellipse at center, rgba(74,144,226,0.2) 0%, transparent 70%)',
            volcano: 'radial-gradient(ellipse at center, rgba(255,100,50,0.2) 0%, transparent 70%)'
        };
        return backgrounds[areaId] || backgrounds.meadow;
    }

    // 开始战斗
    startBattle(enemyPet) {
        const result = this.battle.startWildBattle(enemyPet);
        if (result.success) {
            this.renderBattleScreen();
            this.showScreen('battle');
        }
    }

    // 渲染战斗界面
    renderBattleScreen() {
        const state = this.battle.getState();
        if (!state) return;

        const playerPet = state.playerPet;
        const enemyPet = state.enemyPet;

        // 更新敌方信息
        document.getElementById('enemy-name').textContent = enemyPet.name;
        document.getElementById('enemy-level').textContent = `Lv.${enemyPet.level}`;
        document.getElementById('enemy-hp-text').textContent = `${enemyPet.currentHp}/${enemyPet.stats.hp}`;
        document.getElementById('enemy-hp-bar').style.width = `${(enemyPet.currentHp / enemyPet.stats.hp) * 100}%`;
        document.getElementById('enemy-hp-bar').className = this.getHpBarClass(enemyPet.currentHp / enemyPet.stats.hp);
        document.getElementById('enemy-sprite').querySelector('.pet-emoji').textContent = enemyPet.emoji;

        // 更新我方信息
        document.getElementById('player-pet-name').textContent = playerPet.name;
        document.getElementById('player-pet-level').textContent = `Lv.${playerPet.level}`;
        document.getElementById('player-hp-text').textContent = `${playerPet.currentHp}/${playerPet.stats.hp}`;
        document.getElementById('player-hp-bar').style.width = `${(playerPet.currentHp / playerPet.stats.hp) * 100}%`;
        document.getElementById('player-hp-bar').className = this.getHpBarClass(playerPet.currentHp / playerPet.stats.hp);
        document.getElementById('player-sprite').querySelector('.pet-emoji').textContent = playerPet.emoji;

        // 更新日志
        this.updateBattleLog(state.log);

        // 显示操作按钮
        document.getElementById('battle-actions').style.display = 'grid';
        document.getElementById('skill-select').style.display = 'none';
        document.getElementById('item-select').style.display = 'none';
        document.getElementById('switch-select').style.display = 'none';
    }

    // 获取HP条颜色类
    getHpBarClass(ratio) {
        if (ratio <= 0.2) return 'hp-bar red';
        if (ratio <= 0.5) return 'hp-bar yellow';
        return 'hp-bar';
    }

    // 更新战斗日志
    updateBattleLog(logs) {
        const logContainer = document.getElementById('battle-log');
        logContainer.innerHTML = logs.slice(-5).map(log => `<p>${log}</p>`).join('');
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    // 处理战斗行动
    handleBattleAction(action) {
        const state = this.battle.getState();
        if (!state) return;

        switch (action) {
            case 'attack':
                this.executeBattleAction('attack');
                break;
            case 'skill':
                this.showSkillSelect();
                break;
            case 'item':
                this.showItemSelect();
                break;
            case 'catch':
                this.showCatchSelect();
                break;
            case 'switch':
                this.showSwitchSelect();
                break;
            case 'run':
                this.executeBattleAction('run');
                break;
        }
    }

    // 显示技能选择
    showSkillSelect() {
        const state = this.battle.getState();
        const skillsGrid = document.getElementById('skills-grid');
        skillsGrid.innerHTML = '';

        state.playerPet.skills.forEach(skillId => {
            const skill = SKILLS[skillId];
            if (skill) {
                const btn = document.createElement('button');
                btn.className = 'skill-btn';
                btn.innerHTML = `
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-info">威力:${skill.power} 命中:${skill.accuracy}%</span>
                `;
                btn.addEventListener('click', () => {
                    this.executeBattleAction('skill', skillId);
                });
                skillsGrid.appendChild(btn);
            }
        });

        document.getElementById('battle-actions').style.display = 'none';
        document.getElementById('skill-select').style.display = 'block';

        document.querySelector('#skill-select .back-btn-small').onclick = () => {
            document.getElementById('skill-select').style.display = 'none';
            document.getElementById('battle-actions').style.display = 'grid';
        };
    }

    // 显示道具选择
    showItemSelect() {
        const itemsGrid = document.getElementById('items-grid');
        itemsGrid.innerHTML = '';

        Object.entries(this.game.player.inventory).forEach(([itemId, count]) => {
            if (count > 0) {
                const item = ITEMS[itemId];
                if (item && item.heal) { // 只显示回复道具
                    const btn = document.createElement('button');
                    btn.className = 'item-btn';
                    btn.innerHTML = `
                        <span class="item-name">${item.emoji} ${item.name} x${count}</span>
                        <span class="item-info">${item.desc}</span>
                    `;
                    btn.addEventListener('click', () => {
                        this.executeBattleAction('item', itemId);
                    });
                    itemsGrid.appendChild(btn);
                }
            }
        });

        document.getElementById('battle-actions').style.display = 'none';
        document.getElementById('item-select').style.display = 'block';

        document.querySelector('#item-select .back-btn-small').onclick = () => {
            document.getElementById('item-select').style.display = 'none';
            document.getElementById('battle-actions').style.display = 'grid';
        };
    }

    // 显示捕捉选择
    showCatchSelect() {
        const itemsGrid = document.getElementById('items-grid');
        itemsGrid.innerHTML = '';

        const balls = ['pokeball', 'greatball', 'ultraball'];
        balls.forEach(itemId => {
            const count = this.game.player.inventory[itemId] || 0;
            if (count > 0) {
                const item = ITEMS[itemId];
                const btn = document.createElement('button');
                btn.className = 'item-btn';
                btn.innerHTML = `
                    <span class="item-name">${item.emoji} ${item.name} x${count}</span>
                    <span class="item-info">${item.desc}</span>
                `;
                btn.addEventListener('click', () => {
                    this.executeBattleAction('catch', itemId);
                });
                itemsGrid.appendChild(btn);
            }
        });

        if (itemsGrid.children.length === 0) {
            this.showToast('没有精灵球！');
            return;
        }

        document.getElementById('battle-actions').style.display = 'none';
        document.getElementById('item-select').style.display = 'block';

        document.querySelector('#item-select .back-btn-small').onclick = () => {
            document.getElementById('item-select').style.display = 'none';
            document.getElementById('battle-actions').style.display = 'grid';
        };
    }

    // 显示切换宠物
    showSwitchSelect() {
        const switchGrid = document.getElementById('switch-grid');
        switchGrid.innerHTML = '';

        this.game.player.pets.forEach((pet, index) => {
            const btn = document.createElement('button');
            btn.className = 'switch-btn';
            btn.innerHTML = `
                <span>${pet.emoji} ${pet.name}</span>
                <span>Lv.${pet.level} HP:${pet.currentHp}/${pet.stats.hp}</span>
            `;
            if (index === this.game.player.activePetIndex) {
                btn.style.borderColor = 'var(--accent)';
            }
            if (pet.currentHp <= 0) {
                btn.style.opacity = '0.5';
            }
            btn.addEventListener('click', () => {
                this.executeBattleAction('switch', index);
            });
            switchGrid.appendChild(btn);
        });

        document.getElementById('battle-actions').style.display = 'none';
        document.getElementById('switch-select').style.display = 'block';

        document.querySelector('#switch-select .back-btn-small').onclick = () => {
            document.getElementById('switch-select').style.display = 'none';
            document.getElementById('battle-actions').style.display = 'grid';
        };
    }

    // 执行战斗行动
    executeBattleAction(action, data = null) {
        const result = this.battle.playerAction(action, data);
        
        if (result) {
            this.renderBattleScreen();
            
            if (result.end) {
                setTimeout(() => {
                    this.showBattleResult(result.result);
                }, 2000);
            } else if (result.continue) {
                this.renderBattleScreen();
            }
        }
    }

    // 显示战斗结果
    showBattleResult(result) {
        let message = result.victory ? '战斗胜利！' : '战斗失败...';
        if (result.caught) message = '捕捉成功！';
        if (result.escaped) message = '成功逃跑！';

        if (result.exp) message += `\n获得 ${result.exp} 经验`;
        if (result.coins) message += `\n获得 ${result.coins} 金币`;

        this.showToast(message.replace(/\n/g, ' '));
        this.battle.reset();
        this.updateHeader();
        this.showScreen('main-menu');
    }

    // 渲染宠物列表
    renderPetsList() {
        const container = document.getElementById('pets-list');
        container.innerHTML = '';

        this.game.player.pets.forEach((pet, index) => {
            const card = document.createElement('div');
            card.className = 'pet-card' + (index === this.game.player.activePetIndex ? ' active' : '');
            card.innerHTML = `
                <div class="pet-avatar">${pet.emoji}</div>
                <div class="pet-info-text">
                    <div class="pet-name">${pet.name} ${index === this.game.player.activePetIndex ? '(出战中)' : ''}</div>
                    <div class="pet-meta">Lv.${pet.level} | ${PET_TYPES[pet.type.toUpperCase()].emoji} ${PET_TYPES[pet.type.toUpperCase()].display}</div>
                    <div class="pet-hp">HP: ${pet.currentHp}/${pet.stats.hp}</div>
                </div>
            `;
            card.addEventListener('click', () => {
                this.showPetDetail(pet, index);
            });
            container.appendChild(card);
        });
    }

    // 显示宠物详情
    showPetDetail(pet, index) {
        const card = document.getElementById('pet-detail-card');
        const typeInfo = PET_TYPES[pet.type.toUpperCase()];
        
        card.innerHTML = `
            <div class="pet-detail-avatar">${pet.emoji}</div>
            <div class="pet-detail-name">${pet.name}</div>
            <span class="pet-detail-type type-${pet.type}">${typeInfo.emoji} ${typeInfo.display}</span>
            <div class="pet-detail-stats">
                <div class="stat-box">
                    <div class="stat-label">等级</div>
                    <div class="stat-value">${pet.level}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">HP</div>
                    <div class="stat-value">${pet.stats.hp}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">攻击</div>
                    <div class="stat-value">${pet.stats.attack}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">防御</div>
                    <div class="stat-value">${pet.stats.defense}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">速度</div>
                    <div class="stat-value">${pet.stats.speed}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">经验</div>
                    <div class="stat-value">${pet.level >= 100 ? 'MAX' : EXP_TABLE.getExpToNextLevel(pet.level)}</div>
                </div>
            </div>
            <div class="pet-exp-bar">
                <div class="exp-label">升级到 Lv.${Math.min(100, pet.level + 1)}</div>
                <div class="exp-progress-bar">
                    <div class="exp-fill" style="width: ${EXP_TABLE.getLevelProgress(pet.totalExp, pet.level)}%"></div>
                </div>
                <div class="exp-text">${EXP_TABLE.getLevelProgress(pet.totalExp, pet.level)}%</div>
            </div>
            <div class="pet-detail-skills">
                <h4>技能</h4>
                ${pet.skills.map(skillId => {
                    const skill = SKILLS[skillId];
                    return skill ? `<div class="skill-item">
                        <span>${skill.name}</span>
                        <span>威力:${skill.power} 命中:${skill.accuracy}%</span>
                    </div>` : '';
                }).join('')}
            </div>
            ${index !== this.game.player.activePetIndex ? `
                <button class="action-btn" id="switch-to-btn">🔄 设为出战</button>
            ` : ''}
        `;

        document.getElementById('switch-to-btn')?.addEventListener('click', () => {
            this.game.switchActivePet(index);
            this.showToast(`${pet.name} 已成为出战宠物！`);
            this.showScreen('pets');
        });

        this.showScreen('pet-detail');
    }

    // 渲染图鉴
    renderPokedex(filter = 'all') {
        const grid = document.getElementById('pokedex-grid');
        grid.innerHTML = '';

        const progress = this.game.getPokedexProgress();
        document.getElementById('pokedex-count').textContent = `已收集: ${progress.caught}/${progress.total}`;
        document.getElementById('pokedex-percent').textContent = `${progress.percentage}%`;

        Object.values(PETS_DATA).forEach((pet, index) => {
            if (filter !== 'all' && pet.type !== filter) return;

            const isCaught = this.game.player.pokedex.has(pet.id);
            const item = document.createElement('div');
            item.className = `pokedex-item ${isCaught ? 'caught' : 'unknown'}`;
            item.innerHTML = `
                <span class="pokedex-icon">${isCaught ? pet.emoji : '❓'}</span>
                <span class="pokedex-id">#${String(index + 1).padStart(3, '0')}</span>
            `;
            
            if (isCaught) {
                item.addEventListener('click', () => {
                    this.showPokedexDetail(pet);
                });
            }
            
            grid.appendChild(item);
        });
    }

    // 显示图鉴详情
    showPokedexDetail(pet) {
        const card = document.getElementById('pokedex-detail-card');
        const typeInfo = PET_TYPES[pet.type.toUpperCase()];
        
        card.innerHTML = `
            <div class="pet-detail-avatar">${pet.emoji}</div>
            <div class="pet-detail-name">${pet.name}</div>
            <span class="pet-detail-type type-${pet.type}">${typeInfo.emoji} ${typeInfo.display}</span>
            <p style="margin: 15px 0; color: var(--text-muted);">稀有度: ${this.getRarityText(pet.rarity)}</p>
            <div class="pet-detail-stats">
                <div class="stat-box">
                    <div class="stat-label">HP</div>
                    <div class="stat-value">${pet.baseStats.hp}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">攻击</div>
                    <div class="stat-value">${pet.baseStats.attack}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">防御</div>
                    <div class="stat-value">${pet.baseStats.defense}</div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">速度</div>
                    <div class="stat-value">${pet.baseStats.speed}</div>
                </div>
            </div>
            ${pet.evoTo ? `<p style="margin-top: 15px;">Lv.${pet.evoLevel} 进化为 ${PETS_DATA[pet.evoTo]?.name || '???'}</p>` : '<p style="margin-top: 15px;">最终形态</p>'}
        `;

        this.showScreen('pokedex-detail');
    }

    // 获取稀有度文本
    getRarityText(rarity) {
        const texts = {
            common: '普通',
            uncommon: '稀有',
            rare: '珍贵',
            epic: '史诗',
            legendary: '传说'
        };
        return texts[rarity] || rarity;
    }

    // 渲染NPC列表
    renderNPClist() {
        const container = document.getElementById('npc-list');
        container.innerHTML = '';

        TRAINERS.forEach(trainer => {
            const isDefeated = this.game.player.defeatedTrainers.has(trainer.id);
            const card = document.createElement('div');
            card.className = 'npc-card' + (isDefeated ? ' defeated' : '');
            card.innerHTML = `
                <div class="npc-avatar">${trainer.emoji}</div>
                <div class="npc-info">
                    <div class="npc-name">${trainer.name} ${isDefeated ? '✅' : ''}</div>
                    <div class="npc-desc">${trainer.desc}</div>
                </div>
                <div class="npc-reward">💰${trainer.reward}</div>
            `;
            card.addEventListener('click', () => {
                if (isDefeated) {
                    this.showToast('已经击败过这个训练师了！');
                    return;
                }
                this.startNPCBattle(trainer);
            });
            container.appendChild(card);
        });
    }

    // 开始NPC战斗
    startNPCBattle(trainer) {
        const result = this.battle.startNPCBattle(trainer);
        if (result.success) {
            this.renderBattleScreen();
            this.showScreen('battle');
        }
    }

    // 渲染商店
    renderShop() {
        document.getElementById('shop-coins').textContent = this.game.player.coins;
        const container = document.getElementById('shop-items');
        container.innerHTML = '';

        Object.values(ITEMS).forEach(item => {
            const shopItem = document.createElement('div');
            shopItem.className = 'shop-item';
            shopItem.innerHTML = `
                <div class="item-icon">${item.emoji}</div>
                <div class="item-info">
                    <div class="item-name">${item.name}</div>
                    <div class="item-desc">${item.desc}</div>
                </div>
                <div class="item-price">💰${item.price}</div>
                <button class="buy-btn" ${this.game.player.coins < item.price ? 'disabled' : ''}>购买</button>
            `;
            
            shopItem.querySelector('.buy-btn').addEventListener('click', () => {
                const result = this.game.buyItem(item.id);
                if (result.success) {
                    this.showToast(result.message);
                    this.renderShop();
                } else {
                    this.showToast(result.message);
                }
            });
            
            container.appendChild(shopItem);
        });
    }

    // 显示提示
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // 显示确认对话框
    showConfirm(message, callback) {
        document.getElementById('confirm-message').textContent = message;
        this.confirmCallback = callback;
        document.getElementById('confirm-dialog').classList.add('show');
    }

    // 隐藏确认对话框
    hideConfirm() {
        document.getElementById('confirm-dialog').classList.remove('show');
    }

    // 运行测试
    runTests() {
        const results = runGameTests(this.game, this.battle);
        const container = document.getElementById('test-results');
        container.innerHTML = '';

        results.forEach(result => {
            const item = document.createElement('div');
            item.className = `test-result-item ${result.status}`;
            item.innerHTML = `
                <span class="test-icon">${result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏳'}</span>
                <span class="test-name">${result.name}</span>
                <span class="test-status">${result.message}</span>
            `;
            container.appendChild(item);
        });

        this.showScreen('test-result');
    }
}
