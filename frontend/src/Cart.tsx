import { useCart } from "react-use-cart";
import { Table, Button, SimpleGrid, Alert, Title } from "@mantine/core";
import { IconTrendingDown, IconX, IconAlertCircle} from '@tabler/icons-react';
import { Link } from "react-router-dom";

export const Cart = () => {
    
  const {
    isEmpty,
    totalUniqueItems,
    items,
    updateItemQuantity,
    removeItem,
  } = useCart();

  const rows = items.map((element) => (
    <tr key={element.id}>
      <td><img src={element.image} height={150} width={150}></img></td>
      <td>{element.name}</td>
      <td>{element.quantity}</td>
      <td>{element.price} EUR</td>
      <td><Button leftIcon={<IconTrendingDown size="1rem" />} onClick={() => updateItemQuantity(element.id, 0)}></Button>
        </td>
      <td><Button leftIcon={<IconX size="1rem" />} onClick={() => removeItem(element.id)}></Button>
        </td>
    </tr>
  ));

    let total:number = 0;
    if (!isEmpty){
    total = items.map(a => a.price).reduce(function(a, b)
    {
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
                    <Title order={1}>Cart ({totalUniqueItems})</Title>
                        <Table striped highlightOnHover withBorder withColumnBorders>
                        <thead>
                            <tr>
                            <th>Album</th>
                            <th>Name</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Decrease</th>
                            <th>Empty items</th>
                            </tr>
                        </thead>
                        <tbody>{rows}</tbody>
                        </Table>
                        {total != 0 && <Title align="right">Your total is: {total} EUR</Title>}
                        <Button>Pay</Button>
                    </>
                )}
            </div>
            <div></div>
          </SimpleGrid>
      </>
    );
};