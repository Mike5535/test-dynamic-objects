import { _decorator, Component, Node, sys } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('MobileUIController')
export class MobileUIController extends Component {
  onLoad() {
    if (this.node) {
      this.node.active = sys.isMobile;
    }
  }
}
