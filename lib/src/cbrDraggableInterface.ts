import type { Ref } from "vue";

export interface CbrDraggableInterface {
    readonly id: string;
    readonly showAddIcon : Ref<boolean>;
    readonly showRemoveIcon : Ref<boolean>;

    unpin() : void;
    pin(pinArea: HTMLElement):void;
}
