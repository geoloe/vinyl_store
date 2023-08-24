import { ThemeProvider } from './ThemeProvider';
import { UserInfoIcons } from './UserInfos';
import { FooterSocial } from './Footer';
import { useWindowScroll, useDisclosure } from '@mantine/hooks';
import * as React from 'react';
import axios from 'axios';
import { sortBy } from 'lodash';
import { HeaderSimple } from './Header'
import { HeroImageRight } from './Banner';
import { Carousel } from '@mantine/carousel';
import { Modal, Notification, Affix, Transition, MultiSelect, Checkbox, Avatar, Badge, Box, SimpleGrid, Center, Loader, Text, Grid, createStyles, Image, Button, Card, Group, getStylesRef, rem, Pagination, Tooltip, RangeSlider } from '@mantine/core';
import { IconStar } from '@tabler/icons-react';
import { Alert } from '@mantine/core';
import { IconAlertCircle, IconChevronRight, IconChevronsRight, IconChevronLeft, IconChevronsLeft, IconFilterSearch, IconArrowUp} from '@tabler/icons-react';

/*Object Defs*/

const discogs_api_token: string = "fVlXxrDsFQTCVTIBHELGyVtcSugtUyvpaJiDQFJh";

//Steam Objects
type Vinyl = {
  pagination: Pagination;
  listings:   Listing[];
}

type Listing = {
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
  VeryGoodPlusVG = "Very Good Plus (VG+)",
  VeryGoodVG = "Very Good (VG)",
}

type OriginalPrice = {
  curr_abbr: Curr;
  curr_id:   number;
  formatted: string;
  value:     number;
}

enum Curr {
  Eur = "EUR",
}

type Price = {
  value:    number;
  currency: Curr;
}

type Release = {
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

type Image = {
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

type ReleaseStats = {
  community: Community;
  user:      Community;
}

type Community = {
  in_wantlist:   number;
  in_collection: number;
}

type Seller = {
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

type SellerStats = {
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
}

type Pagination = {
  page:     number;
  pages:    number;
  per_page: number;
  items:    number;
  urls:     Urls;
}

type Urls = {
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

type DeleteButtonProps = {
  name: string;
  type?: string;
  value: string;
  index: number;
  removeItem: (item: Listing) => void;
  item: Listing;
}

type Vinyls = Vinyl["listings"];

//Props Defs

type ListProps = {
  list: Vinyls;
  page: Pagination;
  range: [number, number];
  onRemoveItem: (item: Listing) => void;
  onPageSelect: React.MouseEventHandler<HTMLButtonElement>
  handleNotification: React.MouseEventHandler<HTMLButtonElement>;
  onPagesPerPage: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

type ItemProps = {
  item: Listing;
  index: number;
  onRemoveItem: (item: Listing) => void;
  handleNotification: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}

type CarouselProps = {
  item: Listing;
  index: number;
  onRemoveItem: (item: Listing) => void;
  new_record: boolean;
  handleNotification: React.MouseEventHandler<HTMLButtonElement>;
  children: React.ReactNode;
}

type SearchFormProps = {
  searchTerm: string;
  onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.ChangeEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}

type InputWithLabelProps = {
  id: string;
  value: string;
  type?: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isFocused?: boolean;
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
const useStorageState = (
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


const App = () => {
  
  const [searchTerm, setSearchTerm] = useStorageState(
    'search',
    ''
    );

  const [notification, setNotification] = React.useState(
    false,
  )

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
      console.log('New API URL: ' + urlDiscogs);
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

  const filteredVinyls = vinyls.data.filter(function (vinyl){   
   if (vinyl.release !== undefined){
    return vinyl.release.title.toLowerCase().includes(searchTerm.toLowerCase());
   }
   else{
   console.log("Undefined");
    console.log(vinyl);
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

    //useEffect for slider values Fetch
  //React.useEffect(() => {
  //  console.log(slider);
  //}, [slider]);

  const handleItemsPerPage = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(event.target.value);
    setUrlDiscogs(`${API_ENDPOINT}${event.target.value}`);
  }

  const handleNotification = (
    event: React.MouseEventHandler<HTMLButtonElement>
        ) => {
    if(notification){
      console.log("clicked via Notification");
      setNotification(false);
    }
    else{
      console.log("clicked via Buy Button");
      setNotification(true);
    }

  }

  const closeNotification = (

  ) => {
    console.log("Notification to be closed.")
    setNotification(false);
  }
  

  /*End Event Handlers*/

  //Define Header Nav Items
  const options = [
    { link: "What's new?" , label: "What's new?" },
    { link: 'Contact', label: 'Contact' },
    {link: 'Jobs', label: 'Jobs' },
   ]

  const tabs: string[] = ["About"]

   const user = { name: 'Georg Löffler', 
   image: 'https://avatars.steamstatic.com/a55b513e39410f2ac350958b127fcedbba830e5a_full.jpg' }

  return (
    <>
    <ThemeProvider>
    <HeaderSimple links={options} user={user} tabs={tabs}></HeaderSimple>
    <UserInfoIcons 
    avatar="https://i.discogs.com/VhvI_YMO6QPx9K39LK3GEmqI54a65OlhgJLI8ZEWPIQ/rs:fill/g:sm/q:40/h:500/w:500/czM6Ly9kaXNjb2dz/LXVzZXItYXZhdGFy/cy9VLTMzNTg0OTYt/MTU5NzMwNDc4MS5q/cGVn.jpeg" 
    name={'Julian Eggers'} 
    title={'Music Entrepeneur'} 
    phone={'https://www.discogs.com/user/ssrl4000'} 
    email={'https://api.discogs.com/users/ssrl4000'}>
    </UserInfoIcons>


    <HeroImageRight></HeroImageRight>
      <Center maw={400} h={100} mx="auto">
        <SearchForm 
                searchTerm={searchTerm}
                onSearchInput={handleSearchInput}
                onSearchSubmit={handleSearchSubmit}
                >
        </SearchForm>
      </Center>
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
                      <Text align='center' fw={800}>Filter Options</Text>

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
              <List list={filteredVinyls} range={slider} page={vinyls.page} handleNotification={handleNotification} onRemoveItem={handleRemoveVinyl} onPageSelect={handlePagination} onPagesPerPage={handleItemsPerPage}/>
            ) : (
              <List list={sortedList} range={slider} page={vinyls.page} handleNotification={handleNotification} onRemoveItem={handleRemoveVinyl} onPageSelect={handlePagination} onPagesPerPage={handleItemsPerPage}/>
            )
            )}
          </div>

        </Grid.Col>
      </Grid>
      <FooterSocial></FooterSocial>
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
      {notification ? (
      <Affix position={{ bottom: rem(20), left: rem(20) }} id='notification'>
      <Notification title="Bummer :(" onClose={handleNotification}>
        Buying is currently unavailable. You can buy them also on <a href="https://www.discogs.com/user/ssrl4000">Discogs</a>! <Button size='xs' compact onClick={handleNotification}>Close Me!</Button>
      </Notification>
      </Affix>
      ) : (
        <Affix position={{ bottom: rem(20), left: rem(20) }} id='notification' hidden>
        <Notification title="Default notification" >
          This is default notification with title and body
        </Notification>
        </Affix>
      )}
    </ThemeProvider>
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
      isFocused
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

const List: React.FC<ListProps> = ({ list, range, page, onRemoveItem, onPageSelect, onPagesPerPage, handleNotification }) => {

const [sort, setSort] = React.useState('NONE');

const handleSort = (event: React.ChangeEvent<HTMLSelectElement>) => {
  console.log(event.target.value);
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
                <Text fz="xs" c="dimmed" ta="left">Page {page.page}-{page.pages} Showing: {list.length} Items</Text>
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
                <div key={item.release.id}> 
                  <Item key={item.release.id} index={index} item={item} onRemoveItem={onRemoveItem} handleNotification={handleNotification}>
                    <DeleteButton key={index} name={item.release.title} type="button" value='Dismiss' index={index} removeItem={onRemoveItem} item={item}></DeleteButton>
                  </Item>
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

const Item: React.FC<ItemProps> = ({ item, index, onRemoveItem, handleNotification
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
      <CarouselCard item={item} index={index} onRemoveItem={onRemoveItem} new_record={new_record} handleNotification={handleNotification}>

      </CarouselCard>
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


const CarouselCard: React.FC<CarouselProps> = ({ item, index, onRemoveItem, new_record, handleNotification 
}): JSX.Element =>  {
  const { classes } = useStyles();

  const images = []
  for(var i = 0; i < item.release.images.length; i++)
    { 
      if(i > 5)
        break;
      images.push(item.release.images[i].resource_url);
    }

  const slides = images.map((image) => (
    <Carousel.Slide key={image}>
      <Image src={image} height={220} />
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
              {new_record ? (
              <Badge pl={0} size="lg" color="teal" radius="xl" leftSection={avatar}>
                New!
              </Badge>
              ) :(
              <Badge pl={0} size="lg" color="red" radius="xl" leftSection={avatar}>
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
        <DeleteButton name={item.release.title} type="button" value='Dismiss' index={index} removeItem={onRemoveItem} item={item}></DeleteButton>
        <Button radius="md" onClick={handleNotification}>Buy now</Button>
      </Group>
    </Card>
  );
}

const InputWithLabel: React.FC<InputWithLabelProps> = ({
  id, 
  type,
  value,
  onInputChange,
  isFocused,
  children
}) => {

const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isFocused && inputRef.current){
      inputRef.current.focus();
    }
  }, [isFocused]);

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

