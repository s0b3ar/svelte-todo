<script>
  export let title
  export let checked
  export let onCheck
  export let id
</script>
<style>
  .element__container {
    width: 300px;
    height: 45px;
    display: flex;
  }
  .element__title {
    font-size: 16px;
    display: flex;
    align-items: center;
  }
  .done {
    text-decoration: line-through;
  }
</style>

<div class="element__container">
  <div class="element__title">
    <input
      type="checkbox"
      checked={checked}
      on:click={() => onCheck(id)}
    />
    <span class:done="{checked}">{title}</span>
	</div>
</div>