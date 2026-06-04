import { config, collection, fields } from '@keystatic/core';

export default config({
  storage: { kind: 'local' },
  ui: {
    brand: { name: 'Satvik — Library' },
  },
  collections: {
    books: collection({
      label: 'Books',
      slugField: 'title',
      path: 'src/content/books/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        author: fields.text({ label: 'Author' }),
        coverURL: fields.text({ label: 'Cover URL', validation: { isRequired: false } }),
        status: fields.select({
          label: 'Status',
          options: [
            { label: 'Read', value: 'Read' },
            { label: 'Reading', value: 'Reading' },
            { label: 'Unread', value: 'Unread' },
            { label: 'Wishlist', value: 'Wishlist' },
          ],
          defaultValue: 'Unread',
        }),
        genres: fields.array(fields.text({ label: 'Genre' }), {
          label: 'Genres',
          itemLabel: (props) => props.value,
        }),
        dateAdded: fields.date({ label: 'Date added' }),
      },
    }),
    wishlist: collection({
      label: 'Wishlist',
      slugField: 'title',
      path: 'src/content/wishlist/*',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        author: fields.text({ label: 'Author' }),
        coverURL: fields.text({ label: 'Cover URL', validation: { isRequired: false } }),
        buyLink: fields.text({ label: 'Buy link', validation: { isRequired: false } }),
        priority: fields.select({
          label: 'Priority',
          options: [
            { label: 'High', value: 'High' },
            { label: 'Medium', value: 'Medium' },
            { label: 'Low', value: 'Low' },
          ],
          defaultValue: 'Medium',
        }),
        price: fields.text({ label: 'Price', validation: { isRequired: false } }),
        note: fields.text({ label: 'Note', multiline: true, validation: { isRequired: false } }),
        dateAdded: fields.date({ label: 'Date added' }),
      },
    }),
  },
});
