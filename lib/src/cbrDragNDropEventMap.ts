import type { CbrHoverEnterEvent, CbrHoverExitEvent, DragnDropEvents, CbrUnpinnedEvent, CbrPinEvent } from "./cbrDragNDropTypes";

declare global {
    interface HTMLElementEventMap {
      [DragnDropEvents.HOVER_ENTER]: CustomEvent<CbrHoverEnterEvent>;
      [DragnDropEvents.HOVER_EXIT]: CustomEvent<CbrHoverExitEvent>;
      [DragnDropEvents.UNPINNED]: CustomEvent<CbrUnpinnedEvent>;
      [DragnDropEvents.PIN]: CustomEvent<CbrPinEvent>;
    }
  }
