# vite-plugin-prql

This is a simple [vite](https://vitejs.dev/) plugin that pre-processes [PRQL](https://prql-lang.org/) queries into SQL queries at build time.

# Install

Install the package using your package manager of choice (e.g. npm)

```
npm i prql-js vite-plugin-prql --save-dev
```

## Usage

### Configuration

Add the plugin to your Vite config (normally `vite.config.ts`)

```Javascript
import prqlPlugin from 'vite-plugin-prql'

export default {
    plugins: [
        prqlPlugin(),
    ]
}
```

If you plan to import `.prql` files directly (for example, `import query from './query.prql'`), you may see something like the following error:

```
Cannot find module './query.prql' or its corresponding type declarations.
```

To resolve this, you can update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    ...
    "moduleResolution": "node16",
    "types": [
      "vite-plugin-prql/prql"
    ],
    ...
}
```

### Examples

You can import `.prql` files directly in your code:

```Javascript
import MyQuery from '~/queries/my-query.prql'

function DoTheThing() {
    // MyQuery will contain a SQL string
    return sqlExecutor.runQuery(MyQuery);
}
```

Or you can use a tagged template literal with a prql query, which will be replaced with a SQL query at build time.

```Javascript
import prql from 'vite-plugin-prql'

function GetAlbums(artist) {
  return sqlExecutor.prepareQuery(prql`
    prql target:sql.sqlite

    from albums
    join artists [==artist_id]
    filter artists.name == s"?1"
    select [
      albums.title
    ]
  `)
  .bind(artist)
  .execute()
}
```
