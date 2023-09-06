import { TextInput, Checkbox, Button, Group, Box, PasswordInput, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import axios from 'axios';
import * as React from 'react';
import { IconAlertCircle } from '@tabler/icons-react';



interface Password {
    email: string,
    password: string,
    confirmPassword: string,
    termsOfService: boolean,
}


// Actions and States Defs

type formDataState = {
  data: Password;
  isLoading: boolean;
  isError: boolean;
}

type FormFetchInitAction = {
  type: 'FORM_DATA_FETCH_INIT';
}

type FormFetchSuccessAction = {
  type: 'FORM_DATA_FETCH_SUCCESS';
  payload: Password;
}

type FormFetchFailureAction = {
  type: 'FORM_DATA_FETCH_FAILURE';
}

type VinylsAction = 
  FormFetchInitAction
  | FormFetchSuccessAction
  | FormFetchFailureAction;



const passwordReducer = (
  state: formDataState, action: VinylsAction
) => {
  switch (action.type) {
    case 'FORM_DATA_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'FORM_DATA_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      }
    case 'FORM_DATA_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

export function RegistrationPassword() {

  const [account, setAccount] = React.useState(false);

  const [errorMessage, setErrorMessage] = React.useState('');

    /** REDUCER HANDLES USE STATES */
    const [formData, dispatchFormData] = React.useReducer(
      passwordReducer,
      {data: {} as Password, isLoading: false, isError: false}
    );

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      termsOfService: false,
    },

    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
      confirmPassword: (value, values) =>
        value !== values.password ? 'Passwords did not match' : null,
    },
  });

    const registerUser = (values: Password) => {
      dispatchFormData({
        type: 'FORM_DATA_FETCH_INIT',
      });
        axios.post('http://192.168.2.216:5000/signup', {
            email: values.email,
            password: values.password,
            forgot: true,
        })
        .then(function (response) {
             console.log(response);

             dispatchFormData({
              type: 'FORM_DATA_FETCH_SUCCESS',
              payload: response.data,
            });

            setAccount(true);
        })
        .catch((error: any) => { 
          dispatchFormData({
            type: 'FORM_DATA_FETCH_FAILURE',
          });
          if(error.response){
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            setErrorMessage(error.response.status.toString() + ' ' + error.response.data.error.toString());
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log("No response", error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
          }
        });      
    };
  console.log(form.values);
  return (
  <>
   {account && <>
    <Box maw={300} mx="auto">
    <Alert icon={<IconAlertCircle size="1rem" />} title="Account updated!" color="blue">
      Your account was updated! An email has been sent to you!
    </Alert>
    <br></br>
    </Box>
   </>}

   {errorMessage && 
    <Box maw={300} mx="auto">
    <Alert icon={<IconAlertCircle size="1rem" />} title="Oh oh!" color="red">
        {errorMessage}
      </Alert>
      <br></br>
    </Box>

    }
   
    <Box maw={300} mx="auto">
    
        <form onSubmit={form.onSubmit((values) => registerUser(values))}>
          <TextInput
            withAsterisk
            label="Email"
            placeholder="test@email.com"
            {...form.getInputProps('email')}
          />
          <PasswordInput
            label="Password"
            placeholder="Password"
            {...form.getInputProps('password')}
          />

          <PasswordInput
            mt="sm"
            label="Confirm password"
            placeholder="Confirm password"
            {...form.getInputProps('confirmPassword')}
          />

          <Checkbox
            mt="md"
            label="I agree to sell my privacy"
            {...form.getInputProps('termsOfService', { type: 'checkbox' })}
          />

          <Group position="right" mt="md">
            {formData.isLoading ? (
            <Button type="submit" loading>Submit</Button>
            ): (
            <Button type="submit">Submit</Button>
            )}
          </Group>
        </form>
      </Box>
  </>

  );
}