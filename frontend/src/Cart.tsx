import { useCart } from "react-use-cart";
import { Divider, Button, SimpleGrid, Alert, Title, Accordion, Image, Text, Badge, Box} from "@mantine/core";
import { IconTrash, IconSquareX, IconAlertCircle} from '@tabler/icons-react';
import { Link } from "react-router-dom";
import * as React from 'react';

import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer
} from "@paypal/react-paypal-js";

type paypalStyle = {
  color?: "blue" | "white" | "gold" | "silver" | "black" | undefined;
  height?: number | undefined;
  label?: "paypal" | "checkout" | "buynow" | "pay" | "installment" | "subscribe" | "donate" | undefined;
  layout?: "vertical" | undefined;
  shape?: "rect" | undefined;
  tagline?: boolean | undefined;
} | undefined

const style: paypalStyle = {"color":"blue"};


////// PAY PAL Component ////////
// Custom component to wrap the PayPalButtons and show loading spinner
const ButtonWrapper = () => {

  return (
      <>
          <PayPalButtons
              style={style}
              disabled={false}
              forceReRender={[style]}
              fundingSource={undefined}
          />
      </>
  );
}

////// PAY PAL Component ////////



export const Cart = () => {


      // We need ref in this, because we are dealing
    // with JS setInterval to keep track of it and
    // stop it when needed
    const Ref = React.useRef(0);
 
    // The state for our timer
    const [timer, setTimer] = React.useState('00:15:00');
 
    const getTimeRemaining = (e: any) => {
        const total: number = Date.parse(e) - Date.parse(new Date().toString());
 
        const seconds = Math.floor((total / 1000) % 60);
        const minutes = Math.floor((total / 1000 / 60) % 60);
        const hours = Math.floor((total / 1000 / 60 / 60) % 24);
        return {
            total, hours, minutes, seconds
        };
    }
 
    const startTimer = (e: any) => {
        let { total, hours, minutes, seconds }
                    = getTimeRemaining(e);
        if (total >= 0) {
 
            // update the timer
            // check if less than 10 then we need to
            // add '0' at the beginning of the variable
            setTimer(
                (hours > 9 ? hours : '0' + hours) + ':' +
                (minutes > 9 ? minutes : '0' + minutes) + ':'
                + (seconds > 9 ? seconds : '0' + seconds)
            )
        }
    }
 
    const clearTimer = (e: any) => {
 
        // If you adjust it you should also need to
        // adjust the Endtime formula we are about
        // to code next   
        setTimer('00:02:00');
 
        // If you try to remove this line the
        // updating of timer Variable will be
        // after 1000ms or 1sec
        if (Ref.current) clearInterval(Ref.current);
        const id = setInterval(() => {
            startTimer(e);
        }, 1000)
        Ref.current = id;
    }
 
    const getDeadTime = () => {
        let deadline = new Date();
 
        // This is where you need to adjust if
        // you entend to add more time
        deadline.setSeconds(deadline.getSeconds() + 120);
        return deadline;
    }

  const {
    isEmpty,
    totalUniqueItems,
    items,
    updateItemQuantity,
    removeItem,
    emptyCart,
  } = useCart();


  React.useEffect(() => {
    clearTimer(getDeadTime());
  }, []);


  const itemRows = items.map((element) => (
  <Accordion.Item value={element.name}>
    <Accordion.Control><Link to={`/details/${element.id}/${element.price}`}> Details </Link><Image maw={150} mx="auto" radius="md" src={element.image} alt={element.name} /><Text fz="xl">{element.name}</Text></Accordion.Control>
    <Accordion.Panel>Artist: {element.artist} <br></br> Quantity: {element.quantity} <br></br>Price: {element.price} EUR <br></br>
    <Button leftIcon={<IconSquareX size="1rem" />} onClick={() => removeItem(element.id)}>Remove item</Button></Accordion.Panel>
  </Accordion.Item>
  ));

    let total:number = 0;
    if (!isEmpty){
    total = items.map(a => a.price).reduce(function(a, b)
    {
      console.log(a);
      return a + b;
    });
    }

    if(timer === '00:00:00'){
      emptyCart();  
    }
    return (
    <>
        <SimpleGrid
            cols={3}
            spacing="lg"
            breakpoints={[
              { maxWidth: '62rem', cols: 3, spacing: 'md' },
              { maxWidth: '48rem', cols: 2, spacing: 'sm' },
              { maxWidth: '36rem', cols: 1, spacing: 'sm' },
            ]}
          >
            <div></div>
            <div>
            {isEmpty ? (
                <Alert icon={<IconAlertCircle size="1rem" />} title="Oh no!">
                    Your shopping cart is empty! Maybe you would like to browse <Link to="/"> here</Link>?
                </Alert>
                ) : (
                    <>
                    <div>
                    <Title order={1}>Cart ({totalUniqueItems})</Title><br></br>
                      </div>
                      <div style={{display: 'flex', justifyContent:'start'}}>
                      <Button leftIcon={<IconTrash size="1rem" />} onClick={emptyCart}>Empty Cart</Button>              
                      </div>
                      <div style={{display: 'flex', justifyContent:'flex-end'}}>
                      <Badge size="xl" >{timer}</Badge>
                    </div>
                      <Accordion variant="contained" defaultValue="customization">
                      {itemRows}
                      </Accordion>
                      <Divider my="sm" variant="dotted" />
                      {total != 0 && <Title order={3} align="right">Your Sub-total is: {total} EUR</Title>}
                      <Divider my="sm" variant="dotted" />
                      {total != 0 && <Title align="right">Your total is: {total + 10} EUR</Title>}
                      <Box maw={300} mx="auto">
                      <PayPalScriptProvider options={{ clientId: "test", currency: "EUR" }}>
                        <ButtonWrapper />
                      </PayPalScriptProvider>
                      </Box>
                    </>
                )}
            </div>
            <div></div>

          </SimpleGrid>
      </>
    );
};