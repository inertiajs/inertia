export class SessionStorage {
  protected static key = 'inertiaLocationVisit'

  public static set(value: any): void {
    window.sessionStorage.setItem(this.key, JSON.stringify(value))
  }

  public static get(): string | null {
    return window.sessionStorage.getItem(this.key)
  }

  public static remove(): void {
    window.sessionStorage.removeItem(this.key)
  }

  public static exists(): boolean {
    try {
      return this.get() !== null
    } catch (error) {
      return false
    }
  }
}
