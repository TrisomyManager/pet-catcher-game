// ===== UI控制器（手游版）=====

class UIController {
    constructor(game, battle) {
        this.game = game;
        this.battle = battle;
        this.currentScreen = 'home';
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateHeader();
        this.updateHomeScreen();
    }

    // 绑定事件
    bindEvents() {
        // 底部导航
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const screen = btn.dataset.screen;
                if (screen) {
                    this.showScreen(screen);
                    this.updateNavActive(screen);
                }
            });
        });

        // 首页快捷操作
        document.querySelectorAll('.action-card[data-screen]').forEach(card => {
            card.addEventListener('click', () => {
                const screen = card.dataset.screen;
                if (screen) {
                    this.showScreen(screen);
                    this.updateNavActive(screen);
                }
            });
        });

        // 每日任务预览
        document.querySelector('.daily-quest-preview')?.addEventListener('click', () => {
            this.showScreen('daily-quest');
        });

        // 返回按钮
        document.querySelectorAll('.nav-back').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showScreen('home');
                this.updateNavActive('home');
            });
        });

        // 地图区域选择
        document.querySelectorAll('.area-card').forEach(area => {
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

        // 战斗按钮 - 使用事件委托
        document.getElementById('battle-actions')?.addEventListener('click', (e) => {
            const btn = e.target.closest('.control-btn');
            if (btn) {
                const action = btn.dataset.action;
                this.handleBattleAction(action);
            }
        });

        // 面板关闭按钮
        document.querySelectorAll('.panel-close').forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideBattlePanels();
            });
        });

        // 图鉴筛选
        document.querySelectorAll('.filter-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.renderPokedex(btn.dataset.filter);
            });
        });

        // 商店标签页
        document.querySelectorAll('.shop-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.shop-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.renderShop(tab.dataset.tab);
            });
        });

        // 设置按钮
        document.getElementById('save-btn')?.addEventListener('click', () => {
            this.game.saveGame();
            this.showToast('游戏已存档');
        });

        document.getElementById('test-btn')?.addEventListener('click', () => {
            this.runTests();
        });

        document.getElementById('reset-btn')?.addEventListener('click', () => {
            this.showConfirm('确定要重置游戏吗？所有进度将丢失！', () => {
                this.game.resetGame();
                location.reload();
            });
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

        // 每日任务领取
        document.getElementById('quest-list')?.addEventListener('click', (e) => {
            if (e.target.classList.contains('claim-btn')) {
                const questId = e.target.dataset.questId;
                if (questId && dailyQuestSystem) {
                    const result = dailyQuestSystem.claimReward(questId);
                    if (result.success) {
                        this.showToast(result.message);
                        this.renderDailyQuests();
                        this.updateHeader();
                        this.updateQuestBadge();
                    }
                }
            }
        });

        // 设置按钮（右上角）
        document.querySelector('.icon-btn[data-screen="settings"]')?.addEventListener('click', () => {
            this.showScreen('settings');
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
            if (screenId === 'home') this.updateHomeScreen();
            if (screenId === 'pets') this.renderPetsList();
            if (screenId === 'pokedex') this.renderPokedex('all');
            if (screenId === 'battle-npc') this.renderNPClist();
            if (screenId === 'shop') {
                this.renderShop('balls');
                if (dailyQuestSystem) dailyQuestSystem.onVisitShop();
            }
            if (screenId === 'explore') this.renderMap();
            if (screenId === 'daily-quest') this.renderDailyQuests();
        }
    }

    // 更新底部导航激活状态
    updateNavActive(screenId) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.screen === screenId) {
                item.classList.add('active');
            }
        });
    }

    // 更新首页显示
    updateHomeScreen() {
        const activePet = this.game.player.pets[this.game.player.activePetIndex];
        if (!activePet) return;

        // 更新宠物信息
        document.getElementById('home-pet-avatar').textContent = activePet.emoji;
        document.getElementById('home-pet-name').textContent = activePet.name;
        document.getElementById('home-pet-level').textContent = `Lv.${activePet.level}`;
        
        // 更新HP条
        const hpPercent = (activePet.currentHp / activePet.stats.hp) * 100;
        document.getElementById('home-pet-hp').style.width = `${hpPercent}%`;
        document.getElementById('home-pet-hp-text').textContent = `${activePet.currentHp}/${activePet.stats.hp}`;
        
        // 闪光标记
        const shinyBadge = document.getElementById('home-pet-shiny');
        if (shinyBadge) {
            shinyBadge.style.display = activePet.isShiny ? 'flex' : 'none';
        }

        // 更新每日任务预览
        this.updateQuestPreview();
    }

    // 更新每日任务预览
    updateQuestPreview() {
        if (!dailyQuestSystem) return;
        
        const quests = dailyQuestSystem.getQuests();
        const stats = dailyQuestSystem.getStats();
        
        // 更新进度文本
        document.getElementById('quest-preview-text').textContent = `${stats.claimed}/${stats.total}`;
        
        // 更新徽章
        this.updateQuestBadge();
        
        // 更新任务列表预览
        const previewContainer = document.getElementById('preview-tasks');
        if (previewContainer) {
            previewContainer.innerHTML = quests.slice(0, 2).map(q => {
                const status = q.claimed ? '✓' : q.completed ? '!' : '•';
                return `<span class="mini-task">${status} ${q.name}</span>`;
            }).join('');
        }
    }

    // 更新头部信息
    updateHeader() {
        document.getElementById('player-coins').textContent = this.game.player.coins;
        const activePet = this.game.player.pets[this.game.player.activePetIndex];
        if (activePet) {
            document.getElementById('player-level').textContent = `Lv.${activePet.level}`;
        }
    }

    // 渲染地图
    renderMap() {
        const activePet = this.game.player.pets[this.game.player.activePetIndex];
        const playerLevel = activePet ? activePet.level : 1;
        
        document.querySelectorAll('.area-card').forEach(area => {
            const minLevel = parseInt(area.dataset.minLevel);
            if (playerLevel < minLevel) {
                area.classList.add('locked');
            } else {
                area.classList.remove('locked');
            }
        });
    }

    // 开始探索
    startExploration(areaId) {
        const area = AREAS[areaId];
        if (!area) return;

        document.getElementById('current-area-name').textContent = area.name;
        
        this.showScreen('exploring');
        this.currentAreaId = areaId;
        
        document.getElementById('explore-status').textContent = '草丛中似乎有什么动静...';
        document.getElementById('encounter-spot').innerHTML = '<div class="grass-animation">🌿</div>';
    }

    // 搜索野生宠物
    searchWildPet() {
        const encounter = this.game.exploreArea(this.currentAreaId);
        if (encounter && encounter.pet) {
            const pet = encounter.pet;
            const isShiny = pet.isShiny;
            
            document.getElementById('encounter-spot').innerHTML = `
                <div class="pet-emoji" style="font-size: 5rem; ${isShiny ? 'filter: drop-shadow(0 0 30px gold);' : ''}">${pet.emoji}${isShiny ? '✨' : ''}</div>
            `;
            
            if (isShiny) {
                document.getElementById('explore-status').innerHTML = 
                    `✨ <strong style="color: gold;">闪光</strong> Lv.${pet.level} 的 ${pet.name} 出现了！`;
                this.showToast('✨ 发现闪光宠物！');
            } else {
                document.getElementById('explore-status').textContent = 
                    `发现了 Lv.${pet.level} 的 ${pet.name}！`;
            }
            
            setTimeout(() => {
                this.startBattle(pet);
            }, isShiny ? 2500 : 1500);
        }
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

        // 敌方信息
        const enemyNameEl = document.getElementById('enemy-name');
        enemyNameEl.textContent = (enemyPet.isShiny ? '✨' : '') + enemyPet.name;
        enemyNameEl.style.color = enemyPet.isShiny ? 'gold' : '';
        
        document.getElementById('enemy-level').textContent = `Lv.${enemyPet.level}`;
        document.getElementById('enemy-hp-text').textContent = `${enemyPet.currentHp}/${enemyPet.stats.hp}`;
        document.getElementById('enemy-hp-bar').style.width = `${(enemyPet.currentHp / enemyPet.stats.hp) * 100}%`;
        document.getElementById('enemy-hp-bar').className = 'hp-bar ' + this.getHpBarClass(enemyPet.currentHp / enemyPet.stats.hp);
        
        const enemySprite = document.getElementById('enemy-sprite');
        enemySprite.querySelector('.pet-emoji').textContent = enemyPet.emoji;
        enemySprite.className = 'pet-sprite' + (enemyPet.isShiny ? ' shiny-pet' : '');

        // 我方信息
        document.getElementById('player-pet-name').textContent = playerPet.name;
        document.getElementById('player-pet-level').textContent = `Lv.${playerPet.level}`;
        document.getElementById('player-hp-text').textContent = `${playerPet.currentHp}/${playerPet.stats.hp}`;
        document.getElementById('player-hp-bar').style.width = `${(playerPet.currentHp / playerPet.stats.hp) * 100}%`;
        document.getElementById('player-hp-bar').className = 'hp-bar ' + this.getHpBarClass(playerPet.currentHp / playerPet.stats.hp);
        
        const playerSprite = document.getElementById('player-sprite');
        playerSprite.querySelector('.pet-emoji').textContent = playerPet.emoji;
        playerSprite.className = 'pet-sprite' + (playerPet.isShiny ? ' shiny-pet' : '');

        // 更新日志
        this.updateBattleLog(state.log);

        // 隐藏所有面板
        this.hideBattlePanels();
        document.getElementById('battle-actions').style.display = 'block';
    }

    // 获取HP条颜色类
    getHpBarClass(ratio) {
        if (ratio <= 0.2) return 'red';
        if (ratio <= 0.5) return 'yellow';
        return '';
    }

    // 隐藏战斗面板
    hideBattlePanels() {
        ['skill-select', 'item-select', 'switch-select', 'catch-select'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
    }

    // 更新战斗日志
    updateBattleLog(logs) {
        const logContainer = document.getElementById('battle-log');
        if (logContainer) {
            logContainer.innerHTML = `<div class="log-content">${logs[logs.length - 1]}</div>`;
        }
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
            if (!skill) return;
            
            const btn = document.createElement('button');
            btn.className = 'shop-item';
            btn.innerHTML = `
                <div class="item-icon">${skill.type === 'fire' ? '🔥' : skill.type === 'water' ? '💧' : skill.type === 'grass' ? '🌿' : skill.type === 'electric' ? '⚡' : skill.type === 'earth' ? '🪨' : skill.type === 'dark' ? '🌑' : '⚔️'}</div>
                <div class="item-info">
                    <div class="item-name">${skill.name}</div>
                    <div class="item-desc">威力:${skill.power} 命中:${skill.accuracy}%</div>
                </div>
            `;
            btn.addEventListener('click', () => {
                this.executeBattleAction('skill', skillId);
            });
            skillsGrid.appendChild(btn);
        });

        document.getElementById('battle-actions').style.display = 'none';
        document.getElementById('skill-select').style.display = 'block';
    }

    // 显示道具选择
    showItemSelect() {
        const itemsGrid = document.getElementById('items-grid');
        itemsGrid.innerHTML = '';

        const items = ['potion', 'superpotion', 'hyperpotion'];
        
        items.forEach(itemId => {
            const item = ITEMS[itemId];
            const count = this.game.player.inventory[itemId] || 0;
            
            const btn = document.createElement('button');
            btn.className = 'shop-item';
            btn.disabled = count <= 0;
            btn.innerHTML = `
                <div class="item-icon">${item.emoji}</div>
                <div class="item-info">
                    <div class="item-name">${item.name} x${count}</div>
                    <div class="item-desc">${item.desc}</div>
                </div>
            `;
            
            if (count > 0) {
                btn.addEventListener('click', () => {
                    this.executeBattleAction('item', itemId);
                });
            }
            
            itemsGrid.appendChild(btn);
        });

        document.getElementById('battle-actions').style.display = 'none';
        document.getElementById('item-select').style.display = 'block';
    }

    // 显示捕捉选择
    showCatchSelect() {
        const catchGrid = document.getElementById('catch-grid');
        catchGrid.innerHTML = '';

        const balls = ['pokeball', 'greatball', 'ultraball'];
        
        balls.forEach(ballId => {
            const item = ITEMS[ballId];
            const count = this.game.player.inventory[ballId] || 0;
            
            const btn = document.createElement('button');
            btn.className = 'shop-item';
            btn.disabled = count <= 0;
            btn.innerHTML = `
                <div class="item-icon">${item.emoji}</div>
                <div class="item-info">
                    <div class="item-name">${item.name} x${count}</div>
                    <div class="item-desc">捕捉率: ${Math.floor(item.catchRate * 100)}%</div>
                </div>
            `;
            
            if (count > 0) {
                btn.addEventListener('click', () => {
                    this.executeBattleAction('catch', ballId);
                });
            }
            
            catchGrid.appendChild(btn);
        });

        document.getElementById('battle-actions').style.display = 'none';
        document.getElementById('catch-select').style.display = 'block';
    }

    // 显示切换宠物
    showSwitchSelect() {
        const switchGrid = document.getElementById('switch-grid');
        switchGrid.innerHTML = '';

        this.game.player.pets.forEach((pet, index) => {
            const btn = document.createElement('button');
            btn.className = 'npc-card';
            if (index === this.game.player.activePetIndex) {
                btn.style.border = '2px solid var(--accent)';
            }
            if (pet.currentHp <= 0) {
                btn.style.opacity = '0.5';
            }
            btn.innerHTML = `
                <div class="npc-avatar">${pet.emoji}</div>
                <div class="npc-info">
                    <div class="npc-name">${pet.name} ${index === this.game.player.activePetIndex ? '(出战中)' : ''}</div>
                    <div class="npc-desc">Lv.${pet.level} HP:${pet.currentHp}/${pet.stats.hp}</div>
                </div>
            `;
            btn.addEventListener('click', () => {
                this.executeBattleAction('switch', index);
            });
            switchGrid.appendChild(btn);
        });

        document.getElementById('battle-actions').style.display = 'none';
        document.getElementById('switch-select').style.display = 'block';
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

        if (result.exp) message += ` 获得 ${result.exp} 经验`;
        if (result.coins) message += ` ${result.coins} 金币`;

        this.showToast(message);
        
        if (dailyQuestSystem) {
            if (result.victory) dailyQuestSystem.onWinBattle();
            if (result.caught) dailyQuestSystem.onCatchPet(result.caughtPet);
            this.updateQuestBadge();
        }
        
        this.battle.reset();
        this.updateHeader();
        this.showScreen('home');
        this.updateNavActive('home');
    }

    // 渲染宠物列表
    renderPetsList() {
        const container = document.getElementById('pets-list');
        container.innerHTML = '';

        this.game.player.pets.forEach((pet, index) => {
            const card = document.createElement('div');
            card.className = 'pet-card' + (index === this.game.player.activePetIndex ? ' active' : '');
            card.innerHTML = `
                <div class="pet-avatar" style="${pet.isShiny ? 'filter: drop-shadow(0 0 10px gold);' : ''}">${pet.emoji}${pet.isShiny ? '✨' : ''}</div>
                <div class="pet-info-text">
                    <span class="pet-name">${pet.name} ${pet.isShiny ? '✨' : ''}</span>
                    <div class="pet-meta">${PET_TYPES[pet.type.toUpperCase()].emoji} Lv.${pet.level}</div>
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
            <div class="pet-detail-avatar" style="${pet.isShiny ? 'filter: drop-shadow(0 0 20px gold);' : ''}">${pet.emoji}${pet.isShiny ? '✨' : ''}</div>
            <div class="pet-detail-name" style="${pet.isShiny ? 'color: gold;' : ''}">${pet.name}${pet.isShiny ? ' ✨' : ''}</div>
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
                    <div class="stat-value">${pet.level >= 100 ? 'MAX' : pet.expToNext}</div>
                </div>
            </div>
            
            <div style="margin-top: 20px; padding: 16px; background: var(--bg-card); border-radius: 12px; text-align: left;">
                <div style="font-weight: 600; margin-bottom: 10px;">技能</div>
                ${pet.skills.map(skillId => {
                    const skill = SKILLS[skillId];
                    return skill ? `<div style="font-size: 0.85rem; padding: 6px 0; border-bottom: 1px solid var(--border-color);">${skill.name} (威力:${skill.power})</div>` : '';
                }).join('')}
            </div>
            
            ${index !== this.game.player.activePetIndex ? `
                <button class="action-card primary" id="switch-to-btn" style="margin-top: 20px;">
                    <span>🔄 设为出战宠物</span>
                </button>
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
        document.getElementById('pokedex-count').textContent = 
            `${this.game.player.pokedex.size}/${Object.keys(PETS_DATA).length}`;
        
        const container = document.getElementById('pokedex-grid');
        container.innerHTML = '';

        Object.entries(PETS_DATA).forEach(([id, pet], index) => {
            if (filter !== 'all' && pet.type !== filter) return;
            
            const isCaught = this.game.player.pokedex.has(id);
            const item = document.createElement('div');
            item.className = 'pokedex-item' + (isCaught ? ' caught' : ' unknown');
            item.innerHTML = `
                <span class="pet-emoji">${isCaught ? pet.emoji : '❓'}</span>
                <span class="pet-id">#${String(index + 1).padStart(3, '0')}</span>
            `;
            
            if (isCaught) {
                item.addEventListener('click', () => {
                    this.showPokedexDetail(pet);
                });
            }
            
            container.appendChild(item);
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
            <p style="margin: 16px 0; color: var(--text-muted); font-size: 0.9rem;">${this.getRarityText(pet.rarity)}</p>
            <div class="pet-detail-stats">
                <div class="stat-box"><div class="stat-label">HP</div><div class="stat-value">${pet.baseStats.hp}</div></div>
                <div class="stat-box"><div class="stat-label">攻击</div><div class="stat-value">${pet.baseStats.attack}</div></div>
                <div class="stat-box"><div class="stat-label">防御</div><div class="stat-value">${pet.baseStats.defense}</div></div>
                <div class="stat-box"><div class="stat-label">速度</div><div class="stat-value">${pet.baseStats.speed}</div></div>
            </div>
        `;
        
        this.showScreen('pokedex-detail');
    }

    getRarityText(rarity) {
        const texts = { common: '普通', uncommon: '稀有', rare: '珍贵', epic: '史诗', legendary: '传说' };
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
                    <div class="npc-name">${trainer.name} ${isDefeated ? '✓' : ''}</div>
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
    renderShop(tab = 'balls') {
        document.getElementById('shop-coins').textContent = this.game.player.coins;
        const container = document.getElementById('shop-items');
        container.innerHTML = '';

        const items = tab === 'balls' ? 
            ['pokeball', 'greatball', 'ultraball'] : 
            ['potion', 'superpotion', 'hyperpotion'];

        items.forEach(itemId => {
            const item = ITEMS[itemId];
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
                const result = this.game.buyItem(itemId);
                if (result.success) {
                    this.showToast(result.message);
                    this.renderShop(tab);
                } else {
                    this.showToast(result.message);
                }
            });
            
            container.appendChild(shopItem);
        });
    }

    // 渲染每日任务
    renderDailyQuests() {
        if (!dailyQuestSystem) return;

        const quests = dailyQuestSystem.getQuests();
        const stats = dailyQuestSystem.getStats();
        const container = document.getElementById('quest-list');

        document.getElementById('quest-date').textContent = dailyQuestSystem.getTodayString();
        document.getElementById('quest-progress').textContent = `${stats.claimed}/${stats.total}`;

        container.innerHTML = '';
        quests.forEach(quest => {
            const questItem = document.createElement('div');
            questItem.className = 'quest-item' + (quest.completed ? ' completed' : '') + (quest.claimed ? ' claimed' : '');

            const progressPercent = (quest.progress / quest.target) * 100;
            const canClaim = quest.completed && !quest.claimed;

            questItem.innerHTML = `
                <div class="quest-header">
                    <span class="quest-name">${quest.name}</span>
                    <span class="quest-status">${quest.claimed ? '已领取' : quest.completed ? '可领取' : '进行中'}</span>
                </div>
                <div class="quest-progress-bar">
                    <div class="quest-progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <div class="quest-reward">
                    <span>💰 ${quest.reward.coins}</span>
                    <span>⭐ ${quest.reward.exp} EXP</span>
                </div>
                ${canClaim ? `<button class="claim-btn" data-quest-id="${quest.id}">领取奖励</button>` : ''}
            `;

            container.appendChild(questItem);
        });

        this.updateQuestBadge();
    }

    // 更新任务徽章
    updateQuestBadge() {
        if (!dailyQuestSystem) return;
        const hasClaimable = dailyQuestSystem.getQuests().some(q => q.completed && !q.claimed);
        const badge = document.getElementById('quest-badge');
        if (badge) {
            badge.style.display = hasClaimable ? 'flex' : 'none';
        }
    }

    // 显示提示
    showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2500);
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
                <span>${result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏳'}</span>
                <span>${result.name}</span>
            `;
            container.appendChild(item);
        });

        this.showScreen('test-result');
    }
}
