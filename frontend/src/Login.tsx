import * as React from 'react';
import axios from 'axios';
import { SimpleGrid, Button, Center, Title} from '@mantine/core';
import { IconLogin } from '@tabler/icons-react';
import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useSearchParams, Link } from "react-router-dom";
import { LoginForm } from './Components/LoginForm';

// Actions and States Defs


export type UserData = {
    email: string;
    id: string;
}

type LoginState = {
    data: any;
    isLoading: boolean;
    isError: boolean;
  }
  
  type LoginFetchInitAction = {
    type: 'LOGIN_FETCH_INIT';
  }
  
  type LoginFetchSuccessAction = {
    type: 'LOGIN_FETCH_SUCCESS';
    payload: any;
  }
  
  type LoginFetchFailureAction = {
    type: 'LOGIN_FETCH_FAILURE';
  }

  type LoginAction = 
    LoginFetchInitAction
    | LoginFetchSuccessAction
    | LoginFetchFailureAction;


const API_ENDPOINT = 'https://api.discogs.com/oauth/access_token'; 

const loginReducer = (
  state: LoginState, action: LoginAction
) => {
  switch (action.type) {
    case 'LOGIN_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'LOGIN_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      }
    case 'LOGIN_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};


export const Login = () => {

  const urlDiscogs = API_ENDPOINT; 
  const SSO = `https://discogs.com/oauth/authorize?oauth_token=${import.meta.env.VITE_OAUTH_TOKEN}`

  const [searchParams, setSearchParams] = useSearchParams();

  let token:string | null = "";
  let verifier:string | null = "";
  if(searchParams !== null)
  {
    token = searchParams.get("oauth_token");
    verifier = searchParams.get("oauth_verifier");
  }  

      /** REDUCER HANDLES USE STATES */
  const [login, dispatchLogin] = React.useReducer(
    loginReducer,
    {data: [], isLoading: false, isError: false}
  );

  var bodyFormData = new FormData();
    const headers = { 
        'Authorization' : 'OAuth oauth_consumer_key="'+import.meta.env.VITE_OAUTH_CONSUMER_KEY+'", oauth_nonce="3baffb76-b6b2-403d-82f3-92ee8d0e45d8", oauth_token="'+ import.meta.env.VITE_OAUTH_TOKEN + '", oauth_signature="' + import.meta.env.VITE_OAUTH_CONSUMER_SECRET + "&" + import.meta.env.VITE_OAUTH_TOKEN_SECRET + '", oauth_signature_method="PLAINTEXT", oauth_timestamp="'+ Math.floor(Date.now()/1000).toString() + '", oauth_verifier="' + verifier + '"', 
        'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/116.0',
        'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
    };

    const data = {};


    const handleLogin = React.useCallback(async () => {

        dispatchLogin({
          type: 'LOGIN_FETCH_INIT',
        });
        try {
          console.log('New API URL: ' + urlDiscogs);
          const result = await axios.post(urlDiscogs, data, { 
            headers: headers
            })
          //Convert JSON to Vinyl and Pagination type
          const res = result.data;
          console.log(result.data.headers['Content-Type']);
    
          dispatchLogin({
            type: 'LOGIN_FETCH_SUCCESS',
            payload: res,
          });
        } catch (error: any) { 
          if(error.response){
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log("No response", error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
          }
          console.log(error.config);
          dispatchLogin({type: 'LOGIN_FETCH_FAILURE'});
        }
      }, [searchParams]);

      //useEffect for API Discogs Fetch
  React.useEffect(() => {
    handleLogin();    
    }, [handleLogin]);

    return (

        <>
        {localStorage.getItem('user') ? (
          <>
          <SimpleGrid 
          cols={3}
              spacing="lg"
              breakpoints={[
                { maxWidth: 'md', cols: 3, spacing: 'md' },
                { maxWidth: 'sm', cols: 2, spacing: 'sm' },
                { maxWidth: 'xs', cols: 1, spacing: 'sm' },
              ]}
          >
            <div></div>
            <div>
            <Alert icon={<IconAlertCircle size="1rem" />} title="Bazinga!" color="blue">
            You are logged in!
            </Alert>
            <br></br><br></br>
            <Center>
                <Button leftIcon={<IconLogin size="1rem" />}><Link to={'/'}>Browse Collection</Link></Button>
            </Center>
            </div>
            <div></div>
          </SimpleGrid>
          </>
        ) : (
          <SimpleGrid 
          cols={4}
              spacing="lg"
              breakpoints={[
                { maxWidth: 'md', cols: 3, spacing: 'md' },
                { maxWidth: 'sm', cols: 2, spacing: 'sm' },
                { maxWidth: 'xs', cols: 1, spacing: 'sm' },
              ]}
          >
              <div></div>
              <div>
                      <LoginForm></LoginForm>
                      <br></br><br></br>
  
                      <Alert icon={<IconAlertCircle size="1rem" />} title="Hey!" color="blue">
                      If you have a Discogs Account, you can log in via Single-Sign On
                      </Alert>
                      <br></br><br></br>
  
                      <Center>
                        <Button leftIcon={<IconLogin size="1rem" />} ><a href={SSO} target='_blank' rel="noopener" aria-label='SSO-Discogs'>SSO via Discogs</a></Button>
                      </Center>
              </div>
              <div> 
              
                <Title order={1}>Not registered? Sign up now!</Title>
              <Center>
                <Link to={'/signup'}>
                    <Button leftIcon={<IconLogin size="1rem" />} >Sign Up</Button>
                  </Link>
              </Center>     
                      
              </div>
  
          </SimpleGrid>
        )}

        </>
    );
};

export default Login