import {onMounted, useTemplateRef} from 'vue';

type CbrDraggableElementProps = {
    position: string,
    left: string,
    top: string,
    parent: HTMLElement
}

export class CbrDraggableElement {

    element_: HTMLElement | null = null;

    readonly SavedProps_ : CbrDraggableElementProps[] = [];

    constructor(divRefName: string) {
        const draggableRef = useTemplateRef<HTMLElement>(divRefName);

        onMounted(() => {
            console.log('CbrDraggableElement.onMounted');
            this.element_ = draggableRef.value;
        });
    }

    get element(): HTMLElement {
        if (!this.element_) {
            throw new Error('HTML Element not found');
        }

        return this.element_;
    }

    startDragMode(clientX: number, clientY: number): void {
        if (this.element_) {
            this.saveElementProps();

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

    saveElementProps(): void {
        if (this.element_) {
            this.SavedProps_.push({
                position: this.element_.style.position,
                left: this.element_.style.left,
                top: this.element_.style.top,
                parent: this.element_.parentElement as HTMLElement
            });
        }
    }

    restoreElementProps(): void {
        if (this.element_) {
            const props = this.SavedProps_.pop();
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
            const props = this.SavedProps_.pop();
            this.element_.style.position = props.position;
            this.element_.style.left = props.left;
            this.element_.style.top = props.top;
            parent.appendChild(this.element_);
        }
    }

    discardElementProps(): void {
        this.SavedProps_.pop();
    }
}
