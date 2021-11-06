<p align="center">
  <img src="https://user-images.githubusercontent.com/31364664/140613893-52e7ceb5-eca5-4c9e-b3ff-6c050be71284.png" alt="to-context-hook logo" width="350" />
</p>

The simplest API ever to attach context to a hook, meaning not just the "stateful logic" but the states are also shared. The transated hook is called "context-hook".

> I use this package in my projects in place of Redux

## 🔥 Demo and behaviors

<p align="center">
  <a href="https://codesandbox.io/s/react-router-forked-dt9rk">
  <img src="https://codesandbox.io/static/img/play-codesandbox.svg" alt="toContextHook demo">
  </a>
</p>

1. **Page 1 - Global Context**: The states are shared between `Element1` and `Element2`, and will be persisted even after Page 1 got unmounted.
1. **Page 2 - Page level Context**: The states are shared between `Element1` and `Element2`, however the states will be reset when Page 2 got unmounted (e.g. routing to another page).
1. **Page 3 - Hooks with parameters**: Turn parameterized hooks into non-parameterized hooks before turning into context-hook, with the aim of each different parameter-set has a different separated Context. [See more][faq.4]
1. **Page 4 - When making typo in [`contextName`]**: There will be no crashes but warning in the Console.
1. **Page 5 - Anti pattern: Call [`toContextHook`] inside a React component**: The context-hook will behave like a normal hook and has warning in the Console.
1. **Page 6 - Rerendering behavior**: Only `Element1` and `Element2` will be rerendered when `useCounterContext` is updated. Whereas when `useToggleContext` is updated, `Page6`, `Element1` and `Element3` will be rerendered, not `Element2` - because `Element2` is wrapped inside `React.memo`.
1. ...

## 👍 Installation

npm:

```sh
npm install to-context-hook
```

yarn:

```sh
yarn add to-context-hook
```

## 🕹 Usage

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

### 2. Use [`toContextHook`] to turn any custom hook into a context-hook

```jsx
import { toContextHook } from 'to-context-hook';

// Create a normal custom hook as usual
function useCounter() {
  const [count, setCount] = useState(0);
  const increment = () => setCount((prevCount) => prevCount + 1);
  return { count, increment };
}

// Turn the custom hook into a context-hook (aka attach the context to the hook)
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

The usage above works for 100% of the time. However like the normal React Context, you might want to create multiple contexts, some to wrap only a portion of your application in the component tree. In that case, you can use [`contextName`] and can refer to [demo - Page 2][demo].

## 📌 API

There are 3 public APIs: [`toContextHook`], [`ContextHookProvider`], and [`withContextHook`] _- and usually the last two you only need to touch once for lifetime_.

### 1. `toContextHook(hook, contextName?)`

```jsx
import { toContextHook } from 'to-context-hook';

// a normal custom hook
const useCounter = () => {};

// turn the custom hook into a context-hook
const useCounterContext = toContextHook(useCounter);
```

#### `hook: () => TReturn`

The hook to turn into a context-hook, **this can only be a non-parameterized function**. For hooks with parameters usage, you need to convert the parameterized one to non-parameterd one, can refer to [demo - Page 3][demo].

#### `contextName?: string`

If you want all of your hooks to behave like they are under one global context (like Redux store), you don't need to care about `contextName`, move on.

However, if you want some of your contexts to be around a specific portion lower than the global level in component tree, you can use `contextName`. You then need to wrap another `ContextHookProvider`/`withContextHook` around that component tree level with the corresponding `contextName` used in [`toContextHook`]. Can refer to [demo - Page 2][demo].

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

However if you want to create a custom context level in your component tree, can use `contextName`, may refer to [demo - Page2][demo].

- Page level Provider (with `contextName`)

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

## 🤔 FAQ

#### 1. Is this a "state management" library?

No, according to [this blog](https://blog.isquaredsoftware.com/2021/01/context-redux-differences/). However [you might not need a state management library](https://medium.com/@dan_abramov/you-might-not-need-redux-be46360cf367) but simply a state sharing one instead, in which this library is the best offer.

#### 2. Compare to [Redux](https://github.com/reduxjs/redux)

Redux is [a "state management library" following the Flux architecture](https://blog.isquaredsoftware.com/2017/05/idiomatic-redux-tao-of-redux-part-1/#redux-was-built-as-a-flux-architecture-implementation), which was meant to make your state changes more predictable. It also offers a rich set of DevTools to track the state changes, helping debug your application more conveniently.

This library `toContextHook` on the other hand is simply a "state sharing" library, it helps you to write React state progressively, without changing too much when switching from a local state to global state. It's simply normal React code, no extra design pattern nor architecture you need to learn, and no boilerplate.

→ If all you need is to avoid "prop-drilling problem", Redux is overkill.

#### 3. Compare to [use-between](https://github.com/betula/use-between)

`use-between` is also a state sharing library, it has the best API ever to do so. However [its underlying implementation is heavily relying on React's internal code](https://github.com/betula/use-between/blob/master/src/lib/react-shared-internals.ts#L13), and the behavior of the hooks are reinvented, which makes it not reliable because it can be mismatched with the official React hooks' behavior.

`toContextHook` learns that "the best API" from use-between, but replaced with a more reliable underlying implementation by using React Context.

#### 4. Compare to [constate](https://github.com/diegohaz/constate)

`constate` is also utilizing React Context to turn a normal hook into a context-hook. However its API is slightly (yet significantly at the same time) different from `toContextHook`.

- `constate` returns a Provider every time you call it, making you hesitate to write small hooks even though you know small hooks are more readable. Because the more hooks you write, the more Providers you need to wrap. Whereas with `toContextHook`, Providers are combined automatically under the hood for you, so you write what is best readable for you.
- `constate` doesn't support [HOC syntax][`withcontexthook`] out of the box, which is annoying oftentimes.
- `constate` supports [`selectors`](https://github.com/diegohaz/constate#selectors), which is the crutch for not being able to conveniently write small hooks.
- `constate` supports hooks-with-parameters directly, which making the behavior of the hook itself and the translated context-hook different. `toContextHook` on the other hand, force you to delibrately convert the parameterized-hook to non-parameterized hook, making the hooks' behavior consistent, at the same time more readable. See [demo - Page 3][demo].

#### 5. Summary of usage

- Wrap your App with [`ContextHookProvider`]
- Every time you want to turn a local state into global state, wrap that piece of logic with [`toContextHook`]
- _Advanced usage:_ To make your Context behave like it's under a portion of the component tree (e.g. at page level instead of whole app level), use [`contextName`]

#### 6. Does this library cause significant **performance issue**, because it seems everything is under a global context, whenever there is a state update, the whole app will get rerendered?

No, the truth is the opposite. Under the hood, this library creates a context for each and every context-hook. So there will be multiple mini-contexts instead of one big giant context, this library simply combines them for you. Therefore, by having multiple small contexts, this library will maximally mitigate unnecessary rerender for you. Only those components use (subscribe to) a particular context-hook will get rerendered when that context-hook gets updated. See [demo - Page 6][demo].

#### 7. What is the purpose of [`contextName`] and page level context? Is it to increase performance?

As I have answered in question 6, only those subscribe to a particular context-hook will get rerendered when that context-hook is updated, so don't worry about performance.

However, there is a **difference in behavior** between page level context and global context. For page level context, when your page gets unmounted (e.g. by routing to another page), the states will be lost and reset. For global context, in that case the states will be kept still.

→ Choose based on the behavior that suits you, not really performance. Oftentimes global context is what you want (and also easier to write/less work to do).

## 🙏 Credit

This library is heavily inspired by [use-between](https://github.com/betula/use-between) and [constate](https://github.com/diegohaz/constate), many thanks!

## 📝 License

[MIT](https://github.com/loia5tqd001/to-context-hook/blob/main/LICENSE)

[`tocontexthook`]: #1-tocontexthookhook-contextname
[`contexthookprovider`]: #2-contextHookprovider-contextname-
[`withcontexthook`]: #3-withcontexthookcomponent-contextname
[`contextname`]: #contextname-string
[demo]: #-demo-and-behaviors
[faq.1]: #1-is-this-a-state-management-library
[faq.2]: #2-compare-to-redux
[faq.3]: #3-compare-to-use-between
[faq.4]: #4-compare-to-constate
[faq.5]: #5-summary-of-usage
[faq.6]: #6-does-this-library-cause-significant-performance-issue-because-it-seems-everything-is-under-a-global-context-whenever-there-is-a-state-update-the-whole-app-will-get-rerendered
[faq.7]: #7-what-is-the-purpose-of-contextname-and-page-level-context-is-it-to-increase-performance
