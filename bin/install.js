#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import inquirer from "inquirer";

function detectPackageManager() {
  if (fs.existsSync(path.join(process.cwd(), "pnpm-lock.yaml"))) {
    return "pnpm";
  }
  if (fs.existsSync(path.join(process.cwd(), "yarn.lock"))) {
    return "yarn";
  }
  if (fs.existsSync(path.join(process.cwd(), "bun.lockb"))) {
    return "bun";
  }
  return "npm"; // Default
}


function removeDependenciesFromPackageJson(packageJson, dependencies) {
  const sections = ['dependencies', 'devDependencies'];

  sections.forEach(section => {
    if (packageJson[section]) {
      dependencies.forEach(dep => {
        delete packageJson[section][dep];
      });
    }
  });

  return packageJson;
}


function installDependencies(packageManager, packages) {
  console.log("📦 Installing new dependencies...");

  try {
    let command;
    switch (packageManager) {
      case "yarn":
        command = `yarn add -D ${packages.join(" ")}`;
        break;
      case "pnpm":
        command = `pnpm add -D ${packages.join(" ")}`;
        break;
      case "bun":
        command = `bun add -d ${packages.join(" ")}`;
        break;
      default:
        command = `npm install -D ${packages.join(" ")}`;
    }

    console.log(`Executing: ${command}`);
    execSync(command, { stdio: "inherit", encoding: "utf8" });
    return true;
  } catch (error) {
    console.error("❌ Error installing dependencies:", error.message);
    return false;
  }
}

const packageManager = detectPackageManager();
const projectPath = process.cwd();
const packageJsonPath = path.join(projectPath, "package.json");

if (process.argv.includes("--help")) {
  console.log(`
🔹 **ESLint + Prettier for Next.js ** - CLI Help
-------------------------------------------------
📌 **Installation**:
   ${packageManager} dlx eslint-prettier-next

📌 **Commands added to package.json**:
   - 🛠 **Lint check:**       ${packageManager} run lint
   - 🔧 **Fix lint issues:** ${packageManager} run lint:fix
   - ✨ **Format files:**    ${packageManager} run format
   - 🔍 **Check formatting:** ${packageManager} run format:check

📌 **Requirements**:
   - Next.js >= 13
   - Node.js 16+

📌 **Need Help?** Run:
   ${packageManager} dlx eslint-prettier-next --help
-------------------------------------------------
  `);
  process.exit(0);
}

console.log(`\n🚀 Starting ESLint + Prettier setup for Next.js with ${packageManager}...\n`);


if (!fs.existsSync(packageJsonPath)) {
  console.error("❌ Error: No `package.json` found. Please run this command inside a Next.js project.");
  process.exit(1);
}


const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));


if (!packageJson.dependencies || !packageJson.dependencies.next) {
  console.error("❌ Error: Next.js is not found in `dependencies`. Please run this command inside a Next.js project.");
  process.exit(1);
}


const nextVersion = packageJson.dependencies.next.replace(/[^0-9.]/g, "").split(".")[0];
if (parseInt(nextVersion, 10) < 13) {
  console.error("❌ Error: Next.js version must be 13 or higher.");
  process.exit(1);
}

console.log(`✅ Next.js version ${nextVersion} is compatible.`);


async function main() {
  const TypeScriptQuestion = await inquirer.prompt([
    {
      type: "list",
      name: "typescript",
      message: "📌 Select your project type:",
      choices: ["TypeScript", "JavaScript"],
    }
  ]);

  const TailwindQuestion = await inquirer.prompt([
    {
      type: "list",
      name: "useTailwind",
      message: "📌 Do you want to include TailwindCSS configuration?",
      choices: ["Yes", "No"],
    }
  ]);

  const isTypeScript = TypeScriptQuestion.typescript === "TypeScript";

  if (!isTypeScript) {
    console.error("❌ Failed to install dependencies. This package is not supported for Javascript.");
    process.exit(1);
  }

  const SrcQuestion = await inquirer.prompt([
    {
      type: "list",
      name: "srcDir",
      message: "📌 Does your project use a `src/` directory?",
      choices: ["Yes", "No"],
    }
  ]);

  const useSrcDir = SrcQuestion.srcDir === "Yes";
  const pathPrefix = useSrcDir ? "src/" : "./";

  console.log("\n🧹 Removing old ESLint and Prettier configurations...");


  const eslintFiles = [".eslintrc", ".eslintrc.json", ".eslintrc.js", ".eslintignore", "eslint.config.js", "eslint.config.mjs"];
  const prettierFiles = [".prettierrc", ".prettierrc.json", ".prettierrc.js", ".prettierignore"];

  [...eslintFiles, ...prettierFiles].forEach((file) => {
    const filePath = path.join(projectPath, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Removed: ${file}`);
    }
  });

  console.log("📦 Removing existing ESLint and Prettier dependencies...");


  const removePackages = [
    "@eslint/eslintrc",
    "@eslint/js",
    "@ianvs/prettier-plugin-sort-imports",
    "@typescript-eslint/eslint-plugin",
    "@typescript-eslint/parser",
    "eslint",
    "eslint-config-next",
    "eslint-config-prettier",
    "eslint-plugin-prettier",
    "eslint-plugin-import",
    "eslint-import-resolver-typescript",
    "prettier",
    "prettier-plugin-sort-json",
    "eslint-plugin-react",
    "eslint-plugin-react-hooks",
    "eslint-plugin-jsx-a11y",
    "@next/eslint-plugin-next",
    "eslint-plugin-tailwindcss",
    "prettier-plugin-tailwindcss",
    "@babel/eslint-parser",
    "eslint-plugin-simple-import-sort"
  ];


  const updatedPackageJson = removeDependenciesFromPackageJson(packageJson, removePackages);
  fs.writeFileSync(packageJsonPath, JSON.stringify(updatedPackageJson, null, 2));

  try {
    if (packageManager === "npm") {
      removePackages.forEach(pkg => {
        try {
          execSync(`npm uninstall ${pkg}`, { stdio: 'ignore' });
        } catch (e) {
          // 
        }
      });
    } else {
      execSync(`${packageManager} remove ${removePackages.join(" ")}`, { stdio: 'ignore' });
    }
  } catch (e) {
    console.log("Note: Some packages weren't installed, continuing...");
  }

  console.log("🧹 Removing lockfile to force a fresh install...");
  const lockFiles = ["package-lock.json", "yarn.lock", "pnpm-lock.yaml", "bun.lockb"];
  lockFiles.forEach((file) => {
    const filePath = path.join(projectPath, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Removed: ${file}`);
    }
  });

  console.log("✅ Old dependencies and lockfile removed!");

  const basePackages = [
    "@eslint/eslintrc@3.2.0",
    "@eslint/js@9.18.0",
    "@ianvs/prettier-plugin-sort-imports@4.4.0",
    "@typescript-eslint/eslint-plugin@8.19.1",
    "@typescript-eslint/parser@8.19.1",
    "eslint@9.18.0",
    "eslint-config-next@15.1.4",
    "eslint-config-prettier@9.1.0",
    "eslint-plugin-prettier@5.2.1",
    "prettier@3.4.2",
    "prettier-plugin-sort-json@4.1.1"
  ];

  const tailwindPackages = [
    "eslint-plugin-tailwindcss@3.18.0",
    "prettier-plugin-tailwindcss@0.6.11"
  ];

  const installPackages = [
    ...basePackages,
    ...(TailwindQuestion.useTailwind === "Yes" ? tailwindPackages : [])
  ];
  const installSuccess = installDependencies(packageManager, installPackages);

  if (!installSuccess) {
    console.error("❌ Failed to install dependencies. Please try installing them manually.");
    process.exit(1);
  }

  console.log("✅ Dependencies installed successfully!");
  fs.writeFileSync(
    path.join(projectPath, "eslint.config.mjs"),
    `/* eslint-disable import/no-anonymous-default-export */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import typescriptEslintEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-plugin-prettier";${TailwindQuestion.useTailwind === "Yes" ? '\nimport tailwind from "eslint-plugin-tailwindcss";' : ''}

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
      prettier,${TailwindQuestion.useTailwind === "Yes" ? '\n      tailwind,' : ''}
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
  ...compat.extends("plugin:@typescript-eslint/recommended", "prettier").map((config) => ({
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
  },${
    TailwindQuestion.useTailwind === "Yes"
      ? '\n  ...tailwind.configs["flat/recommended"],'
      : ''
  }
];
`
  );
  const prettierConfig = {
    printWidth: 120,
    singleQuote: false,
    tabWidth: 2,
    trailingComma: "es5",
    plugins: [
      "@ianvs/prettier-plugin-sort-imports",
      "prettier-plugin-sort-json",
      ...(TailwindQuestion.useTailwind === "Yes" ? ["prettier-plugin-tailwindcss"] : [])
    ],
    importOrder: [
      "^(react/(.*)$)|^(react$)",
      "^(next/(.*)$)|^(next$)",
      "<THIRD_PARTY_MODULES>",
      "",
      "^@/(.*)$",
      "^[./]"
    ],
    importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"]
  };

  fs.writeFileSync(
    path.join(projectPath, ".prettierrc.json"),
    JSON.stringify(prettierConfig, null, 2)
  );
  fs.writeFileSync(path.join(projectPath, ".prettierignore"), `/node_modules\n/.next\n/out\n/build`);

  console.log("✅ Created `eslint.config.mjs` and Prettier configuration files.");

  const finalPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  finalPackageJson.scripts = {
    ...finalPackageJson.scripts,
    "lint": `eslint \"${pathPrefix}**/*.+(ts|tsx)\"`,
    "lint:fix": `eslint \"${pathPrefix}**/*.+(ts|tsx)\" --fix`,
    "format": `prettier . --write`,
    "format:check": `prettier . --check`
  };

  fs.writeFileSync(packageJsonPath, JSON.stringify(finalPackageJson, null, 2));
  console.log("✅ Updated `package.json` scripts.");

  console.log(`
🎉 **Setup completed!** 🎉
✅ Scripts added/updated:
   - 🛠 ${packageManager} run lint
   - 🔧 ${packageManager} run lint:fix
   - ✨ ${packageManager} run format
   - 🔍 ${packageManager} run format:check

📌 **Need help? Run:**
   ${packageManager} dlx eslint-prettier-next --help
  `);
}

main().catch(error => {
  console.error("❌ An error occurred:", error);
  process.exit(1);
});
