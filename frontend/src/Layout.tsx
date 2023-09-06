import { ThemeProvider } from './ThemeProvider';
import { HeaderSimple } from './Components/Header'
import { FooterCentered } from './Components/Footer';
import { Outlet } from 'react-router-dom';
import { CartProvider } from 'react-use-cart';
import { Notifications } from '@mantine/notifications';
import './css/margins.css'
import { useCart } from "react-use-cart";
import * as React from 'react';


export function handleItemsToBuy(){
    // Grey out items after adding them in the shopping cart
    const { items } = useCart();
    const { inCart } = useCart();
    let ids:string[] = [];
    ids = items.map(e => (
         e.id
     ));
      console.log(ids)
    
    for (let i: number = 0; i < ids.length; i++){
      let inputs = document.getElementsByName(ids[i]);
      inputs.forEach(input =>{
        input?.setAttribute('disabled', '');
        console.log(inputs)
        //if shopping cart doesn't contain them anymore, then activate the add to cart button
        if(!inCart(ids[i])){
            input?.removeAttribute('disabled');
          }
        })
  }
}


export const Layout = () => {
    const options = [
        { link: "What's new?" , label: "What's new?" },
        { link: 'Contact', label: 'Contact' },
        { link: 'Jobs', label: 'Jobs' }
       ]
    
      const tabs: string[] = ["About"]

      //set remove and add to wantlist toggle
      const [active, setActive] = React.useState(false);

      const user = { name: localStorage.getItem('user'), 
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
                  <FooterCentered links={options}/>
                  </footer>          

                  </CartProvider>
        </ThemeProvider>

    </div>
    </>
);};
