<script>
  import Element from './element.svelte'

  const NANOID_LENGTH = 10


  let items = []

  function addItem() {
    let todoInput = document.getElementById('todo-add-input')
    console.log('todoInput', todoInput.value)
    console.log('items', items)
    items = items.concat({id: 3, title: todoInput.value, checked: false })
  }

  function checkedItem(id) {
    const item = items.find(item => item.id === id)
    if (!item) {
      return
    }
  }
</script>

<style>
	.container__todo {
    width: 600px;
    margin: auto 50px;
  }
</style>

<div class="container__todo">
  {#each items as item}
  <Element>
    <input
      slot="checked"
      type="checkbox"
      checked={item.checked}
      on:click={() => checkedItem(item.id)}
    />
    <span slot="title">{item.title}</span>
  </Element>
  {/each}
  <input type="text" id="todo-add-input">
  <button on:click={addItem}>add</button>
</div>