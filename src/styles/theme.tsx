import React, { ReactNode, useState } from 'react';
import { LayoutChangeEvent, View } from 'react-native';
import styled, { ThemeProvider } from 'styled-components/native';

export const theme = {
  colors: {
    primary: '#266AAB',
    darkPrimary: '#1C5388',
    accent: '#E2213E',
    dark: '#081E2A',
    gray: '#767676',
    darkGray: '#343434',
    light: '#07A0C3',
    pink: '#BD2D87',
  },
  window: {
    width: 1000,
    height: 1000,
  },
};

export type Theme = typeof theme;

const Window = styled(View)`
  position: absolute;

  width: 100%;
  height: 100%;
  background: red;
  elevation: 0;
  z-index: 10;
`;

export type ThemesProviderProps = {
  children: ReactNode;
};

export const ThemesProvider = ({ children }: ThemesProviderProps) => {
  const [window, setWindow] = useState({
    width: 1000,
    height: 1000,
  });

  const onLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    setWindow({
      width: nativeEvent.layout.width,
      height: nativeEvent.layout.height,
    });
  };

  return (
    <ThemeProvider theme={{ ...theme, window }}>
      <Window onLayout={onLayout} />
      {children}
    </ThemeProvider>
  );
};
