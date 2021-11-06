import React from 'react';

type TProviderProps = React.PropsWithChildren<{ contextName?: TContextName }>;
type TProvider = React.ComponentType<TProviderProps>;
type TContextName = string;
type TProvidersDict = {
  [contextName: TContextName]: TProvider[];
};

const NO_PROVIDER = {} as never;

const GLOBAL_CONTEXT_NAME = '__GLOBAL__';

const providersDict: TProvidersDict = {};

let reactMounted = false;

const warning = (message: string) =>
  // tslint:disable-next-line:no-console
  console.log(`%c [to-context-hook]: ${message}`, 'font-weight: 500; color: red; border: yellow; background: #fcfad9;');

const getProviderKey = (key: TContextName | undefined): TContextName => (key === undefined ? GLOBAL_CONTEXT_NAME : key);

const combineProviders = (providers: TProvider[]) =>
  providers.reduce((Combined, Provider) => ({ children }: TProviderProps) => {
    return (
      <Combined>
        <Provider>{children}</Provider>
      </Combined>
    );
  });

export function toContextHook<TReturn>(
  hook: () => TReturn, // only accept non-parameterized hook
  contextName?: TContextName,
): () => TReturn {
  const providerKey = getProviderKey(contextName);
  const functionNameQuote = hook.name ? `"${hook.name}"` : 'Anonymous';

  if (reactMounted) {
    warning(
      `You are trying to call toContextHook for "${hook.name}" ${
        contextName ? `with context name of "${providerKey}" ` : ''
      }incorrectly, you should call it statically instead of inside a React component. Your ${functionNameQuote} function thus becomes a normal hook.`,
    );
    return hook;
  }

  if (providersDict[providerKey] === undefined) providersDict[providerKey] = [];

  const Context = React.createContext<TReturn>(NO_PROVIDER);
  const provider: TProvider = ({ children }) => {
    return <Context.Provider value={hook()}>{children}</Context.Provider>;
  };
  provider.displayName = `ContextHookProvider.${providerKey}.${hook.name || 'Anonymous'}`;

  providersDict[providerKey].push(provider);

  return () => {
    const contextValue = React.useContext(Context);
    if (contextValue === NO_PROVIDER) {
      warning(
        contextName
          ? `You forgot to use either ContextHookProvider or withContextHook to wrap the provider "${providerKey}" around its corresponding consumers. Your ${functionNameQuote} function thus becomes a normal hook.`
          : `You forgot to use either ContextHookProvider or withContextHook to wrap the provider around your application. Your ${functionNameQuote} function thus becomes a normal hook.`,
      );
      return hook();
    }
    return contextValue;
  };
}

export function ContextHookProvider(props: TProviderProps) {
  reactMounted = true;
  const providerKey = getProviderKey(props.contextName);

  if (providersDict[providerKey] === undefined) {
    warning(`Provider "${providerKey}" is not consumed anywhere! Make sure you are not running into a typo.`);
    return props.children as JSX.Element;
  }

  const ContextProvider = combineProviders(providersDict[providerKey]);

  return <ContextProvider>{props.children}</ContextProvider>;
}

export function withContextHook<TProps>(Component: React.ComponentType<unknown>, contextName?: TContextName) {
  return (props: TProps) => {
    return (
      <ContextHookProvider contextName={contextName}>
        <Component {...props} />
      </ContextHookProvider>
    );
  };
}
