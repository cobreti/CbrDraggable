import {Ref} from 'vue';
import {CbrDraggableVuejsHooks} from '@/cbrDragNDropTypes.js';

type CbrDraggableElementProps = {
    position: string,
    left: string,
    top: string,
    parent: HTMLElement
}

export type CbrDraggableElementOptions = {
    draggableRef: Ref<HTMLElement>,
    hooks: CbrDraggableVuejsHooks
}

export class CbrDraggableElement {

    element_: HTMLElement | null = null;

    readonly savedProps_ : CbrDraggableElementProps[] = [];

    constructor(options: CbrDraggableElementOptions) {
        options.hooks.onMounted(() => {
            this.element_ = options.draggableRef.value;
        });
    }

    get valid(): boolean {
        return this.element_ !== null;
    }

    get htmlElement(): HTMLElement {
        if (!this.element_) {
            throw new Error('HTML Element not found');
        }

        return this.element_;
    }

    startDragMode(clientX: number, clientY: number): void {
        if (this.element_) {
            this.saveProps();

            this.element_.style.position = 'fixed'
            this.element_.style.left = `${clientX - this.element_.clientWidth / 2}px`;
            this.element_.style.top = `${clientY - this.element_.clientHeight / 2}px`;
            document.body.appendChild(this.element_);
        }
    }

    updateDragTopLeftPosition(clientX: number, clientY: number): void {
        if (this.element_) {
            this.element_.style.left = `${clientX - this.element_.clientWidth / 2}px`;
            this.element_.style.top = `${clientY - this.element_.clientHeight / 2}px`;
        }
    }

    saveProps(): void {
        if (this.element_) {
            this.savedProps_.push({
                position: this.element_.style.position,
                left: this.element_.style.left,
                top: this.element_.style.top,
                parent: this.element_.parentElement as HTMLElement
            });
        }
    }

    restoreSavedProps(): void {
        if (this.element_) {
            const props = this.savedProps_.pop();
            if (props) {
                this.element_.style.position = props.position;
                this.element_.style.left = props.left;
                this.element_.style.top = props.top;
                props.parent.appendChild(this.element_);
            }
        }
    }

    addAsChildToElement(parent: HTMLElement): void {
        if (this.element_) {

            if (this.savedProps_.length > 0) {
                const props = this.savedProps_.pop();
                this.element_.style.position = props.position;
                this.element_.style.left = props.left;
                this.element_.style.top = props.top;
            }
            parent.appendChild(this.element_);
        }
    }

    discardSavedProps(): void {
        this.savedProps_.pop();
    }
}
