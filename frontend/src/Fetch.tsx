import * as React from 'react';
import axios from 'axios';
import { discogs_api_token } from './App';
import { Pagination, Listing, Vinyl } from './App';

const API_ENDPOINT = 'https://api.discogs.com/users/ssrl4000/inventory?per_page=100'; 
// Actions and States Defs

type VinylsState = {
    data: Listing[];
    isLoading: boolean;
    isError: boolean;
    page: Pagination;
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
  
  type VinylsAction = 
    VinylsFetchInitAction
    | VinylsFetchSuccessAction
    | VinylsFetchFailureAction
  

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

      default:
        throw new Error();
    }
  };
let allResults: Listing[] = [];

export default function fetchAll() {

    const [page, setPage] = React.useState(1);

      /** REDUCER HANDLES USE STATES */
    const [vinyls, dispatchVinyls] = React.useReducer(
        vinylsReducer,
        {data: [], isLoading: false, isError: false, page: {} as Pagination}
    );

    const [url, setUrl] = React.useState(API_ENDPOINT);
    
  const handleFetchAllVinyls = React.useCallback(async () => {

    dispatchVinyls({
      type: 'VINYLS_FETCH_INIT',
    });
    
    try {
      console.log('New API URL: ' + url);
      const result = await axios.get(url, {
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
  }, [url]);

  console.log("Data:", vinyls.data, "Page nr.", vinyls.page.page)
  
    //useEffect for API Discogs Fetch
    React.useEffect(() => {
        handleFetchAllVinyls();
        if(page < 3){
        setPage(page+1)
        }
        setUrl(`${API_ENDPOINT}&page=${page}`)
    }, [url]);



    vinyls.data.forEach((item) => {
        allResults.push(item);
    });

    return vinyls.isLoading, vinyls.isError, allResults
};