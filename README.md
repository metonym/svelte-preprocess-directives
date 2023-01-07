# svelte-preprocess-directives

> Svelte preprocessor that allows class and style directives to be used on Svelte components.

Currently, `class:` and `style:` directives can only be applied to DOM elements.

```svelte
<div class:active style:color="red" />
```

Attempting to use directives on an inline Svelte component will throw a compiling error. This preprocessor transforms markup code to allow class and style directives to be used directly on inline components.

```diff
- <Component class:a={true} />
+ <Component class="{true && 'a'}" />

- <Component style:color="red" />
+ <Component style="color: red" />
```

## Installation

```bash
# Yarn
yarn add -D svelte-preprocess-directives

# NPM
npm i -D svelte-preprocess-directives

# pnpm
pnpm i -D svelte-preprocess-directives
```

## Usage

```js
// svelte.config.js
import { componentDirectives } from "svelte-preprocess-directives";

/** @type {import('@sveltejs/kit').Config} */
export default {
  preprocessors: [componentDirectives()],
};
```

## Changelog

[CHANGELOG.md](CHANGELOG.md)

## License

[MIT](LICENSE)
