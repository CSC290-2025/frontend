import React, {
  type FunctionComponent,
  type PropsWithChildren,
  type ReactNode,
  useEffect,
} from 'react';
import {
  APILoadingStatus,
  type APIProviderProps,
  useApiLoadingStatus,
  APIProvider,
} from '@vis.gl/react-google-maps';

const statusMap = {
  [APILoadingStatus.LOADING]: 'LOADING',
  [APILoadingStatus.LOADED]: 'SUCCESS',
  [APILoadingStatus.FAILED]: 'FAILURE',
} as const;

type WrapperProps = PropsWithChildren<
  {
    apiKey: string;
    callback?: (status: string) => void;
    render?: (status: string) => ReactNode;
  } & APIProviderProps
>;

export const Wrapper: FunctionComponent<WrapperProps> = ({
  apiKey,
  children,
  render,
  callback,
  ...apiProps
}) => {
  return (
    <APIProvider apiKey={apiKey} {...apiProps}>
      <InnerWrapper render={render}>{children}</InnerWrapper>
    </APIProvider>
  );
};

const InnerWrapper = ({
  callback,
  render,
  children,
}: PropsWithChildren<Omit<WrapperProps, 'apiKey'>>) => {
  const status = useApiLoadingStatus();
  const mappedStatus = statusMap[status as keyof typeof statusMap] ?? 'LOADING';

  useEffect(() => {
    if (callback) callback(mappedStatus);
  }, [callback, mappedStatus]);

  if (status === APILoadingStatus.LOADED) return children;
  if (render) return render(mappedStatus);

  return <></>;
};
