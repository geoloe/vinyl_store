import { useParams } from "react-router-dom";
import * as React from 'react';
import axios from 'axios';
import { List, ThemeIcon, Tooltip, Center, Loader, SimpleGrid, Title, Divider, Container, Flex, Button, Transition, Affix, rem} from '@mantine/core';
import { Carousel } from "@mantine/carousel";
import { StatsRing } from "./Components/Stats";
import { Timeline, Text } from '@mantine/core';
import { IconGitBranch, IconGitCommit, IconArrowUp, IconAlarm, IconFileDescription, IconGenderTrasvesti, IconHandRock } from '@tabler/icons-react';
import { ShoppingCart } from 'tabler-icons-react';
import { Star } from 'tabler-icons-react';
import { ShoppingItem } from "./App";
import { notifications } from '@mantine/notifications';
import { useCart } from "react-use-cart";
import { handleItemsToBuy } from "./Layout";
import { useWindowScroll } from '@mantine/hooks';
import { myItem, MyWantlist } from "./App";


const discogs_api_token: string = import.meta.env.VITE_DISCOGS_API_KEY;

type Params = {
    id: string;
};

type Detail = {
    id:                 number;
    status:             string;
    year:               number;
    resource_url:       string;
    uri:                string;
    artists:            Artist[];
    artists_sort:       string;
    labels:             Company[];
    series:             any[];
    companies:          Company[];
    formats:            Format[];
    data_quality:       string;
    community:          Community;
    format_quantity:    number;
    date_added:         Date;
    date_changed:       Date;
    num_for_sale:       number;
    lowest_price:       number;
    master_id:          number;
    master_url:         string;
    title:              string;
    country:            string;
    released:           string;
    notes:              string;
    released_formatted: string;
    identifiers:        Identifier[];
    videos:             Video[];
    genres:             string[];
    styles:             string[];
    tracklist:          Tracklist[];
    extraartists:       Artist[];
    images:             MyImage[];
    thumb:              string;
    estimated_weight:   number;
    blocked_from_sale:  boolean;
}

type Artist = {
    name:           string;
    anv:            string;
    join:           string;
    role:           string;
    tracks:         Tracks;
    id:             number;
    resource_url:   string;
    thumbnail_url?: string;
}

enum Tracks {
    A2A4B1B3 = "A2, A4, B1, B3",
    A3B1B2 = "A3, B1, B2",
    Empty = "",
}

type Community = {
    have:         number;
    want:         number;
    rating:       Rating;
    submitter:    Submitter;
    contributors: Submitter[];
    data_quality: string;
    status:       string;
}

type Submitter = {
    username:     string;
    resource_url: string;
}

type Rating = {
    count:   number;
    average: number;
}

type Company = {
    name:             string;
    catno:            string;
    entity_type:      string;
    entity_type_name: string;
    id:               number;
    resource_url:     string;
    thumbnail_url:    string;
}

type Format = {
    name:         string;
    qty:          string;
    descriptions: string[];
}

type Identifier = {
    type:         string;
    value:        string;
    description?: string;
}

type MyImage = {
    type:         string;
    uri:          string;
    resource_url: string;
    uri150:       string;
    width:        number;
    height:       number;
}

type Tracklist = {
    position:     string;
    type_:        Type;
    title:        string;
    extraartists: Artist[];
    duration:     string;
}

enum Type {
    Track = "track",
}

type Video = {
    uri:         string;
    title:       string;
    description: string;
    duration:    number;
    embed:       boolean;
}

// Actions and States Defs

type ReleaseState = {
    data: Detail;
    isLoading: boolean;
    isError: boolean;
  }
  
  type ReleaseFetchInitAction = {
    type: 'RELEASE_FETCH_INIT';
  }
  
  type ReleaseFetchSuccessAction = {
    type: 'RELEASE_FETCH_SUCCESS';
    payload: Detail;
  }
  
  type ReleaseFetchFailureAction = {
    type: 'RELEASE_FETCH_FAILURE';
  }

  
  type ReleaseAction = 
  ReleaseFetchInitAction
    | ReleaseFetchSuccessAction
    | ReleaseFetchFailureAction;

type ImagesProps = {
  item: any;
}

type VideosProps = {
    item: any;
  }

type TracklistProps = {
    item: any;
}

const useMousePosition = () => {
  const [
    mousePosition,
    setMousePosition
  ] = React.useState({ x: null, y: null });

  React.useEffect(() => {
    const updateMousePosition = ev => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    
    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return mousePosition;
};
  
//Reducer
const releaseReducer = (
  state: ReleaseState, action: ReleaseAction
) => {
  switch (action.type) {
    case 'RELEASE_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'RELEASE_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      }
    case 'RELEASE_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};



//API Request  with the following api endpoint: 


const Details = () => {

  const { addItem } = useCart();

    //Scroll to top
  const [scroll, scrollTo] = useWindowScroll();

  //set remove and add to wantlist toggle
  const [active, setActive] = React.useState(false);

  function handleWantlist(id: number, name: string, price: number, images:string, status:string){

    let wl: MyWantlist = JSON.parse(localStorage.getItem("wantlist") || "[]");
    console.log("wantlist", wl)

    let user: string | null = localStorage.getItem("user")!;

    console.log(user)

    let items: myItem[] = wl[user];

    if (items === undefined){
      items = [];
    }

    if (items.length === 0){
      localStorage.getItem("wantlist")
    }
    //Check if user has signed in
    if (localStorage.getItem('user')?.length != 0)
    {

      console.log("User:", user)


      if(localStorage.getItem('wantlist')?.includes(id.toString())){
        setActive(false);

        console.log("Item Found!!")
        items = items.filter(i => i.id.toString() !== id.toString())

        console.log(items)

        let wantlist: MyWantlist = {
          [user]: items
        }

        localStorage.setItem("wantlist", JSON.stringify(wantlist));
      }
      else{
        console.log("Found user... adding items")
        items.push({id: id, name: name, price: price, count: 1, image: images, status: status});
        setActive(true);

        let wantlist: MyWantlist = {
          [user]: items
        }

        localStorage.setItem("wantlist", JSON.stringify(wantlist));
      }
    }
    //If yes, then...
  
      //Check if item is in wantlist
  
        //if yes, then remove it and change button name to add to wantlist
  
        //else add it and change button name to remove from wantlist
  
    //Else show alert --> Please Login to save items
  }

  const mousePosition = useMousePosition();

    const params = useParams<Params>();
    const id = params.releaseId === undefined ? undefined :
    params.releaseId.toString();
    const price = params.priceId === undefined ? undefined :
    params.priceId.toString();
    const status = params.statusId === undefined ? undefined :
    params.statusId.toString();
    console.log(params)
    console.log("Rendering details.tsx")


  

    const API = 'https://api.discogs.com/releases/' + id;


 /** REDUCER HANDLES USE STATES */
 const [releases, dispatchDetails] = React.useReducer(
    releaseReducer,
    {data: {} as Detail, isLoading: false, isError: false}
  );

  const handleFetchDetails = React.useCallback(async () => {

    dispatchDetails({
      type: 'RELEASE_FETCH_INIT',
    });
    
    try {
      console.log('New API URL: ' + API);

      const result = await axios.get(API, {
        headers :
         { 'Authorization': 'Discogs token=' + discogs_api_token }
      })
 
      const object: Detail = result.data;
      console.log(object)
      dispatchDetails({
        type: 'RELEASE_FETCH_SUCCESS',
        payload: object,
      });
    } catch { 
        dispatchDetails({type: 'RELEASE_FETCH_FAILURE'});
    }
  }, [API]);


  //useEffect for API Discogs Fetch
  React.useEffect(() => {
    handleFetchDetails();
    }, [handleFetchDetails]);
  


    let s = {} as ShoppingItem;
    if(releases.data.images !== undefined){
        s.id = releases.data.id;
        s.name = releases.data.title;
        s.price = parseInt(price);
        s.quantity = 1;
        s.image = releases.data.images[0]?.resource_url;
        s.artist = releases.data.artists[0]?.name;
        s.status = status;
      }

    handleItemsToBuy();

    function checkWantlist(id: number) {
      if(localStorage.getItem('wantlist')?.includes(id.toString())){
        setActive(true);
      }else{
        setActive(false);
      }
    }

    React.useEffect(() => {
      checkWantlist(id);
    }, []);


let data: any = [];
    if (releases.data.community !== undefined)
    {
        data = [
            {
                label: "Average owners",
                stats: releases.data.community.have,
                progress: releases.data.community.rating.count.toString(),
                color: "blue",
                icon: "up",
            },
            {
                label: "In Wantlists",
                stats: releases.data.community.want,
                progress: releases.data.community.rating.count.toString(),
                color: "blue",
                icon: "up",
            },
            {
                label: "Rating (0 to 5)",
                stats: releases.data.community.rating.average,
                progress: releases.data.community.rating.count.toString(),
                color: "blue",
                icon: "up",
            },
            {
                label: "Lowest Price",
                stats: releases.data.lowest_price.toString() + " €",
                progress: releases.data.community.rating.average,
                color: "blue",
                icon: "up",
            },
        ]


    }

return (
    <>
        {releases.isError && <p>Oops! Something went wrong... </p>}

        {releases.isLoading ? (
        <>
            <Center>
                <Loader size="xl" variant="oval" />
            </Center>
        </>
        ):(
            
            <SimpleGrid
            cols={4}
            spacing="lg"
            breakpoints={[
              { maxWidth: '62rem', cols: 3, spacing: 'md' },
              { maxWidth: '48rem', cols: 2, spacing: 'sm' },
              { maxWidth: '36rem', cols: 1, spacing: 'sm' },
            ]}
          >
            <div>
            <>                  
                <SimpleGrid cols={1}>
                        <div style={{display: 'flex', justifyContent:'center'}}>
                {releases.data.formats?.map((item) => (  
                            <>

                            <Timeline active={5} bulletSize={24} lineWidth={2}>
                            
                            <Timeline.Item bullet={<IconGitBranch size={12} />} title="Type">
                            <Text color="dimmed" size="sm">{item.name}</Text>
                            </Timeline.Item>
                    
                            <Timeline.Item bullet={<IconGitCommit size={12} />} title="Quantity">
                            {status !== 'For Sale' ? (
                            <Text color="dimmed" size="sm">This item is {status} <Text variant="link" component="span" inherit></Text></Text>
                            ): (
                              <Text color="dimmed" size="sm">This item has {item.qty} copy(ies)<Text variant="link" component="span" inherit></Text></Text>
                            )}
                            <Text size="xs" mt={4}>Item was added: <br></br> {releases.data.date_added.toString()}</Text>
                            </Timeline.Item>
                            
                            <Timeline.Item title="Description" bullet={<IconFileDescription size={12} />}>
                            <Text color="dimmed" size="sm">{item.descriptions.toString()}<Text variant="link" component="span" inherit> Released in {releases.data.country} in {releases.data.year}</Text></Text>
                            </Timeline.Item>

                            <Timeline.Item title="Genres" bullet={<IconGenderTrasvesti size={12} />}>
                            {releases.data.genres?.map((item) =>(
                              <>
                                <Text color="dimmed" size="sm"><Text variant="link" component="span" inherit>{item}</Text></Text>
                              </>
                            ))}
                            </Timeline.Item>
                            <Timeline.Item title="Styles" bullet={<IconHandRock size={12} />}>
                            {releases.data.styles?.map((item) =>(
                              <>
                                <Text color="dimmed" size="sm"><Text variant="link" component="span" inherit>{item}</Text></Text>
                              </>
                            ))}
                            </Timeline.Item>
                            </Timeline>
                            

                            </>
                            ))}

                    </div>
                </SimpleGrid>
            </>

            </div>
            <div>
                <Carousel
                    mx="auto"
                    withIndicators>
                {releases.data.images?.map((item) => (
                    <>
                        <Images item={item}></Images>
                    </>
                ))}  
                </Carousel>
                <br></br>
                <Flex gap="md">
                    <Title order={2}>{price} €</Title>
                    {status === 'For Sale' ? (
                        <Button name={`${id}`} leftIcon={<ShoppingCart size="1rem" />} onClick={() => 
                          {notifications.show({
                           title: 'Awesome!',
                           message: 'Your item has been added to your shopping cart! 🤥',
                         }); addItem(s);}}>Add to cart</Button>                       
                    ) : (
                      <>
                      <Button name={`${id}`} leftIcon={<ShoppingCart size="1rem" />} disabled onClick={() => 
                        {notifications.show({
                         title: 'Awesome!',
                         message: 'Your item has been added to your shopping cart! 🤥',
                       }); addItem(s);}}>Add to cart</Button> 
                      <Tooltip color="grey" label="Notify me if item is in stock again!" position="bottom"      
                          withArrow
                          arrowPosition="center">
                        <Button><IconAlarm></IconAlarm></Button>
                      </Tooltip>
                       </>
                    )}
                         {localStorage.getItem('user')?.length != 0 ? ( !active ? (
                          <Button leftIcon={<Star size="1rem" />} onClick={() => 
                            {notifications.show({
                              title: 'Nice!',  
                              message: 'Item was added to your wantlist! Under your name you can find it',
                            }); handleWantlist(id, releases.data.title, price, releases.data.images[0].resource_url, status);}}
                            >{ !active ? "To Wantlist " : "Remove from Wantlist"}</Button>  
                         ) : (
                          <Button leftIcon={<Star size="1rem" />} onClick={() => 
                            {notifications.show({
                              title: 'Nice!',  
                              message: 'Item was removed from your wantlist!',
                            }); handleWantlist(id, releases.data.title, price, releases.data.images[0].resource_url, status);}}
                            >{ !active ? "To Wantlist " : "Remove from Wantlist"}</Button>  
                         )
                       
                            )
                            : 
                            (
                          <Button leftIcon={<Star size="1rem" />} onClick={() => 
                            {notifications.show({
                              title: 'Oh oh!',
                              message: 'Please sign in to add items to your wantlist',
                            }); handleWantlist(id, releases.data.title, price, releases.data.images[0].resource_url, status);}}
                            >{ !active ? "To Wantlist " : "Remove from Wantlist"}</Button>
                         )}
                </Flex>
            </div>
            <div>
            {releases.data.artists?.map((item) => (
                <>
                <Title order={2}>{item.name} - </Title>
                </>
            ))}  
            <Title order={2}>{releases.data.title}</Title>
            <br></br>
            {releases.data.tracklist?.map((item) => (
                    <>
                        <Tracklist item={item}></Tracklist>
                    </>
                ))} 
            </div>
            <div>
                <Title>Statistics</Title>
                <StatsRing data={data}></StatsRing>
                <br></br>
                <Title>Videos</Title>
                <List
                  spacing="xs"
                  size="sm"
                  center
                  icon={
                    <ThemeIcon color="blue" size={20} radius="xl">
                      <IconHandRock size="1rem" />
                    </ThemeIcon>
                  }
                >
                {releases.data.videos?.map((item) => (
                    <>
                        <Videos item={item}></Videos>
                    </>
                ))}                   
                </List>

            </div>
            <div>


            </div>
          </SimpleGrid>

        )}

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
    </>
);};
const Images: React.FC<ImagesProps> = ({item}) =>
  (  
    <>
        {<img src={item.resource_url}></img>}
    </>
  );

const Videos: React.FC<VideosProps> = ({item}) =>
  (  
    <>
          <List.Item><a href={item.uri} target="_blank">{item.title}</a></List.Item>
    </>
  );

  const Tracklist: React.FC<TracklistProps> = ({item}) =>
  (  
    <>
    <Container>
        <SimpleGrid cols={3}>
            <div>
            Side {item.position}
            </div>
            <div style={{display: 'flex', justifyContent:'start'}}>
            {item.title}
            </div>
            <div style={{display: 'flex', justifyContent:'flex-end'}}>
            {item.duration}
            </div>
        </SimpleGrid>
        <Divider my="sm"></Divider>
    </Container>
    </>
  );


export default Details