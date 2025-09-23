import { Game, game, sys } from 'cc'

export const Config = {
    debug: false,
    highFps: true,
}

game.on(Game.EVENT_ENGINE_INITED, () => {
    if (!sys.isMobile) {
        Config.highFps = true
    }
})
