// ===== 游戏主入口 =====

let game;
let battle;
let ui;

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    game = new GameEngine().init();
    battle = new BattleSystem(game);
    ui = new UIController(game, battle);
    
    // 应用设置
    document.getElementById('sound-toggle').checked = game.settings.sound;
    document.getElementById('anim-toggle').checked = game.settings.animation;
    
    // 更新UI
    ui.updateHeader();
    
    // 显示欢迎提示
    const activePet = game.player.pets[game.player.activePetIndex];
    if (activePet && activePet.isStarter) {
        ui.showToast(`🎮 欢迎来到宠物大冒险！你的初始伙伴是 Lv.${activePet.level} 的 ${activePet.name}！`);
    }
    
    console.log('🐾 宠物大冒险 已加载！');
    console.log('当前出战宠物:', game.player.pets[game.player.activePetIndex]?.name);
});

// 防止页面滚动
if ('ontouchstart' in window) {
    document.body.addEventListener('touchmove', function(e) {
        if (e.target.closest('#battle-screen')) {
            e.preventDefault();
        }
    }, { passive: false });
}
