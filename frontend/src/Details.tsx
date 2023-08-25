import { useParams } from "react-router-dom";
import * as React from 'react';
import axios from 'axios';
import { AspectRatio, Center, Loader, SimpleGrid, Title, Divider, Container, Flex, Button } from '@mantine/core';
import { Carousel } from "@mantine/carousel";
import { StatsRing } from "./Stats";
import { Timeline, Text } from '@mantine/core';
import { IconGitBranch, IconGitPullRequest, IconGitCommit, IconMessageDots } from '@tabler/icons-react';
import { ShoppingCart } from 'tabler-icons-react';
import { Star } from 'tabler-icons-react';


const discogs_api_token: string = ".";

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

type InfosProps = {
    item: any;
}

type VideosProps = {
    item: any;
  }

type TracklistProps = {
    item: any;
}
  
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


export const Details = () => {

    const params = useParams<Params>();
    const id = params.id === undefined ? undefined :
    params.id.toString();
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
                stats: releases.data.lowest_price.toString() + "€",
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
                            <Timeline active={3} bulletSize={24} lineWidth={2}>
                            <Timeline.Item bullet={<IconGitBranch size={12} />} title="Type">
                            <Text color="dimmed" size="sm">{item.name}</Text>
                            </Timeline.Item>
                    
                            <Timeline.Item bullet={<IconGitCommit size={12} />} title="Quantity">
                            <Text color="dimmed" size="sm">This item has {item.qty} copy(ies)<Text variant="link" component="span" inherit></Text></Text>
                            <Text size="xs" mt={4}>Item was added: <br></br> {releases.data.date_added.toString()}</Text>
                            </Timeline.Item>
                            
                            <Timeline.Item title="Description" bullet={<IconGitPullRequest size={12} />} lineVariant="dashed">
                            <Text color="dimmed" size="sm">{item.descriptions.toString()}<Text variant="link" component="span" inherit> Released in {releases.data.country} in {releases.data.year}</Text></Text>
                            </Timeline.Item>
                            </Timeline>
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
                    <Button leftIcon={<Star size="1rem" />}>Add to Wantlist</Button>
                    <Button leftIcon={<ShoppingCart size="1rem" />}>Add to cart</Button>
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
            </div>
            <div></div>
          </SimpleGrid>
        )}
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
        <AspectRatio ratio={16 / 9}>
        <iframe
            src={item.uri}
            title={item.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        />
        </AspectRatio>
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