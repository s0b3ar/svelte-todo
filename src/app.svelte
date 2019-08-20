<script>
  import Element from './element.svelte'

  const items = [
    { id: 1, title: 'first', checked: false },
    { id: 2, title: 'second', checked: false }
  ]

  function addItem(title) {
    items.push({id: parseInt(items[items.length - 1].id, 10) + 1, title, checked: false })
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
  {#each items as item (item.id) }
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
</div>