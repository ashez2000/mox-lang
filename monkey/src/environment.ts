import { MonkeyObject } from './object'

export class Environment {
  private store: Map<string, MonkeyObject> = new Map()

  get(name: string) {
    return this.store.get(name)
  }

  set(name: string, value: MonkeyObject) {
    this.store.set(name, value)
  }
}
