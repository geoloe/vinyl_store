import { ThemeProvider } from './ThemeProvider';
import { HeaderSimple } from './Header'
import { FooterSocial } from './Footer';
import { Outlet } from 'react-router-dom';
import { CartProvider } from 'react-use-cart';
import { Notifications } from '@mantine/notifications';
import './css/margins.css'




export const Layout = () => {
    const options = [
        { link: "What's new?" , label: "What's new?" },
        { link: 'Contact', label: 'Contact' },
        { link: 'Jobs', label: 'Jobs' }
       ]
    
      const tabs: string[] = ["About"]
    
       const user = { name: 'Georg Löffler', 
       image: 'https://avatars.steamstatic.com/a55b513e39410f2ac350958b127fcedbba830e5a_full.jpg' }
    
return (
    <>
    <div id='main-wrapper'>
    <ThemeProvider>
            <CartProvider>
            <Notifications/>
            <HeaderSimple links={options} user={user} tabs={tabs}/>

            <Outlet/>
            
            <footer>
            <FooterSocial/>
            </footer>          

            </CartProvider>
        </ThemeProvider>
    </div>
    </>
);};
