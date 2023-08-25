import { ThemeProvider } from './ThemeProvider';
import { HeaderSimple } from './Header'
import { FooterSocial } from './Footer';
import { Affix, Button, Transition,  Notification, rem } from '@mantine/core';
import { useWindowScroll } from '@mantine/hooks';
import { IconArrowUp} from '@tabler/icons-react';
import * as React from 'react';
import { Outlet } from 'react-router-dom';




export const Layout = ({
}): JSX.Element => {
    const options = [
        { link: "What's new?" , label: "What's new?" },
        { link: 'Contact', label: 'Contact' },
        { link: 'Jobs', label: 'Jobs' },
       ]
    
      const tabs: string[] = ["About"]
    
       const user = { name: 'Georg Löffler', 
       image: 'https://avatars.steamstatic.com/a55b513e39410f2ac350958b127fcedbba830e5a_full.jpg' }

    const [scroll, scrollTo] = useWindowScroll();
    const [notification, setNotification] = React.useState(
        false,
      )
    const handleNotification = (
        event: React.MouseEventHandler<HTMLButtonElement>
            ) => {
        if(notification){
          console.log("clicked via Notification");
          setNotification(false);
        }
        else{
          console.log("clicked via Buy Button");
          setNotification(true);
        }
    
      }
return (
    <>
        <ThemeProvider>
        <HeaderSimple links={options} user={user} tabs={tabs}></HeaderSimple>

        <Outlet></Outlet>

        <FooterSocial></FooterSocial>
        <Affix position={{ bottom: rem(20), right: rem(20) }}>
            <Transition transition="slide-up" mounted={scroll.y > 0}>
            {(transitionStyles) => (
                <Button
                leftIcon={<IconArrowUp size="1rem" />}
                style={transitionStyles}
                variant="gradient" gradient={{ from: 'teal', to: 'blue', deg: 60 }}
                onClick={() => scrollTo({ y: 0 })}
                >
                Scroll to top
                </Button>
            )}
            </Transition>
        </Affix>
        {notification ? (
        <Affix position={{ bottom: rem(20), left: rem(20) }} id='notification'>
        <Notification title="Bummer :(" onClose={handleNotification}>
            Buying is currently unavailable. You can buy them also on <a href="https://www.discogs.com/user/ssrl4000">Discogs</a>! <Button size='xs' compact onClick={handleNotification}>Close Me!</Button>
        </Notification>
        </Affix>
        ) : (
            <Affix position={{ bottom: rem(20), left: rem(20) }} id='notification' hidden>
            <Notification title="Default notification" >
            This is default notification with title and body
            </Notification>
            </Affix>
        )}
        </ThemeProvider>
    </>
);};
