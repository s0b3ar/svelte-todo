<script>
  import nanoid from 'nanoid'
  import Element from './element.svelte'

  const NANOID_LENGTH = 5

  let items = []
  $: console.log('items', items)

  function addItem() {
    let todoInput = document.getElementById('todo-add-input')
    items = items.concat({id: nanoid(NANOID_LENGTH), title: todoInput.value, checked: false })
    todoInput.value = ''
  }

  function checkedItem(id) {
    items = items.map(item => {
      if (item.id === id) {
        item.checked = !item.checked
      }
      return item
    })
  }
</script>

<style>
	.container__todo {
    width: 600px;
    margin: auto 50px;
  }
</style>

<div class="container__todo">
  <input type="text" id="todo-add-input">
  <button on:click={addItem}>add</button>
  {#if items.length === 0 }
    <p>No items in list</p>
  {:else}
    {#each items as item}
      <Element
        title={item.title}
        checked={item.checked}
        onCheck={checkedItem}
        id={item.id}
      />
    {/each}
  {/if}
</div>