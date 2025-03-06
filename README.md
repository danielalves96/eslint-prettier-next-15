# 🚀 ESLint + Prettier Setup for Next.js 15

This script automates the setup of ESLint and Prettier for Next.js 15 projects, ensuring high code quality and consistency. It detects the package manager, removes existing configurations, installs necessary dependencies, and configures the project automatically.

## 📌 Features

- 🏗 **Automatic Package Manager Detection** (`npm`, `yarn`, `pnpm`, or `bun`)
- 🧹 **Removes Old ESLint & Prettier Configurations**
- 📦 **Installs Latest ESLint & Prettier Dependencies**
- 🛠 **Adds ESLint & Prettier Configuration Files**
- 🔄 **Updates `package.json` Scripts**

## 📥 Installation

You can run this setup in a Next.js 15 project using the following command:

```sh
npx eslint-prettier-next-15
```

or if using `yarn`:

```sh
yarn dlx eslint-prettier-next-15
```

or with `pnpm`:

```sh
pnpm dlx eslint-prettier-next-15
```

or with `bun`:

```sh
bunx eslint-prettier-next-15
```

## 📦 Dependencies Installed

The following dependencies will be installed:

- `@eslint/eslintrc@3.2.0`
- `@eslint/js@9.18.0`
- `@ianvs/prettier-plugin-sort-imports@4.4.0`
- `@typescript-eslint/eslint-plugin@8.19.1`
- `@typescript-eslint/parser@8.19.1`
- `eslint@9.18.0`
- `eslint-config-next@15.1.4`
- `eslint-config-prettier@9.1.0`
- `eslint-plugin-prettier@5.2.1`
- `prettier@3.4.2`
- `prettier-plugin-sort-json@4.1.1`

## 📖 Usage

After running the script, you can use the following commands in your project:

### Linting Commands

- 🛠 **Check for linting errors**

  ```sh
  npm run lint
  ```

  ```sh
  yarn lint
  ```

  ```sh
  pnpm run lint
  ```

  ```sh
  bun run lint
  ```

- 🔧 **Fix linting issues**
  ```sh
  npm run lint:fix
  ```
  ```sh
  yarn lint:fix
  ```
  ```sh
  pnpm run lint:fix
  ```
  ```sh
  bun run lint:fix
  ```

### Formatting Commands

- ✨ **Format files**

  ```sh
  npm run format
  ```

  ```sh
  yarn format
  ```

  ```sh
  pnpm run format
  ```

  ```sh
  bun run format
  ```

- 🔍 **Check formatting (without modifying files)**
  ```sh
  npm run format:check
  ```
  ```sh
  yarn format:check
  ```
  ```sh
  pnpm run format:check
  ```
  ```sh
  bun run format:check
  ```

## 🛠 Configuration Files

After setup, the following configuration files will be created in your project:

### `.prettierrc.json`

```json
{
  "printWidth": 120,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "es5",
  "plugins": [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-sort-json"
  ],
  "importOrder": [
    "^(react/(.*)$)|^(react$)",
    "^(next/(.*)$)|^(next$)",
    "<THIRD_PARTY_MODULES>",
    "",
    "^@/(.*)$",
    "^[./]"
  ],
  "importOrderParserPlugins": ["typescript", "jsx", "decorators-legacy"]
}
```

### `.prettierignore`

```
/node_modules
/.next
/out
/build
```

### `eslint.config.mjs`

```js
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  ...compat.extends("next", "next/core-web-vitals", "prettier"),
  {
    plugins: {
      prettier,
    },
    rules: {
      "prettier/prettier": "error",
      camelcase: "off",
      "import/prefer-default-export": "off",
      "react/jsx-filename-extension": "off",
      "react/jsx-props-no-spreading": "off",
      "react/no-unused-prop-types": "off",
      "react/require-default-props": "off",
      "react/no-unescaped-entities": "off",
      "import/extensions": [
        "error",
        "ignorePackages",
        {
          ts: "never",
          tsx: "never",
          js: "never",
          jsx: "never",
        },
      ],
    },
  },
  ...compat
    .extends("plugin:@typescript-eslint/recommended", "prettier")
    .map((config) => ({
      ...config,
      files: ["**/*.+(ts|tsx)"],
    })),
  {
    files: ["**/*.+(ts|tsx)"],
    plugins: {
      "@typescript-eslint": typescriptEslintEslintPlugin,
    },
    languageOptions: {
      parser: tsParser,
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "no-use-before-define": [0],
      "@typescript-eslint/no-use-before-define": [1],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
];
```

## ⚙️ Requirements

- **Next.js** `>= 13`
- **Node.js** `>= 16`

## ❓ Help

To display the help message, run:

```sh
npx eslint-prettier-next --help
```

or

```sh
npm dlx eslint-prettier-next --help
```

---

## 🤝 Contributing

This project is open-source, and contributions are welcome!

To contribute:

1. Fork the repository.
2. Clone your fork and create a new branch.
3. Make your changes and commit them.
4. Push your branch and open a pull request.

We appreciate your contributions! 🚀
