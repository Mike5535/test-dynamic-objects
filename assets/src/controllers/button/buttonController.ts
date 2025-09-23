import { _decorator, Animation, Component, CylinderCollider } from 'cc';
import { BoxSpawnManager } from '../../managers/boxSpawnManager/boxSpawnManager';
import { CharacterController } from '../character/characterController';
const { ccclass, type, property } = _decorator;

@ccclass('buttonController')
export class ButtonController extends Component {
  private _triggerCollider: CylinderCollider | null = null;
  private _animationComponent: Animation | null = null;
  private _isTriggered = false;

  @type(BoxSpawnManager)
  boxSpawnManager: BoxSpawnManager;

  start() {
    this._animationComponent = this.node.getComponent(Animation);

    const colliders = this.node.getComponents(CylinderCollider);

    for (const collider of colliders) {
      if (collider.isTrigger) {
        this._triggerCollider = collider;
      }
    }

    this._triggerCollider.on('onTriggerEnter', this.triggerHandler, this);
    this._triggerCollider.on('onTriggerExit', this.triggerExitHandler, this);
  }

  triggerHandler(e) {
    const isTriggeredByCharacter =
      !!e.otherCollider.node.getComponent(CharacterController);
    if (!isTriggeredByCharacter) return;

    this._isTriggered = true;
    this.boxSpawnManager.startSpawn();

    const { isPlaying: isPressAnimationPlaying } =
      this._animationComponent.getState('press');
    if (isPressAnimationPlaying) return;

    const { isPlaying: isPressReverseAnimationPlaying } =
      this._animationComponent.getState('pressReverse');

    if (isPressReverseAnimationPlaying) {
      this._animationComponent.once(Animation.EventType.FINISHED, () => {
        const { isPlaying: isPressAnimationPlaying } =
          this._animationComponent.getState('press');
        if (this._isTriggered && !isPressAnimationPlaying) {
          this._animationComponent.play('press');
        }
      });
    } else {
      this._animationComponent.play('press');
    }
  }

  triggerExitHandler(e) {
    const isTriggeredByCharacter =
      !!e.otherCollider.node.getComponent(CharacterController);
    if (!isTriggeredByCharacter) return;

    this._isTriggered = false;
    this.boxSpawnManager.stopSpawn();

    const { isPlaying: isPressReverseAnimationPlaying } =
      this._animationComponent.getState('pressReverse');
    if (!isPressReverseAnimationPlaying) {
      this._animationComponent.play('pressReverse');
    }
  }
}
