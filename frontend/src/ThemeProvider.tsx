import { MantineProvider } from '@mantine/core';
import { useState } from 'react';
import { ColorSchemeProvider, ColorScheme } from '@mantine/core';
import { SpotlightProvider } from '@mantine/spotlight';
import type { SpotlightAction } from '@mantine/spotlight';
import { IconHome, IconDashboard, IconFileText, IconSearch, IconLogin} from '@tabler/icons-react';
import { useNavigate } from "react-router-dom";



interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {

  const navigate = useNavigate();

  //Spotlight Actions
  const actions: SpotlightAction[] = [
    {
      title: 'Home',
      description: 'Get to home page',
      onTrigger: () => navigate('/'),
      icon: <IconHome size="1.2rem" />,
    },
    {
      title: 'Dashboard',
      description: 'Get full information about current orders, wantlist, stats and news',
      onTrigger: () => navigate('/dashboard'),
      icon: <IconDashboard size="1.2rem" />,
    },
    {
      title: 'Shopping Cart',
      description: 'Visit your shopping cart',
      onTrigger: () => navigate('/cart'),
      icon: <IconFileText size="1.2rem" />,
    },
  ];

  //Declare Context for dark and light mode for the app
  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const toggleColorScheme = (value?: ColorScheme) =>
  setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <SpotlightProvider 
          actions={actions}
          searchIcon={<IconSearch size="1.2rem" />}
          searchPlaceholder="Search..."
          shortcut="mod + shift + 1"
          nothingFoundMessage="Nothing found...">
        <MantineProvider withGlobalStyles withNormalizeCSS theme={{colorScheme, headings: { fontFamily: 'Greycliff CF, sans-serif' }}}>
          {children}
        </MantineProvider>
      </SpotlightProvider>
    </ColorSchemeProvider>
  );
}
