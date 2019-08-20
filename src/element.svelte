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
</style>

<div class="element__container">
  <div class="element__title">
    <slot name="checked"></slot>
		<slot name="title"></slot>
	</div>
</div>