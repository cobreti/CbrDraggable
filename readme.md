# CbrDraggable

## installation

```
    npm install --save-dev @cobreti/CbrDraggable
```

## Simple example

### template

```
    <CbrDraggable id="some-id" class="draggable-item" :controller="draggableController">
        <div>caption</div>
    </CbrDraggable>
```

### importing styles

```
    <style src="@cobreti/cbr-draggable/dist/style.css">
    </style>

```

### Script setup

```
    import { CbrDraggable, CbrDraggableController, CbrDraggableOnRemove, CbrDraggableOnAdd, type CbrDraggableInterface } from "@cobreti/cbr-draggable";

    const draggableController = ref(new CbrDraggableController({
      pinAreaSelector: '.drop-area',
      freeAreaSelector: '.chip-area',
    }));
```

## Example with decorators

You can use on-add and on-remove decorators which will make the given content appear when adding to an area or it's possible to remove from an area

### template

```
    <CbrDraggable id="test" class="draggable-item" :controller="draggableController">
        <div>test</div>
        
        <template v-slot:decorator>
        
          <cbr-draggable-on-add class="draggable-item-icon">
            <v-icon class="add-icon" icon="mdi-plus-circle-outline"></v-icon>
          </cbr-draggable-on-add>
          
          <cbr-draggable-on-remove class="draggable-item-icon"  @click="onRemoveClicked">
             <v-icon class="remove-icon" icon="mdi-close-circle-outline"></v-icon>
          </cbr-draggable-on-remove>
        </template>
        
    </CbrDraggable>
```

### script

```
    function onRemoveClicked(draggable: CbrDraggableInterface) {
      draggable.unpin();
    }

```