const QUEUE_KEY = 'reading-flow-offline-queue'

interface QueuedAction {
  id: string
  type: 'save_session' | 'save_reclassification' | 'save_memo'
  payload: unknown
  createdAt: number
  retries: number
}

function readQueue(): QueuedAction[] {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]') } catch { return [] }
}

function writeQueue(queue: QueuedAction[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue))
}

export function enqueue(type: QueuedAction['type'], payload: unknown): void {
  const queue = readQueue()
  queue.push({ id: crypto.randomUUID(), type, payload, createdAt: Date.now(), retries: 0 })
  writeQueue(queue)
}

export function dequeue(id: string): void {
  writeQueue(readQueue().filter((item) => item.id !== id))
}

export function getQueueSize(): number { return readQueue().length }

export async function processQueue(handler: (action: QueuedAction) => Promise<boolean>): Promise<number> {
  const queue = readQueue()
  let processed = 0
  for (const action of queue) {
    try {
      if (await handler(action)) { dequeue(action.id); processed++ }
      else { action.retries++; if (action.retries >= 5) dequeue(action.id) }
    } catch { action.retries++ }
  }
  writeQueue(readQueue())
  return processed
}
