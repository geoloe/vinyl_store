import { UserInfoIcons } from './Components/UserInfos';
import { useWindowScroll, useDisclosure } from '@mantine/hooks';
import * as React from 'react';
import axios from 'axios';
import { sortBy } from 'lodash';
import { HeroImageRight } from './Components/Banner';
import { Carousel } from '@mantine/carousel';
import { Modal, ScrollArea, Tabs, Affix, Transition, MultiSelect, Checkbox, Avatar, Badge, Box, SimpleGrid, Center, Loader, Text, Grid, createStyles, Image, Button, Card, Group, getStylesRef, rem, Pagination, Tooltip, RangeSlider } from '@mantine/core';
import { Alert } from '@mantine/core';
import { IconAlertCircle, IconChevronRight, IconChevronsRight, IconChevronLeft, IconChevronsLeft, IconFilterSearch, IconArrowUp,  IconStar, IconShoppingCart, IconVinyl, IconDeviceGamepad } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useCart } from "react-use-cart";
import { notifications } from '@mantine/notifications';
import { handleItemsToBuy } from './Layout';
import { NotFoundTitle } from './Components/Error';
import { ReactSearchAutocomplete } from 'react-search-autocomplete'
import { useNavigate } from 'react-router-dom';
import fetchAll from './Fetch';
import { Search } from 'tabler-icons-react';



/*Object Defs*/

export const discogs_api_token: string = import.meta.env.VITE_DISCOGS_API_KEY;


type SearchObj = {
  thumbnail:      string;
  description:    string;
  images:         Image[];
  artist:         string;
  format:         string;
  resource_url:   string;
  title:          string;
  year:           number;
  id:             number;
  label:          string;
  catalog_number: string;
  stats:          ReleaseStats;
  price:          Price;
  status:         string;
}

//Steam Objects
export type Vinyl = {
  pagination: Pagination;
  listings:   Listing[];
}

export type ShoppingItem = {
  id: number;
  name: string;
  price: number;
  quantity?: number;
  image: string;
  artist?: string;
  status: string;
}

export type Listing = {
  id:                      number;
  resource_url:            string;
  uri:                     string;
  status:                  Status;
  condition:               Condition;
  sleeve_condition:        Condition;
  comments:                string;
  ships_from:              ShipsFrom;
  posted:                  Date;
  allow_offers:            boolean;
  audio:                   boolean;
  price:                   Price;
  original_price:          OriginalPrice;
  shipping_price:          Price;
  original_shipping_price: OriginalPrice;
  seller:                  Seller;
  release:                 Release;
  in_cart:                 boolean;
}

enum Condition {
  Generic = "Generic",
  GoodG = "Good (G)",
  GoodPlusG = "Good Plus (G+)",
  NearMintNMOrM = "Near Mint (NM or M-)",
  Mint = "Mint (M)",
  VeryGoodPlusVG = "Very Good Plus (VG+)",
  VeryGoodVG = "Very Good (VG)",
}

export type OriginalPrice = {
  curr_abbr: Curr;
  curr_id:   number;
  formatted: string;
  value:     number;
}

enum Curr {
  Eur = "EUR",
}

export type Price = {
  value:    number;
  currency: Curr;
}

export type Release = {
  thumbnail:      string;
  description:    string;
  images:         Image[];
  artist:         string;
  format:         string;
  resource_url:   string;
  title:          string;
  year:           number;
  id:             number;
  label:          string;
  catalog_number: string;
  stats:          ReleaseStats;
}

export type Image = {
  type:         Type;
  uri:          string;
  resource_url: string;
  uri150:       string;
  width:        number;
  height:       number;
}

enum Type {
  Primary = "primary",
  Secondary = "secondary",
}

export type ReleaseStats = {
  community: Community;
  user:      Community;
}

export type Community = {
  in_wantlist:   number;
  in_collection: number;
}

export type Seller = {
  id:              number;
  username:        Username;
  avatar_url:      string;
  stats:           SellerStats;
  min_order_total: number;
  html_url:        string;
  uid:             number;
  url:             string;
  payment:         Payment;
  shipping:        string;
  resource_url:    string;
}

enum Payment {
  PayPalCommerce = "PayPal Commerce",
}

export type SellerStats = {
  rating: string;
  stars:  number;
  total:  number;
}

enum Username {
  Ssrl4000 = "ssrl4000",
}

enum ShipsFrom {
  Germany = "Germany",
}

enum Status {
  ForSale = "For Sale",
  Sold = "Sold"
}

export type Pagination = {
  page:     number;
  pages:    number;
  per_page: number;
  items:    number;
  urls:     Urls;
}

export type Urls = {
  first?: string;
  prev?: string;
  last?: string;
  next?: string;
}

enum ButtonTypes {
  "button",
  "submit",
  "reset",
  undefined
} 

export type DeleteButtonProps = {
  name: string;
  type?: string;
  value: string;
  index: number;
  removeItem: (item: Listing) => void;
  item: Listing;
}

export type Vinyls = Vinyl["listings"];

//Props Defs

export type ListProps = {
  list: Vinyls;
  page: Pagination;
  range: [number, number];
  onRemoveItem: (item: Listing) => void;
  onPageSelect: React.MouseEventHandler<HTMLButtonElement>;
  onPagesPerPage: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  addItem: React.MouseEventHandler<HTMLButtonElement>;
}

export type ItemProps = {
  item: Listing;
  index: number;
  onRemoveItem: (item: Listing) => void;
  addItem: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}

export type CarouselProps = {
  item: Listing;
  index: number;
  onRemoveItem: (item: Listing) => void;
  new_record: boolean;
  addItem: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}

export type SearchFormProps = {
  searchTerm: string;
  onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.ChangeEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}

export type InputWithLabelProps = {
  id: string;
  value: string;
  type?: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  children: React.ReactNode;
}

// Actions and States Defs

type VinylsState = {
  data: Listing[];
  isLoading: boolean;
  isError: boolean;
}

type VinylsFetchInitAction = {
  type: 'VINYLS_FETCH_INIT';
}

type VinylsFetchSuccessAction = {
  type: 'VINYLS_FETCH_SUCCESS';
  payload: Listing[];
  page: Pagination;
}

type VinylsFetchFailureAction = {
  type: 'VINYLS_FETCH_FAILURE';
}

type VinylsRemoveAction = {
  type: 'REMOVE_VINYLS';
  payload: Listing;
}

type VinylsAction = 
  VinylsFetchInitAction
  | VinylsFetchSuccessAction
  | VinylsFetchFailureAction
  | VinylsRemoveAction;

//Define custom hook
export const useStorageState = (
  key: string,
  initialState: string
): [string, (newValue: string) => void ] => {
  const [value, setValue] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key]);

  return [value, setValue]
};


export type MyWantlist = {
  [user:string]: myItem[];
}

export type myItem = {
  id: number;
  name: string;
  price: number;
  count: number;
  image: string;
  status: string;
}

const API_ENDPOINT = 'https://api.discogs.com/users/ssrl4000/inventory?per_page='; 

const vinylsReducer = (
  state: VinylsState, action: VinylsAction
) => {
  switch (action.type) {
    case 'VINYLS_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'VINYLS_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
        page: action.page,
      }
    case 'VINYLS_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_VINYLS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: state.data.filter(
          (vinyl) => action.payload.release.id !== vinyl.release.id
        ),
      };
    default:
      throw new Error();
  }
};

export function removeWantlistItem(id: number){
  let wl: MyWantlist = JSON.parse(localStorage.getItem("wantlist") || "[]");
  //console.log("wantlist", wl)

  let user: string | null = localStorage.getItem("user")!;

  //console.log(user)

  let items: myItem[] = wl[user];

  if(localStorage.getItem('wantlist')?.includes(id.toString())){
    items = items.filter(i => i.id !== id);
    let wantlist: MyWantlist = {
      [user]: items
    }
    localStorage.setItem("wantlist", JSON.stringify(wantlist));
}
}


const App = () => {
  
  const [searchTerm, setSearchTerm] = useStorageState(
    'search',
    ''
    );

  const [user, setUser] = useStorageState(
    'user',
    ''
  );

  const [wantlist, setWantlist] = useStorageState(
    'wantlist',
    '[]'
  );
  const navigate = useNavigate();
  //Shopping Item

  const { addItem } = useCart();

  const [opened, { open, close }] = useDisclosure(false);

  const [itemsPerPage, setItemsPerPage] = React.useState(
    '10'
  );

  const [urlDiscogs, setUrlDiscogs] = React.useState(
    `${API_ENDPOINT}${itemsPerPage}`
  );

  //Scroll to top
  const [scroll, scrollTo] = useWindowScroll();

  /** REDUCER HANDLES USE STATES */
  const [vinyls, dispatchVinyls] = React.useReducer(
    vinylsReducer,
    {data: [], isLoading: false, isError: false, page: {} as Pagination}
  );

  const handleFetchVinyls = React.useCallback(async () => {

    dispatchVinyls({
      type: 'VINYLS_FETCH_INIT',
    });
    
    try {
      //console.log('New API URL: ' + urlDiscogs);
      const result = await axios.get(urlDiscogs, {
        headers :
         { 'Authorization': 'Discogs token=' + discogs_api_token }
      })
      //Convert JSON to Vinyl and Pagination type
      const arr: Vinyl[] = Object.values(result.data);
      const listing: Listing[] = arr[1];
      const page: Pagination = arr[0];

      dispatchVinyls({
        type: 'VINYLS_FETCH_SUCCESS',
        payload: listing,
        page: page,
      });
    } catch { 
      dispatchVinyls({type: 'VINYLS_FETCH_FAILURE'});
    }
  }, [urlDiscogs]);

////Get the whole catalogue
  let searchResults: Listing[];
  vinyls.isLoading, vinyls.isError, searchResults = fetchAll();


    //Delete duplicates
  const uniqueResults = [...new Map(searchResults.map(v => [v.id, v])).values()]
////Get the whole catalog



  //console.log("Whole Catalogue:", uniqueResults)

  let filteredVinyls = vinyls.data.filter(function (vinyl){   
   if (vinyl.release !== undefined){
    return vinyl.release.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    vinyl.release.artist.toLowerCase().includes(searchTerm.toLowerCase());
   }
   else{
   //console.log("Undefined");
    //console.log(vinyl);
   }
  });

  //useEffect for API Discogs Fetch
  React.useEffect(() => {
    handleFetchVinyls();
    }, [handleFetchVinyls]);

  //useEffect for onInput typing search bar
  React.useEffect(() => {
    localStorage.setItem('search', searchTerm);
    }, [searchTerm]);

  /*Start Event Handlers*/
  const handleSearchInput = (
    event: React.ChangeEvent<HTMLInputElement>
    ) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (
    event: React.ChangeEvent<HTMLFormElement>
    ) => {
    setUrlDiscogs(`${API_ENDPOINT}${searchTerm}`);
    event.preventDefault();
  }

  const handlePagination = (
    event: React.MouseEventHandler<HTMLButtonElement>
    //event: React.ChangeEvent<HTMLInputElement>
    ) => {

    const button: HTMLButtonElement = event.currentTarget;

    setUrlDiscogs(`${button.value}`);
  }

  const handleRemoveVinyl = (item: Listing) => {
    dispatchVinyls({
      type: 'REMOVE_VINYLS',
      payload: item,
    });
  };
  const [formSort, setFormSort] = React.useState(
    {"onsale": false,
    "lp":false,
    "7": false,
    "12": false,
    "media_m": false,
    "media_nm": false,
    "media_vgp":false,
    "media_vg":false,
    "media_g": false,
    "media_f": false,
    "sleeve_m": false,
    "sleeve_nm": false,
    "sleeve_vgp":false,
    "sleeve_vg":false,
    "sleeve_g":false,
    "sleeve_f": false,
    }
  )
  
  const sortedList: Listing[] = filteredVinyls.filter(function (vinyl)
  {
    if (formSort.media_m){
      return vinyl.condition.includes("Mint (M)")
    }
    else if (formSort.media_nm){
      return vinyl.condition.includes("Near Mint (NM or M-)")
    }
    else if (formSort.media_vgp){
      return vinyl.condition.includes("Very Good Plus (VG+)")
    }
    else if (formSort.media_vg){
      return vinyl.condition.includes("Very Good (VG)")
    }
    else if (formSort.media_g){
      return vinyl.condition.includes("Good (G)")
    }
    else if (formSort.media_f){
      return vinyl.condition.includes("Fair (F)")
    }
    else if (formSort.sleeve_m){
      return vinyl.condition.includes("Near Mint (NM or M-)")
    }
    else if (formSort.sleeve_nm){
      return vinyl.sleeve_condition.includes("Very Good Plus (VG+)")
    }
    else if (formSort.sleeve_vgp){
      return vinyl.sleeve_condition.includes("Very Good (VG)")
    }
    else if (formSort.sleeve_g){
      return vinyl.sleeve_condition.includes("Good (G)")
    }
    else if (formSort.sleeve_f){
      return vinyl.sleeve_condition.includes("Fair (F)")
    }
    else if (formSort.onsale){
      return vinyl.status.includes("For Sale")
    }
    else if (formSort.lp){
      return vinyl.release.format.includes("LP");
    }
    else if (formSort[12]){
      return vinyl.release.format.includes("12");
    }
    else if (formSort[7]){
      return vinyl.release.format.includes("7");
    }
  });

  const checkboxesUsed = Object.values(formSort).some(val => val === true);

  const handleCheckboxSort = (
    event: React.ChangeEvent<HTMLInputElement>
    ) => {
    const { value, checked } = event.target;
    setFormSort(prevState => ({
        ...prevState,
        [value]: checked
    }));
  }

  const [slider, setSlider] = React.useState<[number, number]>([1950, 2023]);

  const handleItemsPerPage = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(event.target.value);
    setUrlDiscogs(`${API_ENDPOINT}${event.target.value}`);
  }
  

  /*End Event Handlers*/

  //Handler when adding or deleting items in shopping cart --> Buttons are disabled/enabled
  handleItemsToBuy();

  const handleOnSearch = (string: string, results: SearchObj[]) => {
    // onSearch will have as the first callback parameter
    // the string searched and for the second the results.
    //console.log(string, results)
  }

  const handleOnHover = (result: SearchObj) => {
    // the item hovered
    //console.log(result)
  }

  const handleOnSelect = (item: SearchObj) => {
    // the item selected
    navigate(`/details/${item.id}/${item.price.value}/${item.status}`);
    //console.log(`/details/${item.id}/${item.price.value}/${item.status}`)
  }

  const handleOnFocus = () => {
    //console.log('Focused')
  }

  const formatResult = (item: SearchObj) => {
    return (
      <>
          <div>
            <span style={{ display: 'block', textAlign: 'left' }}><Image src={item.thumbnail} width={60} height={60}></Image></span>
            <span style={{ display: 'block', textAlign: 'left' }}><Text>{item.artist} - {item.title}</Text></span>
            <span style={{ display: 'block', textAlign: 'left' }}><Text c="dimmed">{item.format}</Text></span>
          </div>
      </>
    )
  }

 ////////// Search /////////////
 // Flatten Release array
    const results: any = uniqueResults.flatMap(
      (elem) => (elem.release)
    )
  // Flatten price Array
    const price: any = uniqueResults.flatMap(
      (elem) => (elem.price)
    )
  // Flatten status Array
  const status: any = uniqueResults.flatMap(
    (elem) => (elem.status)
  )
      ///Create Search Object for Item search bar
    function appendObjectAsAttribute(arr: any[], attributeName: string, objToAppend: any): any[] {
      // Make a copy of the original array to avoid modifying it directly
      const newArr = [...arr];
    
      // Loop through the array and append the object as an attribute to each object
      newArr.forEach((item, index) => {
        item[attributeName] = objToAppend[index];
      });
    
      return newArr;
    }
    const newArray: SearchObj[] = appendObjectAsAttribute(results, 'price', price);
    const Search: SearchObj[] = appendObjectAsAttribute(newArray, 'status', status);

 ////////// Search /////////////
  return (
    <>


    <SimpleGrid cols={3}
                  spacing="lg"
                  breakpoints={[
                    { maxWidth: 'md', cols: 3, spacing: 'md' },
                    { maxWidth: 'sm', cols: 2, spacing: 'sm' },
                    { maxWidth: 'xs', cols: 1, spacing: 'sm' },
        ]}>
        <div>
          <Group>
        <UserInfoIcons 
          avatar="https://i.discogs.com/VhvI_YMO6QPx9K39LK3GEmqI54a65OlhgJLI8ZEWPIQ/rs:fill/g:sm/q:40/h:500/w:500/czM6Ly9kaXNjb2dz/LXVzZXItYXZhdGFy/cy9VLTMzNTg0OTYt/MTU5NzMwNDc4MS5q/cGVn.jpeg" 
          name={'Julian Eggers'} 
          title={'Music Entrepeneur'} 
          phone={'https://www.discogs.com/user/ssrl4000'} 
          email={'https://api.discogs.com/users/ssrl4000'}>
          </UserInfoIcons>
        
        <UserInfoIcons 
          avatar="https://avatars.steamstatic.com/a55b513e39410f2ac350958b127fcedbba830e5a_full.jpg" 
          name={'Georg Löffler'} 
          title={'Music Entrepeneur & Developer'} 
          phone={'https://www.discogs.com/user/geoloe'} 
          email={'https://api.discogs.com/users/geoloe'}>
          </UserInfoIcons>
          </Group>
        </div>
        <Center>
        <div id="front2" style={{ width: 350 }}>
        {vinyls.isLoading && <div><Center><Text c="dimmed">Fetching whole catalogue... Please wait...</Text></Center><Center><Loader variant="dots" /></Center></div>}
              <ReactSearchAutocomplete
                autoFocus
                items={Search}
                onSearch={handleOnSearch}
                onHover={handleOnHover}
                onSelect={handleOnSelect}
                onFocus={handleOnFocus}
                fuseOptions={{ keys: ["id", "description"] }}
                resultStringKeyName="artist"
                formatResult={formatResult}
                maxResults={3}
                placeholder={"Search catalogue..."}
              />
        </div>
        </Center>
        <div>
        </div>
      </SimpleGrid>

    <HeroImageRight></HeroImageRight>
    <Tabs defaultValue="vinyls">
      <Tabs.List>
        <Tabs.Tab value="vinyls" icon={<IconVinyl size="0.8rem" />}>Vinyls Catalogue</Tabs.Tab>
        <Tabs.Tab value="games" icon={<IconDeviceGamepad size="0.8rem" />}>Games Catalogue</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="vinyls" pt="xs">


      <Grid >
      <Box
                sx={(theme) => ({
                  backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                  textAlign: 'center',
                  padding: theme.spacing.xl,
                  borderRadius: theme.radius.md,

                  '&:hover': {
                    backgroundColor:
                      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
                  },
                })}
              >

                  <SimpleGrid  cols={1}
                  spacing="lg"
                  breakpoints={[
                    { maxWidth: 'md', cols: 2, spacing: 'md' },
                    { maxWidth: 'sm', cols: 1, spacing: 'sm' },
                    { maxWidth: 'xs', cols: 1, spacing: 'sm' },
                  ]}>
                  <Grid.Col span="content">
                      <Text align='center' fw={800}>Filter Page Options</Text>
                      <Text align='left'>Filter by Title and or Artist</Text>                                            
                      <Center maw={400} h={100} mx="auto">
                        <SearchForm 
                                searchTerm={searchTerm}
                                onSearchInput={handleSearchInput}
                                onSearchSubmit={handleSearchSubmit}
                                >
                      </SearchForm>
                      </Center>

                      <Text align='left'>Format Information</Text>                                            
                      <Group >
                      <Checkbox
                          label="Vinyl"
                          size="xs"
                          onChange={handleCheckboxSort}
                          value="onsale"
                      />
                      <Checkbox
                          label="LP"
                          size="xs"
                          onChange={handleCheckboxSort}
                          value="lp"
                      />
                      <Checkbox
                          label='7" Single'
                          size="xs"
                          onChange={handleCheckboxSort}
                          value="7"
                      />
                      <Checkbox
                          label='12" '
                          size="xs"
                          onChange={handleCheckboxSort}
                          value="12"
                      />
                      </Group>
                      <br></br>
                      <br></br>  
                      <Text align='left'>Media Condition</Text>                        
                      <Group>
                        <Checkbox size="xs" value="media_m" label="Mint" onChange={handleCheckboxSort}/>
                        <Checkbox size="xs" value="media_nm" label="Near Mint" onChange={handleCheckboxSort}/>
                        <Checkbox size="xs" value="media_vgp" label="Very Good Plus" onChange={handleCheckboxSort}/>
                        <Checkbox size="xs" value="media_vg" label="Very Good" onChange={handleCheckboxSort}/>
                        <br></br>
                        <Checkbox size="xs" value="media_g" label="Good" onChange={handleCheckboxSort}/>
                        <Checkbox size="xs" value="media_f" label="Fair" onChange={handleCheckboxSort}/>
                      </Group>
                      <br></br>
                      <br></br>
                      <Text align='left'>Sleeve Condition</Text>  
                      <Group>
                        <Checkbox size="xs" value="sleeve_m" label="Mint" onChange={handleCheckboxSort}/>
                        <Checkbox size="xs" value="sleeve_nm" label="Near Mint" onChange={handleCheckboxSort}/>
                        <Checkbox size="xs" value="sleeve_vgp" label="Very Good Plus" onChange={handleCheckboxSort}/>
                        <Checkbox size="xs" value="sleeve_vg" label="Very Good" onChange={handleCheckboxSort}/>
                        <br></br>
                        <Checkbox size="xs" value="sleeve_g" label="Good" onChange={handleCheckboxSort}/>
                        <Checkbox size="xs" value="sleeve_f" label="Fair" onChange={handleCheckboxSort}/>
                      </Group>
                      <br></br>
                      <Text align='left'>Release Year</Text>
                      <Box maw={400} mx="auto">
                      <Text align="left" fz="xs" ta="left">From - To</Text>
                      <RangeSlider 
                              value={slider}
                              min={1900}
                              max={2023}
                              label={(value) => `${value}` } 
                              onChangeEnd={setSlider}/>
                      <br></br>
                      </Box>
                    <Center>
                      <Tooltip color="grey" label="More filter options" position="bottom"      
                          withArrow
                          arrowPosition="center">
                        <Button variant="gradient" size='xs' gradient={{ from: 'teal', to: 'blue', deg: 60 }} onClick={open}><IconFilterSearch/></Button> 
                      </Tooltip>
                    </Center>
                  </Grid.Col>
                  </SimpleGrid>
                  <Modal size="md" opened={opened} onClose={close} title="More filters" centered>
                  <MultiSelect
                      data={['Rock', 'R&B', 'Soul', 'Jazz', 'Metal', 'Salsa Candela', 'Reggaeton', 'Rap', 'EDM']}
                      label="Pick your genres"
                      placeholder="Pick all that you like"
                      transitionProps={{ duration: 150, transition: 'pop-top-left', timingFunction: 'ease' }}
                    />
                  <MultiSelect
                      data={['Recently added', 'Most viewed', "Jule's favs"]}
                      label="Miscellanous"
                      placeholder="Miscellanous"
                      transitionProps={{ duration: 150, transition: 'pop-top-left', timingFunction: 'ease' }}
                    />
                    <br></br>
                  <Button variant="gradient" compact size='xs' gradient={{ from: 'teal', to: 'blue', deg: 60 }} onClick={close}>Apply changes!</Button>                 
                  </Modal>  
              </Box>

        <Grid.Col span="auto">
          <div>

            {vinyls.isError && <p>Oops! Something went wrong... </p>}

            {vinyls.isLoading ? (
              <>
              <Center>
                <Loader size="xl" variant="oval" />
              </Center>
              </>
            ) : ( sortedList.length <= 1 && !checkboxesUsed ? (
              <List list={filteredVinyls} range={slider} page={vinyls.page} onRemoveItem={handleRemoveVinyl} onPageSelect={handlePagination} onPagesPerPage={handleItemsPerPage} addItem={addItem}/>
            ) : (
              <List list={sortedList} range={slider} page={vinyls.page} onRemoveItem={handleRemoveVinyl} onPageSelect={handlePagination} onPagesPerPage={handleItemsPerPage} addItem={addItem}/>
            )
            )}
          </div>

        </Grid.Col>
      </Grid>

        
      </Tabs.Panel>

      <Tabs.Panel value="games" pt="xs">
              <NotFoundTitle></NotFoundTitle>
      </Tabs.Panel>

    </Tabs>

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
  );
};

const SearchForm: React.FC<SearchFormProps> = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit,
}) => (
  <form onSubmit={onSearchSubmit}>
    <InputWithLabel 
      id='search'
      type='text'
      value={searchTerm}
      onInputChange={onSearchInput}
      
    >
      <strong>Search:</strong>
    </InputWithLabel>

    <button type="submit" disabled={!searchTerm}>Search</button>
  </form>
);

const SORTS = {
  NONE: (list: Listing[]) => list,
  TITLE_ASC: (list: Listing[]) => sortBy(list, 'release.title'),
  TITLE_DESC: (list: Listing[]) => sortBy(list, 'release.title').reverse(),
  ARTIST_ASC: (list: Listing[]) => sortBy(list, 'release.artist'),
  ARTIST_DESC: (list: Listing[]) => sortBy(list, 'release.artist').reverse(),
  PRICE_ASC: (list: Listing[]) => sortBy(list, 'price.value'),
  PRICE_DESC: (list: Listing[]) => sortBy(list, 'price.value').reverse(),
}

export const List: React.FC<ListProps> = ({ list, range, page, onRemoveItem, onPageSelect, onPagesPerPage, addItem}) => {

const [sort, setSort] = React.useState('NONE');

const handleSort = (event: React.ChangeEvent<HTMLSelectElement>) => {
  //console.log(event.target.value);
  setSort(event.target.value);
};


const sortFunction = SORTS[sort as keyof typeof SORTS];
const sortedList: Listing[] = sortFunction(list);
const sortedListWithYear: Listing[] = [];
//handle year filter
for(let i:number = 0; i < sortedList.length; i++){
  if(sortedList[i].release.year >= range[0] && sortedList[i].release.year <= range[1]){
    sortedListWithYear.push(sortedList[i]);
  }
  else if (sortedList[i].release.year === 0){
    sortedListWithYear.push(sortedList[i]);  
  }
}


return (
  <>
    {sortedListWithYear.length > 0 ? (
            <>
            <Box
                sx={(theme) => ({
                  backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
                  textAlign: 'left',
                  padding: theme.spacing.xl,
                  borderRadius: theme.radius.md,

                  '&:hover': {
                    backgroundColor:
                      theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1],
                  },
                })}
              >
              <Grid>
              <Grid.Col span="content">
                <Text fz="xs" c="dimmed" ta="left">Page {page.page}-{page.pages} Showing: {sortedListWithYear.length} Items</Text>
              </Grid.Col>
              <Grid.Col span={9}>
                <Center>
                <Button.Group>
                    {page.urls.first === undefined ? (
                      <Tooltip
                          label="First page"
                          color="blue"
                          withArrow
                          arrowPosition="center"
                        >
                        <Button size="xs" variant="outline" data-disabled><IconChevronsLeft/></Button>
                      </Tooltip>
                    ): (
                      <Tooltip
                          label="First page"
                          color="blue"
                          withArrow
                          arrowPosition="center"
                        >
                        <Button size="xs" variant="outline" value={page.urls.first} onClick={onPageSelect}><IconChevronsLeft/></Button>
                      </Tooltip>
                    )}
                    {page.urls.prev === undefined ? (
                      <Tooltip
                         label="Previous page"
                          color="blue"
                          withArrow
                          arrowPosition="center"
                        >
                      <Button size="xs" variant="outline" data-disabled><IconChevronLeft/></Button>
                      </Tooltip>
                    ): (
                      <Tooltip
                      label="Previous page"
                       color="blue"
                       withArrow
                       arrowPosition="center"
                     >
                      <Button size="xs" variant="outline" value={page.urls.prev} onClick={onPageSelect}><IconChevronLeft/></Button>
                      </Tooltip>
                    )}
                    {page.urls.next === undefined ? (
                      <Tooltip
                         label="Next page"
                          color="blue"
                          withArrow
                          arrowPosition="center"
                        >
                      <Button size="xs" variant="outline" data-disabled><IconChevronRight/></Button>
                      </Tooltip>
                    ): (
                      <Tooltip
                         label="Next page"
                          color="blue"
                          withArrow
                          arrowPosition="center"
                        >
                      <Button size="xs" variant="outline" value={page.urls.next} onClick={onPageSelect}><IconChevronRight/></Button>
                      </Tooltip>
                    )}
                    {page.urls.last === undefined ? (
                      <Tooltip
                         label="Last page"
                          color="blue"
                          withArrow
                          arrowPosition="center"
                        >
                      <Button size="xs" variant="outline" data-disabled><IconChevronsRight/></Button>
                      </Tooltip>
                    ): (
                      <Tooltip
                         label="Last page"
                          color="blue"
                          withArrow
                          arrowPosition="center"
                        >
                      <Button size="xs" variant="outline" value={page.urls.last} onClick={onPageSelect}><IconChevronsRight/></Button>
                      </Tooltip>
                    )}
                </Button.Group> 
                </Center>
                <br></br>
                <Center>
                <Text fz="xs" c="dimmed" ta="left">Sort Items</Text>&nbsp;
                <select name="filter" id="inline-filter" onChange={handleSort}>
                  <option value="NONE">--None--</option>
                  <option value="PRICE_ASC">Price Ascending</option>
                  <option value="PRICE_DESC">Price Descending</option>
                  <option value="TITLE_ASC">Title Ascending</option>
                  <option value="TITLE_DESC">Title Descending</option>
                  <option value="ARTIST_ASC">Artist Ascending</option>
                  <option value="ARTIST_DESC">Artist Descending</option>
              </select>           
              </Center>
              <Center>
              <Text fz="xs" c="dimmed" ta="left">Items per Page</Text>&nbsp;
                  <select name="items-per-page" id="inline-page-selector" onChange={onPagesPerPage}>
                      <option value="10">--Items--</option>
                      <option value="5">5</option>
                      <option value="10">10</option>
                      <option value="25">25</option>
                      <option value="50">50</option>
                      <option value="75">75</option>
                      <option value="100">100</option>
                  </select>   
              </Center>
              <br></br>            
              </Grid.Col>
              <Grid.Col span="content"><Text fz="xs" c="dimmed" ta="right">{page.items} Items found.</Text></Grid.Col>
              </Grid>
            <SimpleGrid 
              cols={4}
                  spacing="lg"
                  breakpoints={[
                    { maxWidth: 'md', cols: 3, spacing: 'md' },
                    { maxWidth: 'sm', cols: 2, spacing: 'sm' },
                    { maxWidth: 'xs', cols: 1, spacing: 'sm' },
                  ]}
              >
            {sortedListWithYear.map((item, index) => (
              <>
              <div >
                <div key={item.release.id}> 
                  <Item key={item.id} index={index} item={item} onRemoveItem={onRemoveItem} addItem={addItem}>
                    <DeleteButton key={index} name={item.release.title} type="button" value='Dismiss' index={index} removeItem={onRemoveItem} item={item}></DeleteButton>
                  </Item>
                </div>
              </div>
              </>
            ))}  
                 
            </SimpleGrid>
            <Grid>
              <Grid.Col span="content"><Text fz="xs" c="dimmed" ta="left">Page {page.page}-{page.pages} Showing: {list.length} Items</Text></Grid.Col>
              <Grid.Col span={9}>
              <Center>
                <Button.Group>
                    {page.urls.first === undefined ? (
                      <Tooltip
                          label="First page"
                          color="blue"
                          withArrow
                          arrowPosition="center"
                          position="bottom"
                        >
                        <Button size="xs" variant="outline" data-disabled><IconChevronsLeft/></Button>
                      </Tooltip>
                    ): (
                      <Tooltip
                          label="First page"
                          color="blue"
                          withArrow
                          arrowPosition="center"
                          position="bottom"
                        >
                        <Button size="xs" variant="outline" value={page.urls.first} onClick={onPageSelect}><IconChevronsLeft/></Button>
                      </Tooltip>
                    )}
                    {page.urls.prev === undefined ? (
                      <Tooltip
                         label="Previous page"
                          color="blue"
                          withArrow
                          arrowPosition="center"
                          position="bottom"
                        >
                      <Button size="xs" variant="outline" data-disabled><IconChevronLeft/></Button>
                      </Tooltip>
                    ): (
                      <Tooltip
                      label="Previous page"
                       color="blue"
                       withArrow
                       arrowPosition="center"
                       position="bottom"
                     >
                      <Button size="xs" variant="outline" value={page.urls.prev} onClick={onPageSelect}><IconChevronLeft/></Button>
                      </Tooltip>
                    )}
                    {page.urls.next === undefined ? (
                      <Tooltip
                         label="Next page"
                          color="blue"
                          withArrow
                          arrowPosition="center"
                          position="bottom"
                        >
                      <Button size="xs" variant="outline" data-disabled><IconChevronRight/></Button>
                      </Tooltip>
                    ): (
                      <Tooltip
                         label="Next page"
                          color="blue"
                          withArrow
                          arrowPosition="center"
                          position="bottom"
                        >
                      <Button size="xs" variant="outline" value={page.urls.next} onClick={onPageSelect}><IconChevronRight/></Button>
                      </Tooltip>
                    )}
                    {page.urls.last === undefined ? (
                      <Tooltip
                         label="Last page"
                          color="blue"
                          withArrow
                          arrowPosition="center"
                          position="bottom"
                        >
                      <Button size="xs" variant="outline" data-disabled><IconChevronsRight/></Button>
                      </Tooltip>
                    ): (
                      <Tooltip
                         label="Last page"
                          color="blue"
                          withArrow
                          arrowPosition="center"
                          position="bottom"
                        >
                      <Button size="xs" variant="outline" value={page.urls.last} onClick={onPageSelect}><IconChevronsRight/></Button>
                      </Tooltip>
                    )}
                </Button.Group> 
              </Center>
              </Grid.Col>
              <Grid.Col span="content"><Text fz="xs" c="dimmed" ta="right">{page.items} Items found.</Text></Grid.Col>
            </Grid>
            </Box>
            
          </>
          ) : (
            <Alert icon={<IconAlertCircle size="1rem" />} title="Bummer!">
              No results were found!
            </Alert>
          )}
      </>
);};

const DeleteButton: React.FC<DeleteButtonProps> = ({name, value, index, removeItem, item}) =>
  (  
    <>
    <button
      name={name}
      type="button"
      value={value}
      onClick={() => removeItem(item)}
    >
      {value}
    </button>
    </>
  );

export const Item: React.FC<ItemProps> = ({ item, index, onRemoveItem, addItem
}): JSX.Element => {

  const current_date = new Date(item.posted);
  //console.log(current_date);
  const date_ref = new Date(2023, 4, 15);
  let new_record = true;

  if(current_date < date_ref) {
    new_record = false;
  }

return (
    <>
    <div >
    <CarouselCard key={item.resource_url} item={item} index={index} onRemoveItem={onRemoveItem} new_record={new_record} addItem={addItem}>

    </CarouselCard>
    </div>
    </>
);};


const useStyles = createStyles((theme) => ({
  price: {
    color: theme.colorScheme === 'dark' ? theme.white : theme.black,
  },

  carousel: {
    '&:hover': {
      [`& .${getStylesRef('carouselControls')}`]: {
        opacity: 1,
      },
    },
  },

  carouselControls: {
    ref: getStylesRef('carouselControls'),
    transition: 'opacity 150ms ease',
    opacity: 0,
  },

  carouselIndicator: {
    width: rem(4),
    height: rem(4),
    transition: 'width 250ms ease',

    '&[data-active]': {
      width: rem(16),
    },
  },
}));


const CarouselCard: React.FC<CarouselProps> = ({ item, index, onRemoveItem, new_record, addItem 
}): JSX.Element =>  {
  const { classes } = useStyles();

  const images = []
  for(var i = 0; i < item.release.images.length; i++)
    { 
      if(i > 5)
        break;
      images.push(item.release.images[i].resource_url);
    }
  
  const s: ShoppingItem = {
    id: item.release.id,
    name: item.release.title,
    price: item.price.value,
    quantity: 1,
    image: images[0],
    artist: item.release.artist,
    status: item.status
  }
  const slides = images.map((image) => (
    <Carousel.Slide key={image}>

        <Image src={image} width={300} height={300} fit="contain" />

    </Carousel.Slide>
    
  ));

  
    const avatar = (
      <Avatar
        alt={item.seller.resource_url}
        size={24}
        mr={5}
        src={item.seller.avatar_url}
      />
    );
  return (
    <Card radius="md" withBorder padding="xl">
      <Card.Section>
        <Carousel
          withIndicators
          loop
          classNames={{
            root: classes.carousel,
            controls: classes.carouselControls,
            indicator: classes.carouselIndicator,
          }}
        >
          {slides}
        </Carousel>
      </Card.Section>
      <Group position="apart" mt="lg">
        <Text fw={500} fz="lg">
          {item.release.title}
        </Text>

        <Group spacing={5}>
          <IconStar size="1rem" />
          <Text fz="xs" fw={500}>
            {item.seller.stats.rating} {item.seller.stats.stars}
          </Text>
            <Group>
              { new_record ? (
                  <Badge pl={0} size="lg" color="blue" radius="xl" leftSection={avatar}>
                    New!
                  </Badge>
              ) : (
                  <Badge pl={0} size="lg" color="grey" radius="xl" leftSection={avatar}>
                    Reduced
                  </Badge>
              )}
              { item.status === Status.Sold ?
                (
                <Badge pl={0} size="lg" color="red" radius="xl" leftSection={avatar}>
                  Sold!
                </Badge>
                ) : (
                <Badge pl={0} size="lg" color="teal" radius="xl" leftSection={avatar}>
                  On Sale!
                </Badge>
                )}
            </Group>
        </Group>
      </Group>

      <Text fz="sm" c="dimmed" mt="sm">
        {item.release.description}
      </Text>

      <Group position="apart" mt="md">
        <div>
          <Text fz="xl" span fw={500} className={classes.price}>
          {item.original_price.formatted}
          </Text>
        </div>
        {item.status === Status.Sold ? (
        <Button radius="md" disabled >Buy now</Button>
        ) : (
          <>
          <Link to={`details/${item.release.id}/${item.price.value}/${item.status}`}>Details</Link>
          <Button name={`${s.id}`} leftIcon={<IconShoppingCart size="1rem" />} radius="md" onClick={() => 
             {notifications.show({
              title: 'Awesome!',
              message: 'Your item has been added to your shopping cart! 🤥',
            }); addItem(s)}} >Add to cart</Button>
          </>
        )}
      </Group>
    </Card>
  );
}

const InputWithLabel: React.FC<InputWithLabelProps> = ({
  id, 
  type,
  value,
  onInputChange,
  children
}) => {

const inputRef = React.useRef<HTMLInputElement>(null);



  return(
    <React.Fragment>
        <label htmlFor={id}>{children} </label>
        &nbsp;
        <input 
         ref={inputRef}
         id={id}
         type={type} 
         value={value} 
         onChange={onInputChange}
         placeholder='Search...'
         />
    </React.Fragment>
);};

export default App

