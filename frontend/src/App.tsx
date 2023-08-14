import { ThemeProvider } from './ThemeProvider';
import { Loader } from '@mantine/core';
import { Text } from '@mantine/core';
//import { Welcome } from './Welcome/Welcome';

import * as React from 'react';
import axios from 'axios';
//import { CarouselCard } from './Caroussel';
import { Grid } from '@mantine/core';
import { Table } from '@mantine/core';


type StoriesState = {
  data: Listing[];
  isLoading: boolean;
  isError: boolean;
}

type StoriesFetchInitAction = {
  type: 'STORIES_FETCH_INIT';
}

type StoriesFetchSuccessAction = {
  type: 'STORIES_FETCH_SUCCESS';
  payload: Listing[];
}

type StoriesFetchFailureAction = {
  type: 'STORIES_FETCH_FAILURE';
}

type StoriesRemoveAction = {
  type: 'REMOVE_STORIES';
  payload: Listing;
}

type StoriesAction = 
  StoriesFetchInitAction
  | StoriesFetchSuccessAction
  | StoriesFetchFailureAction
  | StoriesRemoveAction;

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

const API_ENDPOINT = 'https://api.discogs.com/users/ssrl4000/inventory?asc'; 

const storiesReducer = (
  state: StoriesState, action: StoriesAction
) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    case 'REMOVE_STORIES':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: state.data.filter(
          (story) => action.payload.release.id !== story.release.id
        ),
      };
    default:
      throw new Error();
  }
};

const App = () => {
  
  const [searchTerm, setSearchTerm] = useStorageState(
    'search',
    'Search'
    );

  const [url, setUrl] = React.useState(
    `${API_ENDPOINT}`
  );

  /** REDUCER HANDLES USE STATES */
  const [stories, dispatchStories] = React.useReducer(
    storiesReducer,
    {data: [], isLoading: false, isError: false}
  );

  const handleFetchStories = React.useCallback(async () => {
    if(!searchTerm) return;

    dispatchStories({
      type: 'STORIES_FETCH_INIT',
    });
    
    try {
      const result = await axios.get(url, {
        headers :
         { 'Authorization': 'Discogs token=' + 'DeXxTVSPYvYUqQkGyXLpEgNdVGwerOZlQCyGaLEa' }
      })
      const arr: Vinyl[] = Object.values(result.data);
      //console.log(arr);
      const newarr: Listing[] = arr[1];
      console.log(newarr);
      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: newarr,
      });
    } catch { 
      dispatchStories({type: 'STORIES_FETCH_FAILURE'});
    }
  }, [url]);

  //console.log(stories.data);
  const filteredStories = stories.data.filter(function (story){   
   if (story.release !== undefined){
    console.log(story);
    return story.release.title.toLowerCase().includes(searchTerm.toLowerCase());
   }
   else{
   console.log("Undefined");
    console.log(story);
   }
  });

  console.log(filteredStories);

  //useEffect
  React.useEffect(() => {
    handleFetchStories();
    }, [handleFetchStories]);

  //useEffect
  React.useEffect(() => {
    localStorage.setItem('search', searchTerm);
    }, [searchTerm]);


  const handleSearchInput = (
    event: React.ChangeEvent<HTMLInputElement>
    ) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (
    event: React.ChangeEvent<HTMLFormElement>
    ) => {
    setUrl(`${API_ENDPOINT}`);

    event.preventDefault();
  }

  const handleRemoveStory = (item: Listing) => {
    dispatchStories({
      type: 'REMOVE_STORIES',
      payload: item,
    });
  };

  return (
    <>
    <ThemeProvider>
      <Grid columns={12}>
        <Grid.Col span="content">    
          <div>
            <h1>My Hacker Stories</h1>

            <SearchForm 
              searchTerm={searchTerm}
              onSearchInput={handleSearchInput}
              onSearchSubmit={handleSearchSubmit}
              >
            </SearchForm>

          <hr />

          {stories.isError && <p>Something went wrong... </p>}

          {stories.isLoading ? (
            <>
              <Text
                variant="gradient"
                gradient={{ from: 'indigo', to: 'cyan', deg: 45 }}
                sx={{ fontFamily: 'Greycliff CF, sans-serif' }}
                ta="center"
                fz="xl"
                fw={700}
              >
                Loading data. Please Wait.
                <Loader />
              </Text>
            </>
          ) : (
            <List list={filteredStories} onRemoveItem={handleRemoveStory} />
          )}
          </div>
        </Grid.Col>
        <Grid.Col span="content">
        </Grid.Col>
      </Grid>
    </ThemeProvider>
    </>
  );
};

//Object Defs


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
  last: string;
  next: string;
}

type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
};

type Vinyls = Vinyl["listings"];

type ListProps = {
  list: Vinyls;
  onRemoveItem: (item: Listing) => void;
}

type ItemProps = {
  item: Listing;
  index: number;
  children: React.ReactNode;
}

type SearchFormProps = {
  searchTerm: string;
  onSearchInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (event: React.ChangeEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}

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

const List: React.FC<ListProps> = ({ list, onRemoveItem }) => {
  const ths = (
    <tr>
      <th>Title</th>
      <th>Author</th>
      <th>Numbre of Comments</th>
      <th>Points</th>
      <th>Toggle</th>
    </tr>
  );

return (
  <Table striped highlightOnHover withBorder withColumnBorders>
    <caption>Hacker news</caption>
    <thead>{ths}</thead>
    <tbody>
    {list.map((item, index) => (
        <>
          <Item key={item.id} index={index} item={item}>
            <Button name={item.release.title} type="button" value='Dismiss' index={index} removeItem={onRemoveItem} item={item}></Button>
          </Item>
        </>
    ))}
    </tbody>
  </Table>
);};

enum ButtonTypes {
  "button",
  "submit",
  "reset",
  undefined
} 

type ButtonProps = {
  name: string;
  type?: string;
  value: string;
  index: number;
  removeItem: (item: Listing) => void;
  item: Listing;
}

const Button: React.FC<ButtonProps> = ({name, value, index, removeItem, item}) =>
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

const Item: React.FC<ItemProps> = ({ item, index, children 
}): JSX.Element => {

return (
    <>
      <tr key={item.release.id}>
        <td><a href={item.release.resource_url}>{item.release.title}</a></td>
        <td>{item.release.artist}</td>
        <td>{item.release.description}</td>
        <td>{item.release.format}</td>
        <td>{children}</td>
      </tr>
    </>
);};

type InputWithLabelProps = {
  id: string;
  value: string;
  type?: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isFocused?: boolean;
  children: React.ReactNode;
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
         />
    </React.Fragment>
);};

export default App

