import { useState } from 'react';
import { ActionIcon, Header} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconVinyl } from '@tabler/icons-react';
import {
  createStyles,
  Container,
  Avatar,
  UnstyledButton,
  Group,
  Text,
  Menu,
  Indicator,
  Burger,
  rem,
} from '@mantine/core';
import {
  IconLogout,
  IconHeart,
  IconStar,
  IconMessage,
  IconSettings,
  IconPlayerPause,
  IconTrash,
  IconSwitchHorizontal,
  IconChevronDown,
  IconShoppingCart
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useCart } from "react-use-cart";
import { SwitchToggle } from './Toggler';

const useStyles = createStyles((theme) => ({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  search: {
    [theme.fn.smallerThan('xs')]: {
      display: 'none',
    },
  },
  user: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.radius.sm,
    transition: 'background-color 100ms ease',

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
    },

    [theme.fn.smallerThan('xs')]: {
      display: 'none',
    },
  },
  userActive: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.white,
  },

  links: {
    [theme.fn.smallerThan('xs')]: {
      display: 'none',
    },
  },

  burger: {
    [theme.fn.largerThan('xs')]: {
      display: 'none',
    },
  },

  link: {
    display: 'block',
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color: theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    },
  },

  linkActive: {
    '&, &:hover': {
      backgroundColor: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).background,
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor }).color,
    },
  },
}));

interface HeaderSimpleProps {
  links: { link: string; label: string }[];
  user: { name: string; image: string };
  tabs: string[];
  }

export function HeaderSimple({ links, user, tabs}: HeaderSimpleProps) {
  const [opened, { toggle }] = useDisclosure(false);
  const [active, setActive] = useState(links[0].link);
  const { classes, theme, cx } = useStyles();
  const [userMenuOpened, setUserMenuOpened] = useState(false);

  const items = links.map((link) => (
    <a
      key={link.label}
      href={link.link}
      className={cx(classes.link, { [classes.linkActive]: active === link.link })}
      onClick={(event) => {
        event.preventDefault();
        setActive(link.link);
      }}
    >
      {link.label}
    </a>
  ));

  const {
    isEmpty,
  } = useCart();

  return (
    <Header height={60} mb={120}>
      <Container className={classes.header}>
        <Group spacing={5} className={classes.links}>
          {items}
        </Group>
            <Link to='/'>
            <ActionIcon size="xl" radius="xl">
                  <IconVinyl size="2.125rem" />
                </ActionIcon>
            </Link>
            <Link to='cart'>
              {isEmpty ? (
              <Indicator inline disabled size={12}>
                <ActionIcon size="xl" radius="xl">
                  <IconShoppingCart size="2.125rem" />
                </ActionIcon>
              </Indicator>
              ):(
              <Indicator inline position="middle-end" processing size={12}>
                <ActionIcon size="xl" radius="xl">
                  <IconShoppingCart size="2.125rem" />
                </ActionIcon>
              </Indicator>
              )}
            </Link>
            <SwitchToggle></SwitchToggle>
        <Burger opened={opened} onClick={toggle} className={classes.burger} size="sm" />

        <Menu
            width={260}
            position="bottom-end"
            transitionProps={{ transition: 'pop-top-right' }}
            onClose={() => setUserMenuOpened(false)}
            onOpen={() => setUserMenuOpened(true)}
            withinPortal
          >
            <Menu.Target>
              <UnstyledButton
                className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
              >
                <Group spacing={7}>
                  <Avatar src={user.image} alt={user.name} radius="xl" size={20} />
                  <Text weight={500} size="sm" sx={{ lineHeight: 1 }} mr={3}>
                    {user.name}
                  </Text>
                  <IconChevronDown size={rem(12)} stroke={1.5} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                icon={<IconHeart size="0.9rem" color={theme.colors.red[6]} stroke={1.5} />}
              >
                Favorite Vinyls
              </Menu.Item>
              <Menu.Item
                icon={<IconStar size="0.9rem" color={theme.colors.yellow[6]} stroke={1.5} />}
              >
                Wantlist
              </Menu.Item>
              <Menu.Item
                icon={<IconMessage size="0.9rem" color={theme.colors.blue[6]} stroke={1.5} />}
              >
                Your comments
              </Menu.Item>

              <Menu.Label>Settings</Menu.Label>
              <Menu.Item icon={<IconSettings size="0.9rem" stroke={1.5} />}>
                Account settings
              </Menu.Item>
              <Menu.Item icon={<IconLogout size="0.9rem" stroke={1.5} />}>Logout</Menu.Item>

              <Menu.Divider />

              <Menu.Label>Danger zone</Menu.Label>
              <Menu.Item icon={<IconPlayerPause size="0.9rem" stroke={1.5} />}>
                Pause subscription
              </Menu.Item>
              <Menu.Item color="red" icon={<IconTrash size="0.9rem" stroke={1.5} />}>
                Delete account
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
      </Container>
    </Header>
  );
}

