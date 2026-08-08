import { Injectable } from '@angular/core';

export interface HistoryEntry {
  value: string;
  selectionStart: number;
  selectionEnd: number;
}

/**
 * Generic history manager for text editors.
 * Manages undo/redo state independently for multiple fields/editors.
 * Each field maintains its own history stack with debounced snapshots.
 */
@Injectable({
  providedIn: 'root',
})
export class EditorHistoryService {
  private readonly MAX_HISTORY = 50;
  private readonly INPUT_DEBOUNCE_MS = 500;

  // Per-field history stacks
  private history: Map<string | number, HistoryEntry[]> = new Map();
  private historyIndex: Map<string | number, number> = new Map();
  private inputTimers: Map<string | number, ReturnType<typeof setTimeout>> = new Map();

  /**
   * Initialize history for a new field with an initial value.
   * Call this when loading initial data for an editor field.
   */
  initializeField(fieldKey: string | number, initialValue: string): void {
    if (this.history.has(fieldKey)) {
      return; // Already initialized
    }

    this.history.set(fieldKey, [
      {
        value: initialValue,
        selectionStart: initialValue.length,
        selectionEnd: initialValue.length,
      },
    ]);
    this.historyIndex.set(fieldKey, 0);
  }

  /**
   * Ensure history is initialized. Call before capturing snapshots.
   */
  ensureInitialized(fieldKey: string | number, currentValue: string): void {
    if (!this.history.has(fieldKey)) {
      this.initializeField(fieldKey, currentValue);
    }
  }

  /**
   * Capture a snapshot of the field's current value.
   * Automatically debounced; call freely on every input event.
   * Flushes previous pending debounce before capturing.
   */
  captureSnapshot(
    fieldKey: string | number,
    value: string,
    selectionStart: number,
    selectionEnd: number,
  ): void {
    // Flush any pending debounce for this field
    this.flushPending(fieldKey);

    // Start debounce timer
    const timer = setTimeout(() => {
      this.inputTimers.delete(fieldKey);
      this.doCapture(fieldKey, value, selectionStart, selectionEnd);
    }, this.INPUT_DEBOUNCE_MS);

    this.inputTimers.set(fieldKey, timer);
  }

  /**
   * Flush pending debounce and immediately capture current state.
   * Call before undo/redo or when losing focus.
   */
  flushPending(fieldKey: string | number): void {
    const timer = this.inputTimers.get(fieldKey);
    if (timer) {
      clearTimeout(timer);
      this.inputTimers.delete(fieldKey);
    }
  }

  /**
   * Perform immediate capture (called after debounce expires or on flush).
   */
  private doCapture(
    fieldKey: string | number,
    value: string,
    selectionStart: number,
    selectionEnd: number,
  ): void {
    let stack = this.history.get(fieldKey);
    let index = this.historyIndex.get(fieldKey);

    if (!stack || index === undefined) {
      this.initializeField(fieldKey, value);
      stack = this.history.get(fieldKey)!;
      index = this.historyIndex.get(fieldKey)!;
    }

    // Avoid pushing duplicate consecutive snapshots
    if (stack[index].value === value) return;

    const entry: HistoryEntry = {
      value,
      selectionStart,
      selectionEnd,
    };

    // Trim future history if user was in middle of undo chain
    stack = stack.slice(0, index + 1);
    stack.push(entry);

    // Enforce MAX_HISTORY limit
    if (stack.length > this.MAX_HISTORY) {
      stack = stack.slice(stack.length - this.MAX_HISTORY);
    }

    this.history.set(fieldKey, stack);
    this.historyIndex.set(fieldKey, stack.length - 1);
  }

  /**
   * Undo to previous state. Returns the HistoryEntry if successful, null if at beginning.
   */
  undo(fieldKey: string | number): HistoryEntry | null {
    this.flushPending(fieldKey);

    const stack = this.history.get(fieldKey);
    const index = this.historyIndex.get(fieldKey);

    if (!stack || index === undefined || index <= 0) {
      return null; // Cannot undo
    }

    const newIndex = index - 1;
    const entry = stack[newIndex];
    this.historyIndex.set(fieldKey, newIndex);

    return entry;
  }

  /**
   * Redo to next state. Returns the HistoryEntry if successful, null if at end.
   */
  redo(fieldKey: string | number): HistoryEntry | null {
    this.flushPending(fieldKey);

    const stack = this.history.get(fieldKey);
    const index = this.historyIndex.get(fieldKey);

    if (!stack || index === undefined || index >= stack.length - 1) {
      return null; // Cannot redo
    }

    const newIndex = index + 1;
    const entry = stack[newIndex];
    this.historyIndex.set(fieldKey, newIndex);

    return entry;
  }

  /**
   * Check if undo is available for a field.
   */
  canUndo(fieldKey: string | number): boolean {
    const index = this.historyIndex.get(fieldKey);
    return index !== undefined && index > 0;
  }

  /**
   * Check if redo is available for a field.
   */
  canRedo(fieldKey: string | number): boolean {
    const stack = this.history.get(fieldKey);
    const index = this.historyIndex.get(fieldKey);
    return !!stack && index !== undefined && index < stack.length - 1;
  }

  /**
   * Get the current value for a field without changing history.
   */
  getCurrentValue(fieldKey: string | number): string | null {
    const index = this.historyIndex.get(fieldKey);
    const stack = this.history.get(fieldKey);

    if (!stack || index === undefined) return null;

    return stack[index].value;
  }

  /**
   * Clear all history for a field. Call when resetting/loading new content.
   */
  clearField(fieldKey: string | number): void {
    this.flushPending(fieldKey);
    this.history.delete(fieldKey);
    this.historyIndex.delete(fieldKey);
  }

  /**
   * Clear all history for all fields.
   */
  clearAll(): void {
    this.inputTimers.forEach((timer) => clearTimeout(timer));
    this.inputTimers.clear();
    this.history.clear();
    this.historyIndex.clear();
  }
}
