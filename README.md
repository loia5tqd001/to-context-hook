<p align="center">
  <img src="https://user-images.githubusercontent.com/31364664/140613893-52e7ceb5-eca5-4c9e-b3ff-6c050be71284.png" alt="to-context-hook logo" width="350" />
</p>

The simplest API ever to turn a normal React custom hook into a "context-hook", meaning there is a context attached to the hook, thus not just the "stateful logic" but the states are also shared.

> I use this package in my projects in place of Redux

## 🔥 Installation

npm:

```sh
npm install to-context-hook
```

yarn:

```sh
yarn add to-context-hook
```

## 👍 Usage

### 1. Setup

Use either [`ContextHookProvider`] or [`withContextHook`] to wrap the provider around your application.

```jsx
function App() {
  // Wrap your App with ContextHookProvider
  return (
    <ContextHookProvider>
      <Button />
      <Count />
    </ContextHookProvider>
  );
}

export default withContextHook(App); // Or by using the HOC syntax
```

### 2. Use [`toContextHook`] to turn any normal custom hook into a context-hook

```jsx
import { toContextHook } from 'to-context-hook';

// Create a normal custom hook as usual
function useCounter() {
  const [count, setCount] = useState(0);
  const increment = () => setCount((prevCount) => prevCount + 1);
  return { count, increment };
}

// Turn the custom hook into a context-hook (in other words: attach the context to the hook)
const useCounterContext = toContextHook(useCounter);

function Button() {
  // Use the context
  const { increment } = useCounterContext();
  return <button onClick={increment}>+</button>;
}

function Count() {
  // Use the context in another component
  const { count } = useCounterContext();
  return <span>{count}</span>;
}
```

### 3. Advanced usage

The usage above works for 100% of the time. However like the normal React Context, you might want to create multiple contexts, some to wrap only a portion of your application in the component tree. In that case, you can use [`contextName`] and can refer to [this example]().

[`tocontexthook`]: #1-tocontexthookhook-contextname
[`contexthookprovider`]: #2-contextHookprovider-contextname-
[`withcontexthook`]: #3-withcontexthookcomponent-contextname
[`contextname`]: #contextname-string

## 📌 API

There are 3 public APIs: [`toContextHook`], [`ContextHookProvider`], and [`withContextHook`] _- and usually the last 2 you only need to touch once for lifetime_.

### 1. `toContextHook(hook, contextName?)`

```jsx
import { toContextHook } from 'to-context-hook';

// a normal custom hook
const useCounter = () => {};

// turn the custom hook into a context-hook
const useCounterContext = toContextHook(useCounter);
```

#### `hook: () => TReturn`

The hook to turn into a context-hook, **this can only be a non-parametered function**. For hooks with parameters usage, you need to convert the parametered one to non-parameterd one, can refer to [this example]().

#### `contextName?: string`

If you want all of your hooks to behave like they are under one global context (like Redux store), you don't need to care about `contextName`, move on.

However, if you want some of your contexts to be around a specific portion lower than the global level in component tree, you can use `contextName`. You then need to wrap another `ContextHookProvider`/`withContextHook` around that component tree level with the corresponding `contextName` used in [`toContextHook`]. Can refer to [this example]().

### 2. `ContextHookProvider({ contextName? })`

Normally you will want to wrap a global `ContextHookProvider` (without `contextName`) once around your whole application and that's it.

- Global Provider (without `contextName`)

```jsx
function App() {
  // Wrap your App with ContextHookProvider
  return (
    <ContextHookProvider>
      <Button />
      <Count />
    </ContextHookProvider>
  );
}
```

However if you want to create a custom context level in your component tree, can use `contextName`, may refer to [this example]().

- Portional-level Provider (with `contextName`)

```jsx
// Two hooks below are wrapped under a separate context named PAGE1_CONTEXT, are separated from the global context
const useCounterPage1 = toContextHook(useCounter, 'PAGE1_CONTEXT');
const useTogglePage1 = toContextHook(useToggle, 'PAGE1_CONTEXT');

function Page1() {
  // For each separate context, need another provider
  return (
    <ContextHookProvider contextName="PAGE1_CONTEXT">
      <Button />
      <Count />
    </ContextHookProvider>
  );
}
```

### 3. `withContextHook(Component, contextName?)`

It works like [`ContextHookProvider`] but sometimes you prefer the HOC syntax.

- without `contextName` (should be the default/global one)

```jsx
export default withContextHook(App);
```

- with `contextName`

```jsx
export default withContextHook(Page1, 'PAGE1_CONTEXT');
```

## FAQ

## Credit

This library is heavily inspired by [use-between](https://github.com/betula/use-between) and [constate](https://github.com/diegohaz/constate), many thanks!

## Comparison

## License

[MIT](https://github.com/loia5tqd001/to-context-hook/blob/main/LICENSE)
