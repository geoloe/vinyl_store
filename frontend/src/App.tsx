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
  data: Stories;
  isLoading: boolean;
  isError: boolean;
}

type StoriesFetchInitAction = {
  type: 'STORIES_FETCH_INIT';
}

type StoriesFetchSuccessAction = {
  type: 'STORIES_FETCH_SUCCESS';
  payload: Stories;
}

type StoriesFetchFailureAction = {
  type: 'STORIES_FETCH_FAILURE';
}

type StoriesRemoveAction = {
  type: 'REMOVE_STORIES';
  payload: Story;
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

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';//'https://api.discogs.com/database/search?q=Nirvana'

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
          (story) => action.payload.objectID !== story.objectID
        ),
      };
    default:
      throw new Error();
  }
};

const App = () => {
  
  const [searchTerm, setSearchTerm] = useStorageState(
    'search',
    'React'
    );

  const [url, setUrl] = React.useState(
    `${API_ENDPOINT}${searchTerm}`
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
    //const headers = { 'Authorization': 'Discogs token=' + 'DeXxTVSPYvYUqQkGyXLpEgNdVGwerOZlQCyGaLEa' };
    
    try {
      const result = await axios.get(url);

      dispatchStories({
        type: 'STORIES_FETCH_SUCCESS',
        payload: result.data.hits,
      });
    } catch { 
      dispatchStories({type: 'STORIES_FETCH_FAILURE'});
    }
  }, [url]);
  
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
    setUrl(`${API_ENDPOINT}${searchTerm}`);

    event.preventDefault();
  }

  const handleRemoveStory = (item: Story) => {
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
            <List list={stories.data} onRemoveItem={handleRemoveStory} />
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
type Story = {
  objectID: string;
  url: string;
  title: string;
  author: string;
  num_comments: number;
  points: number;
};

type Stories = Story[];

type ListProps = {
  list: Stories;
  onRemoveItem: (item: Story) => void;
}

type ItemProps = {
  item: Story;
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
    {list.map((item) => (
        <>
          <Item key={item.objectID} item={item}>
            <Button name={item.objectID} type="button" value='Dismiss' removeItem={onRemoveItem} item={item}></Button>
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
  removeItem: (item: Story) => void;
  item: Story;
}

const Button: React.FC<ButtonProps> = ({name, value, removeItem, item}) =>
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

const Item: React.FC<ItemProps> = ({ item, children 
}): JSX.Element => {

return (
    <>
      <tr key={item.objectID}>
        <td><a href={item.url}>{item.title}</a></td>
        <td>{item.author}</td>
        <td>{item.num_comments}</td>
        <td>{item.points}</td>
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

