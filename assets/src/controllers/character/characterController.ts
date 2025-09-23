import {
  _decorator,
  Component,
  Node,
  Vec3,
  Animation,
  AnimationClip,
  RigidBody,
  ColliderComponent,
  ICollisionEvent,
  BoxCollider,
  sys,
  systemEvent,
  SystemEventType,
  EventKeyboard,
  macro,
} from 'cc';
import input from '../../utils/input';
import { JoyStick } from '../../utils/joy-stick';
import OrbitCamera from '../../utils/orbit-camera';
const { ccclass, property, type } = _decorator;

let tempVec3 = new Vec3();

@ccclass('CharacterController')
export class CharacterController extends Component {
  @property
  moveSpeed = 10;

  @property
  runSpeed = 20;

  @type(Animation)
  animation: Animation | null = null;

  @type(RigidBody)
  rigidBody: RigidBody | null = null;

  @type(JoyStick)
  joyStick: JoyStick | null = null;

  @property
  jumpForce = 1;

  @type(OrbitCamera)
  orbitCamera: OrbitCamera | null = null;

  speed = new Vec3();
  targetSpeed = new Vec3();

  cameraRotation = 0;

  _currentAnim = '';

  _currentCollider: ColliderComponent | null = null;

  _grounded = true;

  start() {
    let collider = this.getComponent(BoxCollider);
    if (collider) {
      collider.on('onCollisionEnter', this.onCollision, this);
      collider.on('onCollisionStay', this.onCollision, this);
      collider.on('onCollisionExit', this.onCollisionExit, this);
    }

    systemEvent.on(SystemEventType.KEY_UP, this.onKeyUp, this);
    systemEvent.on(SystemEventType.KEY_DOWN, this.onKeyDown, this);

    if (!sys.isMobile && this.joyStick) {
      this.joyStick = null;
    }

    if (this.joyStick) {
      this.joyStick.node.on(
        Node.EventType.TOUCH_START,
        this.onJoyStickTouchStart,
        this
      );
    }
  }

  onKeyDown(event: EventKeyboard) {
    switch (event.keyCode) {
      case macro.KEY.up:
      case macro.KEY.w:
      case macro.KEY.down:
      case macro.KEY.s: {
        break;
      }
    }
  }
  onKeyUp(event: EventKeyboard) {
    switch (event.keyCode) {
      case macro.KEY.down:
      case macro.KEY.s:
    }
  }

  onJoyStickTouchStart() {
    if (this.orbitCamera) {
      // this.orbitCamera.resetTargetRotation()
    }
  }

  onCollision(event: ICollisionEvent) {
    let otherCollider = event.otherCollider;
    this._currentCollider = otherCollider;
    // TODO уточнить коллизию
    this._grounded = true;
  }

  onCollisionExit(event: ICollisionEvent) {
    this._currentCollider = null;
    this._grounded = false;
  }

  play(name) {
    if (!this.animation) {
      return;
    }
    if (this._currentAnim === name) {
      let state = this.animation.getState(name);
      if (state.wrapMode !== AnimationClip.WrapMode.Normal) {
        return;
      }
    }
    this._currentAnim = name;

    this.animation.crossFade(name, 0.1);
  }

  update(deltaTime: number) {
    // Your update function goes here.

    let moving = false;
    let speed = this.speed;
    let speedAmount = this.moveSpeed;
    if (input.key.shift) {
      speedAmount = this.runSpeed;
    } else if (this.joyStick) {
      speedAmount = this.moveSpeed * this.joyStick.magnitude;
    }

    this.targetSpeed.x = this.targetSpeed.z = 0;

    const cameraRotation = this.orbitCamera.targetRotation.y;

    if (input.key.left) {
      this.targetSpeed.x =
        speedAmount * Math.cos((cameraRotation * Math.PI) / 180);
      this.targetSpeed.z =
        -speedAmount * Math.sin((cameraRotation * Math.PI) / 180);
      moving = true;
    } else if (input.key.right) {
      this.targetSpeed.x =
        -speedAmount * Math.cos((cameraRotation * Math.PI) / 180);
      this.targetSpeed.z =
        speedAmount * Math.sin((cameraRotation * Math.PI) / 180);
      moving = true;
    }

    if (input.key.up) {
      this.targetSpeed.x =
        speedAmount * Math.sin((cameraRotation * Math.PI) / 180);
      this.targetSpeed.z =
        speedAmount * Math.cos((cameraRotation * Math.PI) / 180);
      moving = true;
    }

    if (input.key.down) {
      this.targetSpeed.x =
        -speedAmount * Math.sin((cameraRotation * Math.PI) / 180);
      this.targetSpeed.z =
        -speedAmount * Math.cos((cameraRotation * Math.PI) / 180);
      moving = true;
    }

    if (this.joyStick && this.joyStick.magnitude > 0) {
      const joyStickRotationWithCamera =
        this.joyStick.rotation + cameraRotation;
      this.targetSpeed.x =
        speedAmount * Math.sin((joyStickRotationWithCamera * Math.PI) / 180);
      this.targetSpeed.z =
        speedAmount * Math.cos((joyStickRotationWithCamera * Math.PI) / 180);
      moving = true;
    }

    Vec3.lerp(speed, speed, this.targetSpeed, deltaTime * 5);

    if (input.key.space || (this.joyStick && this.joyStick.jump)) {
      if (this._grounded) {
        this.rigidBody!.applyImpulse(
          tempVec3.set(0, this.jumpForce, 0)
        );
      }
    }

    if (this._grounded && !moving) {
      speed.x = speed.z = 0;
    }

    this.rigidBody!.getLinearVelocity(tempVec3);
    speed.y = tempVec3.y;
    this.rigidBody!.setLinearVelocity(speed);

    if (this.animation) {
      this.animation!.node.eulerAngles = tempVec3.set(
        0,
        this.cameraRotation,
        0
      );
    }
  }
}
