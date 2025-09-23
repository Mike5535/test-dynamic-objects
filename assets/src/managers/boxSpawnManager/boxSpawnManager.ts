import { _decorator, Component, instantiate, Label, Prefab } from 'cc';
const { ccclass, property, type } = _decorator;

@ccclass('boxSpawnManager')
export class BoxSpawnManager extends Component {
  public countOfSpawnedBoxes = 0;

  @property
  spawnDelay: number;

  @type(Prefab)
  spawnedBoxPrefab: Prefab;

  @type(Label)
  boxCounterLabel: Label;

  spawnBoxes = () => {
    const spawnedInstance = instantiate(this.spawnedBoxPrefab);
    spawnedInstance.parent = this.node;
    this.countOfSpawnedBoxes++;
    this.updateLabel(this.countOfSpawnedBoxes);
  };

  startSpawn() {
    this.schedule(this.spawnBoxes, this.spawnDelay);
  }

  stopSpawn() {
    this.unschedule(this.spawnBoxes);
  }

  updateLabel = (count: number) => {
    this.boxCounterLabel.string = `Spawned boxes: ${this.countOfSpawnedBoxes}`;
  };
}
