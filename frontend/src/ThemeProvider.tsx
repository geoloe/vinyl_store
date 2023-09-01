import { MantineProvider } from '@mantine/core';
import { useState } from 'react';
import { ColorSchemeProvider, ColorScheme } from '@mantine/core';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  //Declare Context for dark and light mode for the app
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const toggleColorScheme = (value?: ColorScheme) =>
  setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider withGlobalStyles withNormalizeCSS theme={{colorScheme}}>
        {children}
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
