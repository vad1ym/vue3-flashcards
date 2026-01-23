# Card Content

Structure and render individual cards.

## Default Slot

Use the `default` slot to define card content:

```vue
<FlashCards :items="cards">
  <template #default="{ item }">
    <div class="card">
      <h3>{{ item.title }}</h3>
      <p>{{ item.description }}</p>
    </div>
  </template>
</FlashCards>
```

## Card Styling

Cards are `position: absolute` and sized by the container:

```css
.card {
  width: 300px;
  height: 400px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
```

## Empty State

Show content when all cards are swiped:

```vue
<FlashCards :items="cards">
  <template #default="{ item }">
    <!-- card content -->
  </template>

  <template #empty>
    <div>No more cards!</div>
  </template>
</FlashCards>
```

**See:** [Styling - Card Styling](../styling/card-styling.md)
