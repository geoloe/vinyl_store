import { Card, Image, Text, Badge, Button, Group } from '@mantine/core';
import { removeWantlistItem } from '../App';
import { Link } from 'react-router-dom';

export type CardItemProps = {
    id: number;
    name: string;
    price: number;
    count: number;
    image: string;
  }

export const CardItem: React.FC<CardItemProps> = ({id, name, price, count, image}) => {
  return (
    <>
    <Card shadow="xl" padding="lg" radius="lg" withBorder>
      <Card.Section component="a" href="https://mantine.dev/">
        <Image
          src={image}
          height={160}
          alt="Norway"
        />
      </Card.Section>

      <Group position="apart" mt="md" mb="xs">
        <Text weight={500}>{name}</Text>
        <Badge color="pink" variant="light">
          {price} EUR
        </Badge>
      </Group>

      <Text size="sm" color="dimmed">
        <Link to={`details/${id}/${price}`}>{name}</Link>
      </Text>

      <Button variant="light" color="blue" fullWidth mt="md" radius="md" onClick={() => {removeWantlistItem(id); close(); window.location.reload()}}>Remove item</Button>
    </Card>
    <br></br>
    </>
  );
}