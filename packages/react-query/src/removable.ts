export abstract class Removable {
  gcTime!: number

  protected scheduleGc(): void {
    setTimeout(() => {
      this.optionalRemove()
    }, this.gcTime)
  }

  protected updateGcTime(newGcTime: number | undefined): void {
    // 默认query回收时间为5分钟
    this.gcTime = Math.max(this.gcTime || 0, newGcTime ?? 5 * 60 * 1000)
  }

  protected abstract optionalRemove(): void
}
