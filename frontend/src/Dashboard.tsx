import { Title, SimpleGrid, Center, Text} from "@mantine/core";
import { StatsGroup } from "./Components/Graphs";
import { Listing, MyWantlist, myItem } from "./App";
import { Prism } from '@mantine/prism';


export const Dashboard = () => {

  let wl: MyWantlist = JSON.parse(localStorage.getItem("wantlist") || "[]");
  console.log("wantlist", wl)

  let user: string | null = localStorage.getItem("user")!;

  console.log(user)

  let items: myItem[] = wl[user];
  let data = [];

  for (var i = 0; i < items.length; ++i) {
      data.push({ title : items[i].name , stats : items[i].image, description : items[i].status });
      
  }

  return (
    <>
    <SimpleGrid 
      cols={1}
        spacing="lg"
        breakpoints={[
      { maxWidth: 'md', cols: 3, spacing: 'md' },
      { maxWidth: 'sm', cols: 2, spacing: 'sm' },
      { maxWidth: 'xs', cols: 1, spacing: 'sm' },
    ]}
    >
      <div></div>
      <div>
        <Center>
        <Title order={3}>It's nice to have you back {user}!</Title>
        </Center>
        <StatsGroup data={data}></StatsGroup>
      </div>
      <div></div>

    </SimpleGrid>

    </>
  );
}