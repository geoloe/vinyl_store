import { useState } from 'react';
import axios from 'axios';
import { CardItem } from './Card';
import { spotlight } from '@mantine/spotlight';
import { ActionIcon, Header} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconVinyl, IconLogin, IconDashboard, IconDeviceFloppy, IconHomeSearch } from '@tabler/icons-react';
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
  List,
  Image,
  Paper,
  Button,
  Transition
} from '@mantine/core';
import {
  IconLogout,
  IconHeart,
  IconStar,
  IconMessage,
  IconSettings,
  IconTrash,
  IconChevronDown,
  IconShoppingCart
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useCart } from "react-use-cart";
import { SwitchToggle } from './Toggler';
import { Drawer } from '@mantine/core';
import { MyWantlist, myItem } from '../App';
const HEADER_HEIGHT = rem(60);

const useStyles = createStyles((theme) => ({

  root: {
    position: 'relative',
    zIndex: 1,
  },
  dropdown: {
    position: 'absolute',
    top: HEADER_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 0,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0,
    borderTopWidth: 0,
    overflow: 'hidden',

    [theme.fn.largerThan('sm')]: {
      display: 'none',
    },
  },
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
  user: { name: string | null; image: string };
  tabs: string[];
  }

export function HeaderSimple({ links, user, tabs}: HeaderSimpleProps) {
  const [opened, { toggle }] = useDisclosure(false);
  const [abierto, { open, close }] = useDisclosure(false);
  const [active, setActive] = useState(links[0].link);
  const { classes, theme, cx } = useStyles();
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  
  let wl: MyWantlist = JSON.parse(localStorage.getItem("wantlist") || "[]");

  let currentUser: string | null = localStorage.getItem("user")!;
  
  let wantlistItems: myItem[] = wl[currentUser];

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
  const [errorMessage, setErrorMessage] = useState('');

  const wantlistUser = async ()  => {
    try{
      const data = {
        wantlist: wl
      }
      const result = await axios.post('http://192.168.2.216:5000/wantlist', data, { 
        })
      //Convert JSON to Vinyl and Pagination type
      const res: MyWantlist = result.data;

      console.log(res)


    } catch (error: any) { 
      if(error.response){
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
        setErrorMessage(error.response.status.toString() + ' ' + error.response.data.error.toString());
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log("No response", error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
  };
}


  const {
    isEmpty,
  } = useCart();

  return (
    <Header height={60} mb={120}>
      <Container className={classes.header}>
        <Group spacing={5} className={classes.links}>
          {items}
        </Group>
        <Transition transition="pop-top-right" duration={200} mounted={opened}>
          {(styles) => (
            <>
            <Paper id="front" className={classes.dropdown} withBorder style={styles}>
            {localStorage.getItem('user')?.length != 0 ? (
            <>
            <Button variant='light' fullWidth>
              <Group spacing={7}>
                  <Avatar src={user.image} alt={user.image} radius="xl" size={20} />
                  <Text weight={500} size="sm" sx={{ lineHeight: 1 }} mr={3}>
                    {user.name}
                  </Text>
                  <IconChevronDown size={rem(12)} stroke={1.5} />
              </Group>
            </Button>
            <Button variant='subtle' fullWidth onClick={open}>
              <Group spacing={7}>
              <IconStar size="0.9rem" color={theme.colors.yellow[6]} stroke={1.5} />
                  <Text weight={500} size="sm" sx={{ lineHeight: 1 }} mr={3}>
                    Wantlist
                  </Text>
              </Group>
            </Button>
            <Button variant='subtle' fullWidth component={Link} to={`/dashboard`}>
              <Group spacing={7}>
              <IconDashboard size="0.9rem" stroke={1.5} />
                  <Text weight={500} size="sm" sx={{ lineHeight: 1 }} mr={3}>
                    Dashboard
                  </Text>
              </Group>
            </Button>
            <Button variant='subtle' component={Link} to="/" fullWidth onClick=
            {() => 
              {notifications.show({
                title: 'Logged out!',
                message: 'You are logged out.',
              }); localStorage.setItem('user', '');localStorage.setItem('wantlist', '[]');}} 
                    >
              <Group spacing={7}>
              <IconLogout size="0.9rem" stroke={1.5} />
              <Text weight={500} size="sm" sx={{ lineHeight: 1 }} mr={3}>
                    Logout
                  </Text>
              </Group>
            </Button>
            <Button component={Link} to="/forgot" variant='subtle' color='grey' fullWidth >
              <Group spacing={7}>
              <IconSettings size="0.9rem" stroke={1.5} />
              <Text weight={500} size="sm" sx={{ lineHeight: 1 }} mr={3}>
                    Change password
                  </Text>
              </Group>
            </Button>
            <Button variant='subtle' color='red' fullWidth >
              <Group spacing={7}>
              <IconTrash size="0.9rem" stroke={1.5} />
              <Text weight={500} size="sm" sx={{ lineHeight: 1 }} mr={3}>
                    Delete account
                  </Text>
              </Group>
            </Button>
            <Button variant='light' radius={0} fullWidth>
                  {items}
            </Button>
            </>
            ) : (
              <Button variant='light' radius={0} fullWidth>
                  {items}
              </Button>
            )}
            </Paper>
            </>
          )}
        </Transition>
        <Burger opened={opened} onClick={toggle} className={classes.burger} size="sm" />
        {localStorage.getItem('user')?.length != 0 &&
            <ActionIcon size="xl" radius="xl" onClick={spotlight.open}>
            <IconHomeSearch size="2.125rem" />
            </ActionIcon>
          }
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
            



    {localStorage.getItem('user')?.length != 0 ? (
      <>
      <Drawer opened={abierto} onClose={close} title={`Wantlist for ${currentUser}`}>
      
      <List>
        {wantlistItems !== undefined ? ( wantlistItems.length === 0 ? (
                  <>
                  <List.Item>No items in wantlist</List.Item>
                  </>
        ):(
          <>
          <Button onClick={() => 
                            {notifications.show({
                              title: 'Hurray!',
                              message: 'Your wantlist has been saved.',
                            }); wantlistUser();}} leftIcon={<IconDeviceFloppy size="1rem" />}>Save wantlist</Button>
          <br></br><br></br>
          {wantlistItems.map((item) => (
            <CardItem id={item.id} name={item.name} price={item.price} count={item.count} image={item.image} status={item.status}/>
          ))}
          </>
        ))      


        : (

          <>
          <List.Item>No items in wantlist</List.Item>
          </>

        )}

      </List>
      </Drawer>
      
          <Menu
            width={260}
            position="bottom-end"
            transitionProps={{ transition: 'pop-top-right' }}
            onClose={() => setUserMenuOpened(false)}
            onOpen={() => setUserMenuOpened(true)}
            withinPortal        
            
          >
            <Menu.Target >
              <UnstyledButton
                className={cx(classes.user, { [classes.userActive]: userMenuOpened })}
              >
                <Group spacing={7}>
                  <Avatar src={user.image} alt={user.image} radius="xl" size={20} />
                  <Text weight={500} size="sm" sx={{ lineHeight: 1 }} mr={3}>
                    {user.name}
                  </Text>
                  <IconChevronDown size={rem(12)} stroke={1.5} />
                </Group>
              </UnstyledButton>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                icon={<IconDashboard size="0.9rem" color={theme.colors.red[6]} stroke={1.5} />} component={Link} to={`/dashboard`}
              >
                Dashboard
              </Menu.Item>
              <Menu.Item
                icon={<IconStar size="0.9rem" color={theme.colors.yellow[6]} stroke={1.5} />} onClick={open}
              >
               Wantlist
              </Menu.Item>
              <Menu.Item
                icon={<IconMessage size="0.9rem" color={theme.colors.blue[6]} stroke={1.5} />}
              >
                Your comments
              </Menu.Item>

              <Menu.Label>Settings</Menu.Label>
              <Menu.Item icon={<IconSettings size="0.9rem" stroke={1.5} />} component={Link} to="/forgot">
                Change Password
              </Menu.Item>
              <Menu.Item icon={<IconLogout size="0.9rem" stroke={1.5} />} component={Link} to="/" onClick=
              {() => 
                {notifications.show({
                  title: 'Logged out!',
                  message: 'You are logged out.',
                }); localStorage.setItem('user', '');localStorage.setItem('wantlist', '[]');}} 
                      >
                Logout</Menu.Item>

              <Menu.Divider />

              <Menu.Label>Danger zone</Menu.Label>
              <Menu.Item color="red" icon={<IconTrash size="0.9rem" stroke={1.5} />}>
                Delete account
              </Menu.Item>
            </Menu.Dropdown>
          </Menu> 
          </>
        ) : (
          <Link to={'login'}>
          <ActionIcon size="xl" radius="xl">
            <IconLogin size="2.125rem" />
          </ActionIcon>
          </Link>
        )
        }
        <SwitchToggle></SwitchToggle>

      </Container>
    </Header>
  );
}

