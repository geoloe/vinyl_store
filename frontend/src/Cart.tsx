import { useCart } from "react-use-cart";
import { Divider, Button, SimpleGrid, Alert, Title, Accordion, Image, Text} from "@mantine/core";
import { IconTrash, IconSquareX, IconAlertCircle} from '@tabler/icons-react';
import { Link } from "react-router-dom";


export const Cart = () => {
    
  const {
    isEmpty,
    totalUniqueItems,
    items,
    updateItemQuantity,
    removeItem,
    emptyCart,
  } = useCart();


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
                    Your Shopping Cart is Empty! Maybe you would like to browse <Link to="/"> here</Link>?
                </Alert>
                ) : (
                    <>
                    <Title order={1}>Cart ({totalUniqueItems})</Title><br></br>
                    <Button leftIcon={<IconTrash size="1rem" />} onClick={emptyCart}>Empty Cart</Button>
                    <br></br>
                      <Accordion variant="contained" defaultValue="customization">
                      {itemRows}
                      </Accordion>
                      <Divider my="sm" variant="dotted" />
                      {total != 0 && <Title order={3} align="right">Your Sub-total is: {total} EUR</Title>}
                      <Divider my="sm" variant="dotted" />
                      {total != 0 && <Title align="right">Your total is: {total + 10} EUR</Title>}
                      <Button>Pay</Button>
                    </>
                )}
            </div>
            <div></div>

          </SimpleGrid>
      </>
    );
};