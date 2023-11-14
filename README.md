# HTML File Mutate
This is a sample project that does and shows the following:
- Retrieves and parses a HTML file.
- Converts the parsed HTML file into a HTML node which can be manipulated in/via JavaScript.
- Modifies the parsed HTML node, replacing selected content with new content.
- Stores the modified HTML node in a new HTML file.

## Prerequisites
It is required that Node.js is installed in the environment where this project is to be run.

**N.B: This project only works with Node.js v16 and above.**

## Dependencies
This project has two dependencies:
- The `fs` module: This comes as part of the Node.js standard library; it does not have to be explicitly installed. <br />
  It is used to read the source HTML file and also store the modified HTML content.

- The `jsdom` library: This is a 3rd-party library that has to be installed. <br />
  It is necessary because necessay DOM APIs are not present in Node.js, as they are for browser environments only.

  `jsdom` provides implementations of relevant web standards and APIs in pure javascript, separate from the
  browser environment.

  It is used to parse and modify the source HTML file.

All dependencies can be installed by running either of the following, depending on the package manager in use:
```bash
yarn install
```

```bash
npm install
```

### How to run
The entry file of this project is `index.js`.

It can be run by running:

```bash
node index.js
```

OR using the defined `start` script by running either of the following, depending on the package manager in use:

```bash
yarn start
```

```bash
npm start
```

## Documentation
This project is documented using detailed block and inline comments.

## Project structure
```bash
├── assets
│   ├── instructions.json
│   ├── source.html
├── output
├── .gitignore
├── index.js
├── package.json
└── README.md
```

`assets/source.html` - This is the source HTML file to be parsed and modified.

`assets/instructions.json` - This contains relevant data to facilitate the identification and modification/replacement of HTML content in the source file.

`output` - This is where the outputted result will be stored.

`.gitignore` - This specifies what files & directories should not be added to the repository.

`index.js` - This is the entry file of the project. It contains all the logic.

`package.json` - This is the project's manifest and configuration file.

`README.md` - This contains relevant documentation/info for working with this project.