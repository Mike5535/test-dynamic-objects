import {
  _decorator,
  Component,
  Node,
  setDisplayStats,
  Toggle,
  game,
} from 'cc';
import { Config } from '../../config';
const { ccclass, type } = _decorator;

@ccclass('Settings')
export class Settings extends Component {
  @type(Node)
  settings: Node | null = null;

  @type(Toggle)
  debugToggle: Toggle | null = null;

  @type(Toggle)
  fpsToggle: Toggle | null = null;

  start() {
    this.node.on(Node.EventType.TOUCH_END, this.showSettings, this);

    if (this.debugToggle) {
      this.debugToggle.setIsCheckedWithoutNotify(Config.debug);
    }
    if (this.fpsToggle) {
      this.fpsToggle.setIsCheckedWithoutNotify(Config.highFps);
    }

    setDisplayStats(Config.debug);
    this.setHighFps(Config.highFps);
  }

  showSettings() {
    if (this.settings) {
      this.settings.active = !this.settings.active;
    }
  }

  toggleDebug() {
    Config.debug = !Config.debug;
    setDisplayStats(Config.debug);
  }

  toggleHighFps() {
    Config.highFps = !Config.highFps;
    this.setHighFps(Config.highFps);
  }

  setHighFps(highFps) {
    if (highFps) {
      game.setFrameRate(1000000);
    } else {
      game.setFrameRate(30);
    }
  }
}
