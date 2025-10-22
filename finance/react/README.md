# AG Grid Finance Demo (React + TypeScript + Vite)

The [AG Grid Finance Demo](https://ag-grid.com/example-finance/) in React.js.

## Getting Started

1. Get a copy of this folder using [degit](https://github.com/Rich-Harris/degit) (without the git respository files):

   ```
   npx degit ag-grid/ag-grid-demos/finance/react ag-grid-finance-example-react
   cd ag-grid-finance-example-react
   ```

   Alternatively, you can get the files using `git clone`:

   ```
   git clone git@github.com:ag-grid/ag-grid-demos.git
   cd ag-grid-demos/finance/react
   ```

2. Install dependencies: `npm install`
3. Run the dev server: `npm run dev`
4. (Optional) Start the demo API server in a separate terminal: `npm run server`

### Demo API Endpoints

- `GET http://localhost:4000/api/ping` returns a simple health payload.
- `POST http://localhost:4000/api/echo` echoes any JSON payload you send.

The server uses CORS and JSON middleware so it can be called directly from the React app during local development.

## How It Was Built

This example code was generated with the [Vite React Typescript template](https://vitejs.dev/guide/) using:

```
npm create vite@latest finance/react -- --template react-ts

# With the addition of the following modules
npm i ag-charts-enterprise ag-grid-enterprise ag-grid-react
```

<br /><br />

## Support

### Enterprise Support

AG Grid Enterprise customers have access to dedicated support via [ZenDesk](https://ag-grid.zendesk.com/hc/en-us), which is monitored by our engineering teams.

### Bug Reports

If you have found a bug, please report it in our main repository's [issues](https://github.com/ag-grid/ag-grid/issues) section.
